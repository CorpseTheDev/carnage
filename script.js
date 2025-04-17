import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const isIndex = location.pathname.includes("index.html") || location.pathname === "/";

// LOGIN / REGISTER PAGE
if (isIndex) {
  window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("auth-form");
    const switchMode = document.getElementById("switch-mode");
    const authButton = document.getElementById("auth-button");
    let isLogin = true;

    switchMode.addEventListener("click", (e) => {
      e.preventDefault();
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
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        location.href = "app.html";
      } catch (err) {
        alert("Error: " + err.message);
      }
    });
  });
}

// DASHBOARD (app.html)
else {
  window.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    const pages = document.querySelectorAll(".page");
    const navButtons = document.querySelectorAll(".nav-btn");

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        location.href = "index.html";
        return;
      }

      const isAdmin = user.email === "sbanik2@students.wcpss.net";
      if (isAdmin && document.getElementById("news-form")) {
        document.getElementById("news-form").style.display = "block";
      }

      loadNews();
      startBellTimer();
    });

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => (location.href = "index.html"));
      });
    }

    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        pages.forEach((p) => p.classList.add("hidden"));
        document.getElementById(btn.dataset.page).classList.remove("hidden");
      });
    });

    // 📰 NEWS SYSTEM
    const newsForm = document.getElementById("news-form");
    newsForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = document.getElementById("news-text").value;
      await addDoc(collection(db, "news"), { text, timestamp: new Date() });
      loadNews();
      newsForm.reset();
    });

    async function loadNews() {
      const newsFeed = document.getElementById("news-feed");
      if (!newsFeed) return;
      newsFeed.innerHTML = "";
      const snapshot = await getDocs(collection(db, "news"));
      snapshot.forEach((doc) => {
        const p = document.createElement("p");
        p.textContent = doc.data().text;
        newsFeed.appendChild(p);
      });
    }

    // 🛎️ BELL TIMER
    function startBellTimer() {
      const bellTimes = ["08:00", "09:00", "10:00", "12:00", "14:30"];
      const timerBox = document.getElementById("timer-box");
      if (!timerBox) return;

      setInterval(() => {
        const now = new Date();
        const next = bellTimes.find((time) => {
          const [h, m] = time.split(":").map(Number);
          const bellTime = new Date();
          bellTime.setHours(h, m, 0, 0);
          return bellTime > now;
        });

        if (!next) return (timerBox.textContent = "Done for the day!");

        const [nh, nm] = next.split(":").map(Number);
        const nextTime = new Date();
        nextTime.setHours(nh, nm, 0, 0);
        const diff = Math.floor((nextTime - now) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        timerBox.textContent = `Next Bell at ${next} in ${mins}:${secs
          .toString()
          .padStart(2, "0")}`;
      }, 1000);
    }

    // 💬 CHAT CREATION
    const chatForm = document.getElementById("create-chat-form");
    chatForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("chat-name").value;
      const email = document.getElementById("invite-email").value;
      await addDoc(collection(db, "chats"), { name, invite: email });
      alert("Chat Created!");
      chatForm.reset();
    });
  });
}
