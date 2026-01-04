// Load state from chrome.storage
chrome.storage.local.get(
  ["timeLeft", "isRunning", "sessions", "totalTime"],
  (data) => {
    if (data.timeLeft !== undefined) {
      updateDisplay(data.timeLeft);
    }
    if (data.sessions !== undefined) {
      document.getElementById("sessions").textContent = data.sessions;
    }
    if (data.totalTime !== undefined) {
      document.getElementById("totalTime").textContent = data.totalTime;
    }
    if (data.isRunning) {
      document.getElementById("playIconPopup").style.display = "none";
      document.getElementById("pauseIconPopup").style.display = "block";
      document.getElementById("btnText").textContent = "Pause";
    }
  }
);

function updateDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById("timer").textContent = `${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

document.getElementById("toggleBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "toggle" });
});

document.getElementById("resetBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "reset" });
});

document.getElementById("openFullscreen").addEventListener("click", () => {
  chrome.tabs.create({ url: "index.html" });
});

// Listen for updates from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateDisplay") {
    updateDisplay(message.timeLeft);
    if (message.isRunning) {
      document.getElementById("playIconPopup").style.display = "none";
      document.getElementById("pauseIconPopup").style.display = "block";
      document.getElementById("btnText").textContent = "Pause";
    } else {
      document.getElementById("playIconPopup").style.display = "block";
      document.getElementById("pauseIconPopup").style.display = "none";
      document.getElementById("btnText").textContent = "Start";
    }
  }
  if (message.action === "updateStats") {
    document.getElementById("sessions").textContent = message.sessions;
    document.getElementById("totalTime").textContent = message.totalTime;
  }
});
