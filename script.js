import { auth, db } from "./firebaseconfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Show/hide logic
const loginBox = document.getElementById("login-box");
const registerBox = document.getElementById("register-box");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");

showRegister.addEventListener("click", () => {
  loginBox.style.display = "none";
  registerBox.style.display = "block";
});

showLogin.addEventListener("click", () => {
  loginBox.style.display = "block";
  registerBox.style.display = "none";
});

// Registration
const registerBtn = document.getElementById("register-btn");
registerBtn.addEventListener("click", async () => {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data with default role 'user' and status 'active'
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: "user",
      status: "active", // ✅ Added
      createdAt: new Date().toISOString()
    });

    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
});

// Login
const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const role = userData?.role || "user";
      console.log("Logged in user role:", role);

      window.location.href = role === "admin" ? "admin.html" : "dashboard.html";
    } else {
      alert("User data not found in Firestore.");
    }

  } catch (error) {
    alert(error.message);
    console.error("Login error:", error);
  }
});

// Google Auth
const provider = new GoogleAuthProvider();

const loginGoogle = document.getElementById("login-google");
const registerGoogle = document.getElementById("register-google");

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    let role = "user";

    if (!docSnap.exists()) {
      // New Google user, set default role and status
      await setDoc(docRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "user",
        status: "active", // ✅ Added
        createdAt: new Date().toISOString()
      });
    } else {
      const userData = docSnap.data();
      role = userData?.role || "user";
    }

    console.log("Google login user role:", role);

    window.location.href = role === "admin" ? "admin.html" : "dashboard.html";

  } catch (error) {
    alert(error.message);
    console.error("Google Sign-in error:", error);
  }
};

// Redirect User Based on Role
async function redirectUser(user){
  try{
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";

    if (role == "admin"){
      window.location.href = "admin.html";
    } else{
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    console.error("Redirected failed:", error);
    alert ("Something went wrong. Try again.");
  }
}

loginGoogle.addEventListener("click", signInWithGoogle);
registerGoogle.addEventListener("click", signInWithGoogle);