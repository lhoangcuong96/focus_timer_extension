let timeLeft = 25 * 60;
let isRunning = false;
let sessions = 0;
let totalTime = 0;
let startTime = null;
let initialTimeLeft = 0;

// Load saved state
chrome.storage.local.get(
  ["timeLeft", "isRunning", "sessions", "totalTime"],
  (data) => {
    if (data.timeLeft !== undefined) timeLeft = data.timeLeft;
    if (data.sessions !== undefined) sessions = data.sessions;
    if (data.totalTime !== undefined) totalTime = data.totalTime;
  }
);

// Timer logic
function startTimer() {
  if (timeLeft <= 0) return;

  startTime = Date.now();
  initialTimeLeft = timeLeft;
  isRunning = true;

  chrome.alarms.create("focusTimer", {
    delayInMinutes: 0,
    periodInMinutes: 1 / 60,
  });
  saveState();
}

function stopTimer() {
  isRunning = false;
  chrome.alarms.clear("focusTimer");
  saveState();
}

function resetTimer() {
  stopTimer();
  timeLeft = 25 * 60;
  saveState();
  notifyUpdate();
}

function saveState() {
  chrome.storage.local.set({
    timeLeft,
    isRunning,
    sessions,
    totalTime,
  });
}

function notifyUpdate() {
  chrome.runtime
    .sendMessage({
      action: "updateDisplay",
      timeLeft,
      isRunning,
    })
    .catch(() => {});

  chrome.runtime
    .sendMessage({
      action: "updateStats",
      sessions,
      totalTime,
    })
    .catch(() => {});
}

// Alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focusTimer" && isRunning) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeLeft = initialTimeLeft - elapsed;

    if (timeLeft < 0) timeLeft = 0;

    if (timeLeft <= 0) {
      stopTimer();
      sessions++;
      totalTime += 25;

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "⏰ Focus Timer",
        message: "Time is up! You have completed 1 focus session.",
        priority: 2,
      });
    }

    saveState();
    notifyUpdate();
  }
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle") {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
    notifyUpdate();
  } else if (message.action === "reset") {
    resetTimer();
  } else if (message.action === "getState") {
    sendResponse({ timeLeft, isRunning, sessions, totalTime });
  }
  return true;
});
