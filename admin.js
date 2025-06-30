import { auth, db, storage } from "./firebaseconfig.js";
import {
  doc, getDoc, getDocs, updateDoc, deleteDoc,
  collection, addDoc, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

window.addEventListener("DOMContentLoaded", () => {
  // Tabs
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.style.display = "none");
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).style.display = "block";
    });
  });

  // Auth
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          document.getElementById("admin-name").textContent = userData.name || "Admin";
          await loadMembers();
          await loadNotes();
          await loadFeedbacks();
          await loadRecentPayments();
          await loadNotifications();
          await loadStoreProducts();
        }
      } catch (err) {
        console.error("Admin load error:", err);
      }
    } else {
      window.location.href = "index.html";
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn?.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "index.html");
  });

  // Member Modal
  const viewBtn = document.getElementById("view-members-btn");
  const modal = document.getElementById("member-modal");
  const closeBtn = document.getElementById("close-modal");
  const memberList = document.getElementById("member-list");

  viewBtn?.addEventListener("click", () => {
    modal.classList.remove("hidden");
    populateMemberList();
  });
  closeBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  async function loadMembers() {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const members = snapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(user => user.role === "user");

      document.getElementById("total-members").textContent = members.length;
      return members;
    } catch (err) {
      console.error("Error loading members:", err);
      document.getElementById("total-members").textContent = "0";
      return [];
    }
  }

  async function populateMemberList() {
    memberList.innerHTML = "Loading...";
    const members = await loadMembers();
    memberList.innerHTML = "";

    if (members.length === 0) {
      memberList.innerHTML = "<p>No members found.</p>";
      return;
    }

    members.forEach(member => {
      const li = document.createElement("li");

      const info = document.createElement("div");
      info.innerHTML = `<strong>${member.name}</strong><br><small>${member.email}</small>`;

      const statusBtn = document.createElement("button");
      statusBtn.className = `toggle-btn ${member.status === "active" ? "active" : "inactive"}`;
      statusBtn.textContent = member.status === "active" ? "Active" : "Inactive";

      statusBtn.addEventListener("click", async () => {
        const newStatus = member.status === "active" ? "inactive" : "active";
        await updateDoc(doc(db, "users", member.id), { status: newStatus });
        statusBtn.className = `toggle-btn ${newStatus}`;
        statusBtn.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        member.status = newStatus;
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", async () => {
        if (confirm(`Delete ${member.name}?`)) {
          await deleteDoc(doc(db, "users", member.id));
          li.remove();
          const total = parseInt(document.getElementById("total-members").textContent);
          document.getElementById("total-members").textContent = total - 1;
        }
      });

      const actions = document.createElement("div");
      actions.appendChild(statusBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(info);
      li.appendChild(actions);
      memberList.appendChild(li);
    });
  }

  // Notes
  const noteInput = document.getElementById("note-input");
  const saveNoteBtn = document.getElementById("save-note-btn");
  const viewNotesBtn = document.getElementById("view-notes-btn");
  const noteDisplay = document.getElementById("note-display");
  const noteModal = document.getElementById("note-modal");
  const closeNoteModalBtn = document.getElementById("close-note-modal");

  saveNoteBtn?.addEventListener("click", async () => {
    const noteText = noteInput.value.trim();
    if (!noteText) return alert("Write something first!");

    try {
      await addDoc(collection(db, "notes"), {
        text: noteText,
        createdAt: new Date().toISOString()
      });
      alert("Note saved!");
      noteInput.value = "";
    } catch (err) {
      console.error("Save note error:", err);
      alert("Error saving note.");
    }
  });

  viewNotesBtn?.addEventListener("click", () => {
    noteModal.classList.remove("hidden");
    loadNotes();
  });

  closeNoteModalBtn?.addEventListener("click", () => {
    noteModal.classList.add("hidden");
  });

  async function loadNotes() {
    if (!noteDisplay) return;
    try {
      const notesSnapshot = await getDocs(collection(db, "notes"));
      const notes = notesSnapshot.docs;

      noteDisplay.innerHTML = notes.length ? "" : "<p>No notes found.</p>";

      notes.forEach(docSnap => {
        const { text } = docSnap.data();
        const noteId = docSnap.id;

        const noteDiv = document.createElement("div");
        noteDiv.classList.add("note-item");

        const noteText = document.createElement("p");
        noteText.textContent = `• ${text}`;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "delete-btn";
        delBtn.style.marginLeft = "15px";
        delBtn.addEventListener("click", async () => {
          if (confirm("Delete this note?")) {
            await deleteDoc(doc(db, "notes", noteId));
            loadNotes();
          }
        });

        noteDiv.appendChild(noteText);
        noteDiv.appendChild(delBtn);
        noteDisplay.appendChild(noteDiv);
      });
    } catch (err) {
      console.error("Load notes error:", err);
      noteDisplay.innerHTML = "<p style='color:red;'>Failed to load notes.</p>";
    }
  }

  // Feedback
  const feedbackContainer = document.getElementById("feedback-container");

  async function loadFeedbacks() {
    if (!feedbackContainer) return;
    try {
      const snapshot = await getDocs(collection(db, "feedback"));
      const feedbacks = snapshot.docs.map(doc => doc.data());

      feedbackContainer.innerHTML = feedbacks.length
        ? feedbacks.map(fb => `
          <div class="feedback-box">
            <p><strong>${fb.name}</strong> (${fb.email})</p>
            <p>${fb.message}</p>
          </div>
        `).join("")
        : "<p>No feedback yet.</p>";
    } catch (err) {
      console.error("Load feedback error:", err);
      feedbackContainer.innerHTML = "<p style='color:red;'>Failed to load feedbacks.</p>";
    }
  }

  // Payments
  const openPaymentFormBtn = document.getElementById("open-payment-form");
  const paymentFormContainer = document.getElementById("payment-form-container");
  const paymentForm = document.getElementById("payment-form");
  const paymentPreview = document.getElementById("payment-preview");
  const viewAllPaymentsBtn = document.getElementById("view-all-payments");

  openPaymentFormBtn?.addEventListener("click", () => {
    paymentFormContainer?.classList.toggle("hidden");
  });

  paymentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("payment-name").value.trim();
    const email = document.getElementById("payment-email").value.trim();
    const amount = document.getElementById("payment-amount").value.trim();
    const date = document.getElementById("payment-date").value;
    const method = document.getElementById("payment-method").value.trim();
    const plan = document.getElementById("payment-plan").value.trim();

    if (!name || !email || !amount || !date || !method || !plan) return alert("Fill all fields");

    try {
      await addDoc(collection(db, "payments"), {
        name, email, amount, date, method, plan,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });
      alert("Payment added successfully!");
      paymentForm.reset();
      loadRecentPayments();
    } catch (err) {
      console.error("Add payment error:", err);
      alert("Failed to add payment");
    }
  });

  async function loadRecentPayments(max = 4) {
    try {
      const q = query(collection(db, "payments"), orderBy("createdAt", "desc"), limit(max));
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => doc.data());

      if (!paymentPreview) return;
      paymentPreview.innerHTML = payments.length
        ? payments.map(p => `
          <div class="payment-record">
            <p><strong>${p.name}</strong> (${p.email})</p>
            <p>Amount: ${p.amount} |Date: ${p.date} | Method: ${p.method} | Plan: ${p.plan}</p>
          </div>
        `).join("")
        : "<p>No payment records yet.</p>";
    } catch (err) {
      console.error("Load payments error:", err);
      paymentPreview.innerHTML = "<p style='color:red;'>Failed to load payments.</p>";
    }
  }

  viewAllPaymentsBtn?.addEventListener("click", async () => {
    await loadRecentPayments(100);
  });

  // Notifications
  const sendNotifBtn = document.getElementById("send-notification-btn");
  const notifMsgInput = document.getElementById("notif-message");
  const notifList = document.getElementById("notification-list");

  sendNotifBtn?.addEventListener("click", async () => {
    const message = notifMsgInput.value.trim();
    if (!message) return alert("Please write a message.");

    try {
      await addDoc(collection(db, "notifications"), {
        message,
        createdAt: new Date().toISOString()
      });
      alert("Notification sent!");
      notifMsgInput.value = "";
      loadNotifications();
    } catch (err) {
      console.error("Send notification error:", err);
      alert("Failed to send notification.");
    }
  });

  async function loadNotifications() {
    try {
      const snapshot = await getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc")));
      const notifications = snapshot.docs;

      notifList.innerHTML = notifications.length
        ? ""
        : "<p>No notifications yet.</p>";

      notifications.forEach(docSnap => {
        const data = docSnap.data();
        const notifId = docSnap.id;

        const item = document.createElement("div");
        item.className = "notification-item";

        const message = document.createElement("p");
        message.textContent = data.message;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "delete-btn";
        delBtn.style.marginTop = "6px";

        delBtn.addEventListener("click", async () => {
          if (confirm("Delete this notification?")) {
            await deleteDoc(doc(db, "notifications", notifId));
            loadNotifications();
          }
        });

        item.appendChild(message);
        item.appendChild(delBtn);
        notifList.appendChild(item);
      });

    } catch (err) {
      console.error("Load notifications error:", err);
      notifList.innerHTML = "<p style='color:red;'>Failed to load notifications.</p>";
    }
  }

  // Store Products
  const productForm = document.getElementById("product-form");
  const productPreview = document.getElementById("product-preview");

  productForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("product-name").value.trim();
    const brand = document.getElementById("product-brand").value.trim();
    const expiry = document.getElementById("product-expiry").value;
    const imageFile = document.getElementById("product-image").files[0];

    if (!name || !brand || !expiry || !imageFile) return alert("Please fill all fields!");

    try {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "store"), {
        name,
        brand,
        expiry,
        imageUrl,
        createdAt: new Date().toISOString()
      });

      alert("Product added!");
      productForm.reset();
      loadStoreProducts();
    } catch (err) {
      console.error("Add product error:", err);
      alert("Failed to add product.");
    }
  });

  async function loadStoreProducts() {
    try {
      const snapshot = await getDocs(query(collection(db, "store"), orderBy("createdAt", "desc")));
      const products = snapshot.docs.map(doc => doc.data());

      productPreview.innerHTML = products.length ? "" : "<p>No products yet.</p>";

      products.forEach(p => {
        const box = document.createElement("div");
        box.className = "product-item";
        box.innerHTML = `
          <img src="${p.imageUrl}" alt="${p.name}" width="100" style="border-radius:6px;" />
          <p><strong>Name:</strong> ${p.name}</p>
          <p><strong>Brand:</strong> ${p.brand}</p>
          <p><strong>Expiry:</strong> ${p.expiry}</p>
        `;
        productPreview.appendChild(box);
      });
    } catch (err) {
      console.error("Load products error:", err);
      productPreview.innerHTML = "<p style='color:red;'>Failed to load products.</p>";
    }
  }
});
