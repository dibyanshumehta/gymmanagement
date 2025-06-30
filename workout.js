// workout.js
import { auth, db } from "./firebaseconfig.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

let currentUser = null;

// Logout
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Add Workout
document.getElementById("add-workout-btn")?.addEventListener("click", async () => {
  const textarea = document.getElementById("workout-input");
  const workoutText = textarea.value.trim();

  if (!workoutText) return alert("Workout cannot be empty!");
  if (!currentUser) return alert("User not found!");

  try {
    await addDoc(collection(db, "workouts"), {
      uId: currentUser.uid,
      text: workoutText,
      createdAt: serverTimestamp()
    });
    textarea.value = "";
    loadWorkoutRoutine(currentUser.uid);
  } catch (err) {
    console.error("Error adding workout:", err);
    alert("Failed to save workout.");
  }
});

// Auth State
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    loadWorkoutRoutine(user.uid);
    loadNotifications();
  }
});

// Load Workouts
async function loadWorkoutRoutine(uid) {
  const q = query(collection(db, "workouts"), where("uId", "==", uid));
  const querySnapshot = await getDocs(q);
  const list = document.getElementById("workout-list");
  list.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const workout = docSnap.data();
    const workoutId = docSnap.id;

    const box = document.createElement("div");
    box.className = "workout-preview-box";
    box.innerHTML = `
      <p>${workout.text}</p>
      <button class="delete-btn" data-id="${workoutId}">Delete</button>
    `;
    list.appendChild(box);
  });

  // Attach delete listeners
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await deleteDoc(doc(db, "workouts", id));
      loadWorkoutRoutine(uid);
    });
  });
}

// Load Notifications
async function loadNotifications() {
  const list = document.getElementById("notification-list");
  list.innerHTML = "";

  const snapshot = await getDocs(collection(db, "notifications"));
  snapshot.forEach((doc) => {
    const notif = doc.data();
    const box = document.createElement("div");
    box.className = "notification-box";
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