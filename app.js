// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

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
