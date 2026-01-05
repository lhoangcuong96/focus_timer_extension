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
let blockedSites = [];

// Load saved state
chrome.storage.local.get(
  ["timeLeft", "isRunning", "sessions", "totalTime", "currentMode", "settings", "blockedSites"],
  (data) => {
    if (data.timeLeft !== undefined) timeLeft = data.timeLeft;
    if (data.isRunning !== undefined) isRunning = data.isRunning;
    if (data.sessions !== undefined) sessions = data.sessions;
    if (data.totalTime !== undefined) totalTime = data.totalTime;
    if (data.currentMode !== undefined) currentMode = data.currentMode;
    if (data.settings) {
      settings = { ...settings, ...data.settings };
    }
    if (data.blockedSites) {
      blockedSites = data.blockedSites;
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

    // Update blocking rules based on current state
    updateBlockingRules();
    notifyUpdate();
  }
);

// Website Blocking Functions
async function enableBlocking() {
  if (blockedSites.length === 0) return;

  // Create rules for both root domain and subdomains
  const rules = [];
  blockedSites.forEach((site, index) => {
    // Rule for root domain (e.g., facebook.com)
    rules.push({
      id: index * 2 + 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*://${site}/*`,
        resourceTypes: ["main_frame"]
      }
    });
    
    // Rule for subdomains (e.g., www.facebook.com, m.facebook.com)
    rules.push({
      id: index * 2 + 2,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*://*.${site}/*`,
        resourceTypes: ["main_frame"]
      }
    });
  });

  try {
    // Get existing dynamic rules to avoid conflicts
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(rule => rule.id);
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
      addRules: rules
    });
    console.log("Blocking enabled for:", blockedSites);
  } catch (error) {
    console.error("Error enabling blocking:", error);
  }
}

async function disableBlocking() {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(rule => rule.id);
    
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds,
        addRules: []
      });
      console.log("Blocking disabled");
    }
  } catch (error) {
    console.error("Error disabling blocking:", error);
  }
}

async function updateBlockingRules() {
  // Only block if timer is running AND in focus mode
  if (isRunning && currentMode === "focus") {
    await enableBlocking();
  } else {
    await disableBlocking();
  }
}

async function addBlockedSite(site) {
  // Normalize the site (remove protocol, www, trailing slashes)
  const normalizedSite = site
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();
  
  if (!normalizedSite || blockedSites.includes(normalizedSite)) {
    return { success: false, message: "Site already blocked or invalid" };
  }
  
  blockedSites.push(normalizedSite);
  await saveBlockedSites();
  await updateBlockingRules();
  return { success: true, sites: blockedSites };
}

async function removeBlockedSite(site) {
  const index = blockedSites.indexOf(site);
  if (index > -1) {
    blockedSites.splice(index, 1);
    await saveBlockedSites();
    await updateBlockingRules();
    return { success: true, sites: blockedSites };
  }
  return { success: false, message: "Site not found" };
}

async function saveBlockedSites() {
  await chrome.storage.local.set({ blockedSites });
}

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
  updateBlockingRules();
  notifyUpdate();
}

function stopTimer() {
  isRunning = false;
  chrome.alarms.clear("focusTimer");
  saveState();
  updateBlockingRules();
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
  updateBlockingRules();
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
    blockedSites,
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
  } else if (message.action === "addBlockedSite") {
    addBlockedSite(message.site).then(result => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  } else if (message.action === "removeBlockedSite") {
    removeBlockedSite(message.site).then(result => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  } else if (message.action === "getBlockedSites") {
    sendResponse({ sites: blockedSites });
  } else if (message.action === "getState") {
    sendResponse({
      timeLeft,
      isRunning,
      sessions,
      totalTime,
      currentMode,
      settings,
      blockedSites,
    });
  }
  return true;
});

// Context Menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "blockSite",
    title: "Block this site",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "blockSite") {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      addBlockedSite(domain).then((result) => {
        if (result.success) {
          // Show notification
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "Focus Timer",
            message: `Blocked ${domain}`,
            priority: 2,
          });
        }
      });
    } catch (e) {
      console.error("Invalid URL:", e);
    }
  }
});
