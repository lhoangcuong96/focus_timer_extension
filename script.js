// State will be synced from background
let timeLeft = 30 * 60;
let isRunning = false;
let currentMode = "focus";
let sessions = 0;
let totalMinutes = 0;

let settings = {
  focus: 30,
  short: 5,
  long: 15,
};

// Load initial state from background
loadStateFromBackground();

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
  // Send toggle request to background
  chrome.runtime.sendMessage({ action: "toggle" });
}

// Load state from background
async function loadStateFromBackground() {
  try {
    const response = await chrome.runtime.sendMessage({ action: "getState" });
    if (response) {
      timeLeft = response.timeLeft || 30 * 60;
      isRunning = response.isRunning || false;
      currentMode = response.currentMode || "focus";
      sessions = response.sessions || 0;
      totalMinutes = response.totalTime || 0;
      if (response.settings) {
        settings = { ...settings, ...response.settings };
      }

      updateDisplay();
      updateUI();
      updateStats();
    }
  } catch (error) {
    console.error("Error loading state:", error);
  }
}

// Update UI based on current state
function updateUI() {
  if (isRunning) {
    document.getElementById("playIcon").style.display = "none";
    document.getElementById("pauseIcon").style.display = "block";
  } else {
    document.getElementById("playIcon").style.display = "block";
    document.getElementById("pauseIcon").style.display = "none";
  }

  // Update mode buttons
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  const activeBtn = document.querySelector(`[data-mode="${currentMode}"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

function updateStats() {
  document.getElementById("sessions").textContent = sessions;
  document.getElementById("totalTime").textContent = totalMinutes;
}

function resetTimer() {
  // Send reset request to background
  chrome.runtime.sendMessage({ action: "reset" });
}

function changeMode(mode) {
  // Don't change mode if clicking the same mode
  if (mode === currentMode) {
    return;
  }

  // If timer is running, show warning
  if (isRunning) {
    const modeKeyMap = {
      focus: "modeFocus",
      short: "modeShortBreak",
      long: "modeLongBreak",
    };

    const currentModeKey = modeKeyMap[currentMode] || "modeFocus";
    const newModeKey = modeKeyMap[mode] || "modeFocus";

    const currentModeName = languageManager.t(currentModeKey);
    const newModeName = languageManager.t(newModeKey);

    const message = `⏰ ${languageManager.t(
      "timerIsRunning"
    )}\n\n${languageManager.t("confirmSwitchMode", {
      currentMode: currentModeName,
      newMode: newModeName,
    })}\n\n${languageManager.t("timerWillReset")}`;
    const confirmed = confirm(message);

    if (!confirmed) {
      return; // User cancelled, keep current mode
    }
  }

  // Send change mode request to background
  chrome.runtime.sendMessage({ action: "changeMode", mode });
}

function playSound() {
  const audio = new Audio(
    "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZPQ0XXrnz365WFAhDmeDwwnAhBSuBzfPaizsIHm+/79+WPBAPV7Hz4K5aFg=="
  );
  audio.play().catch((e) => console.log("Audio play failed:", e));
}

async function openSettings() {
  // Load latest settings from background
  try {
    const response = await chrome.runtime.sendMessage({ action: "getState" });
    if (response && response.settings) {
      settings = { ...settings, ...response.settings };
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }

  document.getElementById("settingsPanel").classList.add("show");
  document.getElementById("overlay").classList.add("show");
  document.getElementById("focusTime").value = settings.focus;
  document.getElementById("shortBreakTime").value = settings.short;
  document.getElementById("longBreakTime").value = settings.long;

  // Set current language in selector
  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.value = languageManager.getCurrentLanguage();
  }
}

function closeSettings() {
  document.getElementById("settingsPanel").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
}

function saveSettings() {
  const newSettings = {
    focus: parseInt(document.getElementById("focusTime").value),
    short: parseInt(document.getElementById("shortBreakTime").value),
    long: parseInt(document.getElementById("longBreakTime").value),
  };

  settings = { ...settings, ...newSettings };

  // Send settings update to background
  chrome.runtime.sendMessage({
    action: "updateSettings",
    settings: newSettings,
  });

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

// Language selector change handler
const languageSelect = document.getElementById("languageSelect");
if (languageSelect) {
  languageSelect.addEventListener("change", async (e) => {
    const selectedLang = e.target.value;
    await languageManager.setLanguage(selectedLang);
    // Page will reload automatically in setLanguage for index.html
  });
}

// Listen for updates from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateDisplay") {
    timeLeft = message.timeLeft || timeLeft;
    isRunning = message.isRunning !== undefined ? message.isRunning : isRunning;
    if (message.currentMode) currentMode = message.currentMode;
    if (message.sessions !== undefined) sessions = message.sessions;
    if (message.totalTime !== undefined) totalMinutes = message.totalTime;

    updateDisplay();
    updateUI();
    updateStats();

    // Handle timer completion
    if (timeLeft <= 0 && !isRunning) {
      playSound();
      if (Notification.permission === "granted") {
        new Notification(`⏰ ${languageManager.t("focusTimer")}`, {
          body: languageManager.t("timeIsUp"),
          icon: "https://cdn-icons-png.flaticon.com/512/2935/2935323.png",
        });
      }
      alert(`⏰ ${languageManager.t("timeIsUp")}`);
    }
  }
});

// Periodically sync with background (every second)
setInterval(() => {
  loadStateFromBackground();
}, 1000);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggleTimer();
  } else if (e.code === "KeyR") {
    resetTimer();
  }
});
