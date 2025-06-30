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
    loadStoreItems();
  }
});

// Logout handler
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Load Store Products
async function loadStoreItems() {
  const querySnapshot = await getDocs(collection(db, "storeItems"));
  const list = document.getElementById("store-list");

  querySnapshot.forEach((doc) => {
    const item = doc.data();
    const box = document.createElement("div");
    box.className = "store-box";
    box.innerHTML = `
      <p><strong>Item:</strong> ${item.name}</p>
      <p><strong>Price:</strong> ₹${item.price}</p>
      <p><strong>Description:</strong> ${item.description}</p>
    `;
    list.appendChild(box);
  });
}

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