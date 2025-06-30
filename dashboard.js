import { auth, db } from './firebaseconfig.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';

import {
  doc,
  getDoc,
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

// Show username and membership status
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      document.getElementById('username').textContent = data.name || 'User';
      document.getElementById('membership-status').textContent = data.status || 'Active';
    } else {
      alert('User data not found');
    }
  } else {
    window.location.href = 'index.html';
  }
});

// Logout Button
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

// Load notifications
async function loadNotifications() {
  const list = document.getElementById('notification-list');
  list.innerHTML = '';

  const snapshot = await getDocs(collection(db, 'notifications'));
  snapshot.forEach((doc) => {
    const notif = doc.data();
    const box = document.createElement('div');
    box.className = 'notification-box';
    box.innerHTML = `
      <p>${notif.message}</p>
    `;
    list.appendChild(box);
  });
}

loadNotifications();


// Toggle sidebar for mobile
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');
const closeBtn = document.querySelector('.close-btn');

if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.add('show');
  });
}

if (closeBtn && sidebar) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('show');
  });
}

// Toggle notifications panel on mobile
const notifToggle = document.getElementById('notif-toggle');
const notifPanel = document.querySelector('.notification-section');

if (notifToggle && notifPanel) {
  notifToggle.addEventListener('click', () => {
    notifPanel.classList.toggle('show');
  });
}

