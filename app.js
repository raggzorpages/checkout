// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC3nmngH...",
    authDomain: "kleiven-d995b.firebaseapp.com",
    databaseURL: "https://kleiven-d995b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "kleiven-d995b",
    storageBucket: "kleiven-d995b.appspot.com",
    messagingSenderId: "790753027743",
    appId: "1:790753027743:web:ab93c56a9671e6a4e9a4aa",
    measurementId: "G-Q14Q0XLGS6"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  const db = firebase.database();
  const storage = firebase.storage();
  
  // Helper Functions
  function $(id) {
    return document.getElementById(id);
  }
  
  // Page: index.html
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    // Login Logic
    $('login-button').addEventListener('click', () => {
      const username = $('username').value;
      const password = $('password').value;
  
      if (username === 'Admin' && password === 'Cougar') {
        $('login-screen').style.display = 'none';
        $('checkout-screen').style.display = 'block';
      } else {
        alert('Invalid credentials');
      }
    });
  
    // Equipment Search Logic
    $('equipment-search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const resultsDiv = $('search-results');
      resultsDiv.innerHTML = '';
  
      db.ref('equipment').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const equip = childSnapshot.val();
          if (
            equip.name.toLowerCase().includes(query) ||
            (equip.barcode && equip.barcode.includes(query))
          ) {
            const div = document.createElement('div');
            div.textContent = equip.name;
            div.addEventListener('click', () => {
              addToCheckoutList(equip);
            });
            resultsDiv.appendChild(div);
          }
        });
      });
    });
  
    // Add to Checkout List
    function addToCheckoutList(equipment) {
      const listItem = document.createElement('li');
      listItem.textContent = equipment.name;
      $('checkout-list').appendChild(listItem);
    }
  
    // Confirm Checkout
    $('confirm-checkout').addEventListener('click', () => {
      const renterName = $('renter-name').value;
      const renterContact = $('renter-contact').value;
      const fromDate = $('rent-from-date').value;
      const toDate = $('rent-to-date').value;
      const equipmentItems = Array.from($('checkout-list').children).map(
        (li) => li.textContent
      );
  
      const newCheckoutRef = db.ref('checkouts').push();
      newCheckoutRef.set({
        renterName,
        renterContact,
        fromDate,
        toDate,
        equipmentItems,
        active: true,
      });
  
      alert('Checkout confirmed!');
      // Clear fields
      $('checkout-list').innerHTML = '';
      $('renter-name').value = '';
      $('renter-contact').value = '';
      $('rent-from-date').value = '';
      $('rent-to-date').value = '';
    });
  }
  
  // Page: checkouts.html
  if (window.location.pathname.endsWith('checkouts.html')) {
    // Load Checkouts
    db.ref('checkouts').on('value', (snapshot) => {
      const activeList = $('active-checkouts');
      const inactiveList = $('inactive-checkouts');
      activeList.innerHTML = '';
      inactiveList.innerHTML = '';
  
      snapshot.forEach((childSnapshot) => {
        const checkout = childSnapshot.val();
        const listItem = document.createElement('li');
        listItem.textContent = `${checkout.renterName} - ${checkout.fromDate} to ${checkout.toDate}`;
        listItem.addEventListener('click', () => {
          displayCheckoutDetails(checkout);
        });
  
        if (checkout.active) {
          activeList.appendChild(listItem);
        } else {
          inactiveList.appendChild(listItem);
        }
      });
    });
  
    function displayCheckoutDetails(checkout) {
      alert(`Renter: ${checkout.renterName}\nEquipment: ${checkout.equipmentItems.join(', ')}`);
    }
  }
  
  // Page: equipment.html
  if (window.location.pathname.endsWith('equipment.html')) {
    // Add Equipment
    $('add-equipment').addEventListener('click', () => {
      const name = $('equip-name').value;
      const desc = $('equip-desc').value;
      const barcode = $('equip-barcode').value;
      const value = $('equip-value').value;
      const imageFile = $('equip-image').files[0];
  
      if (!name) {
        alert('Name is required');
        return;
      }
  
      const newEquipRef = db.ref('equipment').push();
  
      // Upload Image if exists
      if (imageFile) {
        const storageRef = storage.ref('equipment_images/' + imageFile.name);
        storageRef.put(imageFile).then(() => {
          storageRef.getDownloadURL().then((url) => {
            newEquipRef.set({
              name,
              desc,
              barcode,
              value,
              imageUrl: url,
            });
          });
        });
      } else {
        newEquipRef.set({
          name,
          desc,
          barcode,
          value,
        });
      }
  
      alert('Equipment added!');
      // Clear fields
      $('equip-name').value = '';
      $('equip-desc').value = '';
      $('equip-barcode').value = '';
      $('equip-value').value = '';
      $('equip-image').value = '';
    });
  
    // Search Equipment
    $('equipment-search-bar').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      loadEquipment(query);
    });
  
    // Load Equipment List
    function loadEquipment(searchQuery = '') {
      db.ref('equipment').once('value', (snapshot) => {
        const equipmentList = $('equipment-list');
        equipmentList.innerHTML = '';
  
        snapshot.forEach((childSnapshot) => {
          const equip = childSnapshot.val();
          if (equip.name.toLowerCase().includes(searchQuery)) {
            const listItem = document.createElement('li');
            listItem.textContent = equip.name;
            listItem.addEventListener('click', () => {
              editEquipment(childSnapshot.key, equip);
            });
            equipmentList.appendChild(listItem);
          }
        });
      });
    }
  
    loadEquipment();
  
    // Edit Equipment
    function editEquipment(equipId, equipData) {
      const newName = prompt('Edit Name:', equipData.name) || equipData.name;
      const newDesc = prompt('Edit Description:', equipData.desc) || equipData.desc;
      const newBarcode = prompt('Edit Barcode:', equipData.barcode) || equipData.barcode;
      const newValue = prompt('Edit Value:', equipData.value) || equipData.value;
  
      db.ref('equipment/' + equipId).update({
        name: newName,
        desc: newDesc,
        barcode: newBarcode,
        value: newValue,
      });
  
      alert('Equipment updated!');
      loadEquipment();
    }
  }
  