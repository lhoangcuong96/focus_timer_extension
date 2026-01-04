let timeLeft = 30 * 60;
let isRunning = false;
let sessions = 0;
let totalTime = 0;
let startTime = null;
let initialTimeLeft = 0;
let currentMode = "focus";
let settings = {
  focus: 30,
  short: 5,
  long: 15,
};

// Load saved state
chrome.storage.local.get(
  ["timeLeft", "isRunning", "sessions", "totalTime", "currentMode", "settings"],
  (data) => {
    if (data.timeLeft !== undefined) timeLeft = data.timeLeft;
    if (data.isRunning !== undefined) isRunning = data.isRunning;
    if (data.sessions !== undefined) sessions = data.sessions;
    if (data.totalTime !== undefined) totalTime = data.totalTime;
    if (data.currentMode !== undefined) currentMode = data.currentMode;
    if (data.settings) {
      settings = { ...settings, ...data.settings };
    }

    // If timer was running, recalculate timeLeft based on elapsed time
    if (isRunning && data.startTime) {
      const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
      timeLeft = Math.max(0, data.initialTimeLeft - elapsed);
      if (timeLeft <= 0) {
        isRunning = false;
        handleTimerComplete();
      }
    }

    notifyUpdate();
  }
);

// Timer logic
function startTimer() {
  // If timer is at 0, reset to the current mode's default time
  if (timeLeft <= 0) {
    timeLeft = settings[currentMode] * 60;
  }

  startTime = Date.now();
  initialTimeLeft = timeLeft;
  isRunning = true;

  chrome.alarms.create("focusTimer", {
    delayInMinutes: 0,
    periodInMinutes: 1 / 60,
  });
  saveState();
  notifyUpdate();
}

function stopTimer() {
  isRunning = false;
  chrome.alarms.clear("focusTimer");
  saveState();
}

function resetTimer() {
  stopTimer();
  timeLeft = settings[currentMode] * 60;
  saveState();
  notifyUpdate();
}

function changeMode(mode) {
  stopTimer();
  currentMode = mode;
  timeLeft = settings[mode] * 60;
  saveState();
  notifyUpdate();
}

function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  // Update current timer if mode matches
  if (timeLeft <= 0 || !isRunning) {
    timeLeft = settings[currentMode] * 60;
  }
  saveState();
  notifyUpdate();
}

function handleTimerComplete() {
  stopTimer();

  if (currentMode === "focus") {
    sessions++;
    totalTime += settings.focus;
  }

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "⏰ Focus Timer",
    message: "Time is up!",
    priority: 2,
  });

  // Reset timer to default time for the current mode
  timeLeft = settings[currentMode] * 60;
  saveState();
  notifyUpdate();
}

function saveState() {
  chrome.storage.local.set({
    timeLeft,
    isRunning,
    sessions,
    totalTime,
    currentMode,
    settings,
    startTime: isRunning ? startTime : null,
    initialTimeLeft: isRunning ? initialTimeLeft : null,
  });
}

function notifyUpdate() {
  // Send complete state update
  chrome.runtime
    .sendMessage({
      action: "updateDisplay",
      timeLeft,
      isRunning,
      currentMode,
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
      handleTimerComplete();
    } else {
      saveState();
      notifyUpdate();
    }
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
  } else if (message.action === "changeMode") {
    changeMode(message.mode);
  } else if (message.action === "updateSettings") {
    updateSettings(message.settings);
  } else if (message.action === "getState") {
    sendResponse({
      timeLeft,
      isRunning,
      sessions,
      totalTime,
      currentMode,
      settings,
    });
  }
  return true;
});
