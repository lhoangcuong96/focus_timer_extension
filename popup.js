// Popup Logic - Relying on Background as Source of Truth

// Function to update UI elements
function updateUI(response) {
  if (!response) return;

  // Update Timer Display
  const seconds = response.timeLeft;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    timerElement.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Update Control Buttons (Play/Pause)
  const playIcon = document.getElementById("playIconPopup");
  const pauseIcon = document.getElementById("pauseIconPopup");
  const btnText = document.getElementById("btnText");

  if (playIcon && pauseIcon && btnText) {
    if (response.isRunning) {
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
      btnText.textContent = typeof languageManager !== 'undefined' ? languageManager.t("pause") : "Pause";
    } else {
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
      btnText.textContent = typeof languageManager !== 'undefined' ? languageManager.t("start") : "Start";
    }
  }

  // Update Stats
  const sessionsElement = document.getElementById("sessions");
  const totalTimeElement = document.getElementById("totalTime");

  if (sessionsElement) {
    sessionsElement.textContent = response.sessions || 0;
  }
  if (totalTimeElement) {
    totalTimeElement.textContent = response.totalTime || 0;
  }
}

// Fetch latest state from background
function fetchState() {
  chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    // Check for runtime errors (e.g. background script not ready)
    if (chrome.runtime.lastError) {
      console.warn("Could not fetch state:", chrome.runtime.lastError);
      return;
    }
    updateUI(response);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initial Fetch
    fetchState();

    // Event Listeners
    const toggleBtn = document.getElementById("toggleBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            chrome.runtime.sendMessage({ action: "toggle" });
            // Optimistic update or wait for message? 
            // Better to wait for message update for truth, but fetching immediately is good too.
            setTimeout(fetchState, 50); 
        });
    }

    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            chrome.runtime.sendMessage({ action: "reset" });
            setTimeout(fetchState, 50);
        });
    }

    const openFullscreenBtn = document.getElementById("openFullscreen");
    if (openFullscreenBtn) {
        openFullscreenBtn.addEventListener("click", () => {
            chrome.tabs.create({ url: "index.html" });
        });
    }
});

// Listen for updates from background (Passive Sync)
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateDisplay") {
    // Message contains the state directly
    updateUI(message);
  }
});

// Periodic Polling (Active Sync fallback) - every 1 second
setInterval(() => {
    fetchState();
}, 1000);
