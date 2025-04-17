import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Check if we're on login page
const isIndex = location.pathname.includes("index.html") || location.pathname === "/";

if (isIndex) {
  const form = document.getElementById("auth-form");
  const switchMode = document.getElementById("switch-mode");
  const authButton = document.getElementById("auth-button");

  let isLogin = true;

  switchMode.addEventListener("click", () => {
    isLogin = !isLogin;
    authButton.textContent = isLogin ? "Login" : "Register";
    switchMode.textContent = isLogin ? "Register" : "Login";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          alert("Please verify your email before logging in.");
          return;
        }
      } else {
        const newUser = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(newUser.user);
        alert("Verification email sent. Please verify before logging in.");
        return;
      }

      location.href = "app.html";
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
} else {
  // ============ Inside app.html ============

  const logoutBtn = document.getElementById("logout-btn");
  const pages = document.querySelectorAll(".page");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    const isAdmin = user.email === "sbanik2@students.wcpss.net";
    if (isAdmin) document.getElementById("news-form").style.display = "block";

    document.getElementById("user-email").textContent = user.email;
    loadNews();
  });

  logoutBtn?.addEventListener("click", () => {
    signOut(auth).then(() => location.href = "index.html");
  });

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      pages.forEach((p) => p.classList.add("hidden"));
      document.getElementById(btn.dataset.page).classList.remove("hidden");
    });
  });

  // ========= News =========
  const newsForm = document.getElementById("news-form");
  newsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = document.getElementById("news-text").value;
    await addDoc(collection(db, "news"), {
      text,
      timestamp: Timestamp.now()
    });
    loadNews();
    newsForm.reset();
  });

  async function loadNews() {
    const newsFeed = document.getElementById("news-feed");
    newsFeed.innerHTML = "";
    const snapshot = await getDocs(collection(db, "news"));
    snapshot.forEach((doc) => {
      const p = document.createElement("p");
      p.textContent = doc.data().text;
      newsFeed.appendChild(p);
    });
  }

  // ========= Bell Timer =========
  const bellTimes = ["08:00", "09:30", "11:00", "12:30", "14:00"];
  const timerBox = document.getElementById("timer-box");

  setInterval(() => {
    const now = new Date();
    const next = bellTimes.find((time) => {
      const [h, m] = time.split(":").map(Number);
      const t = new Date();
      t.setHours(h, m, 0, 0);
      return t > now;
    });

    if (!next) return timerBox && (timerBox.textContent = "School's out!");

    const [nh, nm] = next.split(":").map(Number);
    const nextTime = new Date();
    nextTime.setHours(nh, nm, 0);
    const diff = Math.floor((nextTime - now) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    if (timerBox) {
      timerBox.textContent = `Next bell at ${next} in ${mins}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  }, 1000);

  // ========= Chat =========
  const chatForm = document.getElementById("create-chat-form");
  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("chat-name").value;
    const email = document.getElementById("invite-email").value;
    await addDoc(collection(db, "chats"), {
      name,
      invite: email,
      createdAt: Timestamp.now()
    });
    alert("Chat created!");
    chatForm.reset();
  });
}
