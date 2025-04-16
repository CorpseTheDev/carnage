import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABX6KqxfOnOMIdmY8uTYhCQLbZkDosHuM",
  authDomain: "carnagehub.firebaseapp.com",
  projectId: "carnagehub",
  storageBucket: "carnagehub.firebasestorage.app",
  messagingSenderId: "27345898203",
  appId: "1:27345898203:web:d8ac74045d0d1c761f1afe",
  measurementId: "G-TQM69RF9V8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
