import { auth, db } from "./firebaseconfig.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Check user auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("add-diet-btn").addEventListener("click", () => addDietLog(user.uid));
    loadDietLog(user.uid);
    loadNotifications();
  }
});

// Logout handler
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Add Diet Log to Firestore
async function addDietLog(uid) {
  const input = document.getElementById("diet-input");
  const text = input.value.trim();

  if (text === "") return alert("Please enter your diet details.");

  try {
    await addDoc(collection(db, "dietLogs"), {
      uid,
      text,
      timestamp: serverTimestamp()
    });

    input.value = "";
    loadDietLog(uid); // reload after adding
  } catch (error) {
    console.error("Error adding diet log:", error);
  }
}

// Load Diet Log from Firestore
async function loadDietLog(uid) {
  const preview = document.getElementById("diet-preview");
  preview.innerHTML = "";

  const q = query(collection(db, "dietLogs"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnapshot) => {
    const diet = docSnapshot.data();
    const box = document.createElement("div");
    box.className = "diet-preview-box";
    box.innerHTML = `
      <p>${diet.text}</p>
      <button class="delete-btn" data-id="${docSnapshot.id}">Delete</button>
      <hr>
    `;
    preview.appendChild(box);
  });

  // Attach delete button event listeners
  document.querySelectorAll('.delete-diet-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const docId = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this diet entry?")) {
        await deleteDietLog(docId);
      }
    });
  });
}

// Delete Diet Log
async function deleteDietLog(docId) {
  try {
    await deleteDoc(doc(db, "dietLogs", docId));
    const user = auth.currentUser;
    if (user) loadDietLog(user.uid);
  } catch (error) {
    console.error("Error deleting diet log:", error);
  }
}

// Load Notifications from Firestore
async function loadNotifications() {
  const list = document.getElementById('notification-list');
  list.innerHTML = '';

  const snapshot = await getDocs(collection(db, 'notifications'));
  snapshot.forEach((doc) => {
    const notif = doc.data();
    const box = document.createElement('div');
    box.className = 'notification-box';
    box.innerHTML = `<p>${notif.message}</p>`;
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