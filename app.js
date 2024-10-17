// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyC3nmngHjP8vAlkfr_T9cw52ZyyJyoWmKU",
    authDomain: "kleiven-d995b.firebaseapp.com",
    databaseURL: "https://kleiven-d995b-default-rtdb.europe-west1.firebasedatabase.app",  // Ensure correct region
    projectId: "kleiven-d995b",
    storageBucket: "kleiven-d995b.appspot.com",
    messagingSenderId: "790753027743",
    appId: "1:790753027743:web:ab93c56a9671e6a4e9a4aa",
    measurementId: "G-Q14Q0XLGS6"
  };

  firebase.initializeApp(firebaseConfig);

  // Initialize services
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  // Elements
const loginScreen = document.getElementById('login-screen');
const checkoutScreen = document.getElementById('checkout-screen');
const loginBtn = document.getElementById('login-btn');

// Login functionality
loginBtn.addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Use Firebase Authentication to sign in
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User signed in
            const user = userCredential.user;

            // Hide login screen and show checkout screen
            loginScreen.style.display = 'none';
            checkoutScreen.style.display = 'block';
        })
        .catch((error) => {
            // Handle errors (wrong password, user not found, etc.)
            alert(error.message);
        });
});

// Simple Authentication (Replace with Firebase Auth if needed)
const loginScreen = document.getElementById('login-screen');
const checkoutScreen = document.getElementById('checkout-screen');
const loginBtn = document.getElementById('login-btn');

loginBtn.addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'Admin' && password === 'Cougar') {
        loginScreen.style.display = 'none';
        checkoutScreen.style.display = 'block';
    } else {
        alert('Invalid login credentials');
    }
});

// Equipment Checkout Logic
const equipmentSearch = document.getElementById('equipment-search');
const equipmentList = document.getElementById('equipment-list');
const submitCheckout = document.getElementById('submit-checkout');

equipmentSearch.addEventListener('input', async function() {
    const query = equipmentSearch.value.toLowerCase();
    const snapshot = await db.collection('equipment').where('name', '>=', query).get();
    let results = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        results += `<option value="${data.name}">${data.name} (${data.barcode})</option>`;
    });
    equipmentList.innerHTML = results;
});

submitCheckout.addEventListener('click', async function() {
    const name = document.getElementById('customer-name').value;
    const contact = document.getElementById('contact-info').value;
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;

    const equipment = equipmentList.value;

    if (name && contact && fromDate && toDate && equipment) {
        await db.collection('checkouts').add({
            customer: name,
            contact,
            fromDate,
            toDate,
            equipment,
            active: true
        });
        alert('Checkout successful');
    } else {
        alert('Please fill out all fields');
    }
});

// Equipment Management Logic
const addEquipmentBtn = document.getElementById('add-equipment-btn');
const addEquipmentForm = document.getElementById('add-equipment-form');
const submitEquipment = document.getElementById('submit-equipment');
const equipmentSearchBar = document.getElementById('equipment-search');

addEquipmentBtn.addEventListener('click', function() {
    addEquipmentForm.style.display = 'block';
});

submitEquipment.addEventListener('click', async function() {
    const name = document.getElementById('equipment-name').value;
    const description = document.getElementById('equipment-description').value;
    const barcode = document.getElementById('equipment-barcode').value;
    const value = document.getElementById('equipment-value').value;

    const file = document.getElementById('equipment-image').files[0];
    let imageUrl = '';

    if (file) {
        const storageRef = storage.ref(`images/${file.name}`);
        const snapshot = await storageRef.put(file);
        imageUrl = await snapshot.ref.getDownloadURL();
    }

    if (name) {
        await db.collection('equipment').add({
            name,
            description,
            barcode,
            value,
            imageUrl
        });
        alert('Equipment added successfully');
    } else {
        alert('Name is required');
    }
});

// Loading equipment list
async function loadEquipmentList() {
    const snapshot = await db.collection('equipment').get();
    let results = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        results += `<div>${data.name} (${data.barcode})</div>`;
    });
    document.getElementById('equipment-list').innerHTML = results;
}

equipmentSearchBar.addEventListener('input', loadEquipmentList);
