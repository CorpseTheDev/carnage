import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- LOGIN AND REGISTRATION ---
document.getElementById("registerBtn")?.addEventListener("click", () => {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user.sendEmailVerification().then(() => {
        alert("✅ Verification email sent. Please check your inbox!");
      });
    })
    .catch((error) => alert(error.message));
});

document.getElementById("loginBtn")?.addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        window.location.href = "app.html";
      } else {
        alert("⚠️ Please verify your email before logging in.");
        signOut(auth);
      }
    })
    .catch((error) => alert(error.message));
});

// --- BELL SCHEDULE ---
const bellSchedule = [
  { period: "Homeroom", start: "07:30", end: "07:45" },
  { period: "Period 1", start: "07:50", end: "08:35" },
  { period: "Period 2", start: "08:40", end: "09:25" },
  { period: "Lunch", start: "11:30", end: "12:00" },
  // Add or remove periods as needed
];

function updateBellTimer() {
  const now = new Date();
  bellSchedule.forEach((period, index) => {
    const startTime = new Date(now.setHours(...period.start.split(":").map(Number)));
    const endTime = new Date(now.setHours(...period.end.split(":").map(Number)));

    // Check if current time is within this period
    if (now >= startTime && now <= endTime) {
      const remainingTime = endTime - now;
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      document.getElementById("timer").textContent = `${minutes}m ${seconds}s remaining in ${period.period}`;
    }
  });
}

// --- NEWS SYSTEM (Admin only) ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email === "sbanik2@students.wcpss.net") {
      // Admin functionality to post news
      document.getElementById("newsPostBtn")?.addEventListener("click", () => {
        const newsContent = document.getElementById("newsContent").value;
        addDoc(collection(db, "news"), {
          content: newsContent,
          timestamp: new Date()
        }).then(() => {
          alert("✅ News posted successfully!");
        }).catch((error) => alert("Error posting news: " + error.message));
      });
    }
  }
});

// --- CHAT SYSTEM (Create and invite) ---
document.getElementById("createChatBtn")?.addEventListener("click", () => {
  const chatName = document.getElementById("chatName").value;
  const userEmail = document.getElementById("chatInviteEmail").value;

  addDoc(collection(db, "chats"), {
    name: chatName,
    createdBy: auth.currentUser.email,
    invitedUsers: [userEmail]
  }).then(() => {
    alert("✅ Chat created and invitation sent!");
  }).catch((error) => alert("Error creating chat: " + error.message));
});

// --- FIREBASE STATE CHECK ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // If user is logged in, show the dashboard
    window.location.href = "app.html";
  } else {
    // If user isn't logged in, show login page
    window.location.href = "index.html";
  }
});
