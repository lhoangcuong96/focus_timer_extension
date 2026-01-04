let timeLeft = 30 * 60;
let isRunning = false;
let interval = null;
let currentMode = "focus";
let sessions = 0;
let totalMinutes = 0;

let settings = {
  focus: 30,
  short: 5,
  long: 15,
};

// Load background image
async function loadBackground() {
  try {
    // Get API key from config (must be loaded before this script)
    const apiKey =
      typeof CONFIG !== "undefined" && CONFIG.UNSPLASH_API_KEY
        ? CONFIG.UNSPLASH_API_KEY
        : null;

    if (!apiKey) {
      throw new Error("Unsplash API key not found. Please check config.js");
    }

    const response = await fetch(
      "https://api.unsplash.com/photos/random?query=landscape",
      {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      }
    );
    const data = await response.json();
    const imageUrl = data.urls.regular;
    document.body.style.backgroundImage = `url('${imageUrl}')`;
  } catch (error) {
    console.error("Error loading background:", error);
    // Fallback to a default background
    document.body.style.backgroundImage =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }
}

loadBackground();

// Request notification permission
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function updateDisplay() {
  document.getElementById("timer").textContent = formatTime(timeLeft);
}

function toggleTimer() {
  isRunning = !isRunning;

  if (isRunning) {
    document.getElementById("playIcon").style.display = "none";
    document.getElementById("pauseIcon").style.display = "block";
    startTimer();
  } else {
    document.getElementById("playIcon").style.display = "block";
    document.getElementById("pauseIcon").style.display = "none";
    clearInterval(interval);
  }
}

function startTimer() {
  // If timer is at 0, reset to the current mode's default time
  if (timeLeft <= 0) {
    timeLeft = settings[currentMode] * 60;
    updateDisplay();
  }

  const startTime = Date.now();
  const initialTimeLeft = timeLeft;

  interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeLeft = initialTimeLeft - elapsed;

    if (timeLeft < 0) timeLeft = 0;

    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(interval);
      isRunning = false;
      document.getElementById("playIcon").style.display = "block";
      document.getElementById("pauseIcon").style.display = "none";

      playSound();

      if (currentMode === "focus") {
        sessions++;
        totalMinutes += settings.focus;
        document.getElementById("sessions").textContent = sessions;
        document.getElementById("totalTime").textContent = totalMinutes;
      }

      if (Notification.permission === "granted") {
        new Notification("⏰ Focus Timer", {
          body: "Time is up!",
          icon: "https://cdn-icons-png.flaticon.com/512/2935/2935323.png",
        });
      }
      alert("⏰ Time is up!");

      // Reset timer to default time for the current mode after session ends
      timeLeft = settings[currentMode] * 60;
      updateDisplay();
    }
  }, 100);
}

function resetTimer() {
  clearInterval(interval);
  isRunning = false;
  document.getElementById("playIcon").style.display = "block";
  document.getElementById("pauseIcon").style.display = "none";
  timeLeft = settings[currentMode] * 60;
  updateDisplay();
}

function changeMode(mode) {
  // Don't change mode if clicking the same mode
  if (mode === currentMode) {
    return;
  }

  // If timer is running, show warning
  if (isRunning) {
    const modeNames = {
      focus: "Focus",
      short: "Short Break",
      long: "Long Break",
    };

    const currentModeName = modeNames[currentMode] || currentMode;
    const newModeName = modeNames[mode] || mode;

    const confirmed = confirm(
      `⏰ Timer is running!\n\nAre you sure you want to switch from "${currentModeName}" to "${newModeName}"?\n\nThe current timer will be stopped and reset.`
    );

    if (!confirmed) {
      return; // User cancelled, keep current mode
    }
  }

  clearInterval(interval);
  isRunning = false;
  document.getElementById("playIcon").style.display = "block";
  document.getElementById("pauseIcon").style.display = "none";
  currentMode = mode;
  timeLeft = settings[mode] * 60;
  updateDisplay();

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
}

function playSound() {
  const audio = new Audio(
    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZPQ0XXrnz365WFAhDmeDwwnAhBSuBzfPaizsIHm+/79+WPBAPV7Hz4K5aFg=="
  );
  audio.play().catch((e) => console.log("Audio play failed:", e));
}

function openSettings() {
  document.getElementById("settingsPanel").classList.add("show");
  document.getElementById("overlay").classList.add("show");
  document.getElementById("focusTime").value = settings.focus;
  document.getElementById("shortBreakTime").value = settings.short;
  document.getElementById("longBreakTime").value = settings.long;
}

function closeSettings() {
  document.getElementById("settingsPanel").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
}

function saveSettings() {
  settings.focus = parseInt(document.getElementById("focusTime").value);
  settings.short = parseInt(document.getElementById("shortBreakTime").value);
  settings.long = parseInt(document.getElementById("longBreakTime").value);

  if (currentMode === "focus") timeLeft = settings.focus * 60;
  else if (currentMode === "short") timeLeft = settings.short * 60;
  else timeLeft = settings.long * 60;

  updateDisplay();
  closeSettings();
}

// Event listeners
document.getElementById("playPauseBtn").addEventListener("click", toggleTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
document.getElementById("settingsIcon").addEventListener("click", openSettings);
document.getElementById("overlay").addEventListener("click", closeSettings);
document.getElementById("saveBtn").addEventListener("click", saveSettings);
document.getElementById("cancelBtn").addEventListener("click", closeSettings);

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    changeMode(btn.dataset.mode);
  });
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggleTimer();
  } else if (e.code === "KeyR") {
    resetTimer();
  }
});
