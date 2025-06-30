import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAubDvNJ8XQBESNnpgeyJEKb26Sbj1ZEsg",
    authDomain: "anytimefitness-gym.firebaseapp.com",
    projectId: "anytimefitness-gym",
    storageBucket: "anytimefitness-gym.firebasestorage.app",
    messagingSenderId: "555309497587",
    appId: "1:555309497587:web:385f7126b1d68cac290b86",
    measurementId: "G-9MEZ1BRE3T"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);


  export { auth, db, storage };