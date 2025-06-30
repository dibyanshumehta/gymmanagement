import { auth, db } from "./firebaseconfig.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {  
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Check user auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadPayments(user.email);
  }
});

// Logout handler
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Load Payments
async function loadPayments(userEmail) {
  const snapshot = await getDocs(collection(db, "payments"));
  const list = document.getElementById("payments-list");
  list.innerHTML = "";

  const filteredPayments = snapshot.docs.filter(doc => doc.data().email === userEmail);

  if (filteredPayments.length === 0) {
    list.innerHTML = "<p style='color:gray;'>No payment history found.</p>";
    return;
  }

  filteredPayments.forEach((doc) => {
    const payment = doc.data();
    const box = document.createElement("div");
    box.className = "payment-box";
    box.innerHTML = `
      <p><strong>Amount:</strong> ₹${payment.amount}</p>
      <p><strong>Date:</strong> ${payment.date}</p>
      <p><strong>Method:</strong> ${payment.method}</p>
      <p><strong>Plan:</strong> ${payment.plan}</p>
    `;
    list.appendChild(box);
  });
}

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