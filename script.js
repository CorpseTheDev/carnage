import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Auth
const authForm = document.getElementById("auth-form");
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in!");
  } catch {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created!");
  }
});

// News
const postNewsForm = document.getElementById("post-news-form");
const newsContainer = document.getElementById("news-container");

postNewsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = e.target[0].value;
  await addDoc(collection(db, "news"), {
    content,
    timestamp: new Date()
  });
  e.target[0].value = "";
  loadNews();
});

async function loadNews() {
  const querySnapshot = await getDocs(collection(db, "news"));
  newsContainer.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const p = document.createElement("p");
    p.textContent = doc.data().content;
    newsContainer.appendChild(p);
  });
}

loadNews();

// Bell Schedule
const bellList = [
  { name: "Period 1", time: "08:00" },
  { name: "Period 2", time: "09:00" },
  { name: "Lunch", time: "12:00" },
  { name: "End of Day", time: "15:00" },
];

function updateBellTimer() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let next = null;
  for (let bell of bellList) {
    const [h, m] = bell.time.split(":").map(Number);
    const total = h * 60 + m;
    if (total > nowMinutes) {
      next = bell;
      break;
    }
  }

  const timerEl = document.getElementById("timer");
  if (next) {
    const [h, m] = next.time.split(":".map(Number));
    const bellTime = new Date();
    bellTime.setHours(h, m, 0, 0);
    const diff = Math.floor((bellTime - now) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    timerEl.textContent = `${next.name} in ${mins}:${secs.toString().padStart(2, "0")}`;
  } else {
    timerEl.textContent = "School's out!";
  }
}

setInterval(updateBellTimer, 1000);
