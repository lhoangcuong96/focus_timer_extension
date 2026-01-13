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

// Promise to track if state is loaded
let stateLoaded = false;
const stateReady = new Promise((resolve) => {
  chrome.storage.local.get(
    ["timeLeft", "isRunning", "sessions", "totalTime", "currentMode", "settings", "blockedSites", "lastActiveDate", "history"],
    (data) => {
      if (data.timeLeft !== undefined) timeLeft = data.timeLeft;
      if (data.isRunning !== undefined) isRunning = data.isRunning;
      sessions = data.sessions || 0;
      totalTime = data.totalTime || 0;
      if (data.currentMode !== undefined) currentMode = data.currentMode;
      if (data.settings) {
        settings = { ...settings, ...data.settings };
      }
      if (data.blockedSites) {
        blockedSites = data.blockedSites;
      }
      
      // Daily Reset Checks
      const today = new Date().toDateString();
      let lastActiveDate = data.lastActiveDate || today;
      let history = data.history || [];

      if (lastActiveDate !== today) {
        // New day! Archive previous stats if there was any activity
        if (sessions > 0 || totalTime > 0) {
          history.unshift({
            date: lastActiveDate,
            sessions: sessions,
            totalTime: totalTime
          });
          
          // Keep history limited to last 30 entries
          if (history.length > 30) {
            history = history.slice(0, 30);
          }
        }
        
        // Reset daily stats
        sessions = 0;
        totalTime = 0;
        lastActiveDate = today;
        
        // We don't call saveState() here to avoid recursion or race before resolved
      }
      
      // Make history available globally
      globalThis.historyData = history;
      globalThis.lastActiveDate = lastActiveDate;

      // If timer was running, recalculate timeLeft based on elapsed time
      if (isRunning && data.startTime) {
        const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
        timeLeft = Math.max(0, data.initialTimeLeft - elapsed);
        if (timeLeft <= 0) {
          isRunning = false;
          // We'll handle timer complete after initialization if needed
        }
      }

      stateLoaded = true;
      resolve();
      
      // Post-load updates
      updateBlockingRules();
      notifyUpdate();
      
      // If we had a pending reset from the daily check, save it now
      if (lastActiveDate === today && (data.lastActiveDate && data.lastActiveDate !== today)) {
          saveState();
      }
    }
  );
});


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
  notifyUpdate();
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
  if (!stateLoaded) return; // Never save before load is complete

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
    lastActiveDate: globalThis.lastActiveDate || new Date().toDateString(),
    history: globalThis.historyData || []
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
chrome.alarms.onAlarm.addListener(async (alarm) => {
  await stateReady; // Wait for state before processing alarm
  
  if (alarm.name === "focusTimer" && isRunning) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeLeft = initialTimeLeft - elapsed;

    if (timeLeft < 0) timeLeft = 0;

    if (timeLeft <= 0) {
      handleTimerComplete();
    } else {
      // Don't save state on every tick to avoid write limits and IO overhead
      // saveState(); 
      notifyUpdate();
    }
  }
});

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Call async handler but return true immediately
  handleMessage(message, sender, sendResponse);
  return true; 
});

async function handleMessage(message, sender, sendResponse) {
  // Crucial: Wait for state to be loaded before processing any commands
  await stateReady;

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
    const result = await addBlockedSite(message.site);
    sendResponse(result);
  } else if (message.action === "removeBlockedSite") {
    const result = await removeBlockedSite(message.site);
    sendResponse(result);
  } else if (message.action === "getBlockedSites") {
    sendResponse({ sites: blockedSites });
  } else if (message.action === "getState") {
    // Construct history with current day's progress if there are sessions
    let displayHistory = [...(globalThis.historyData || [])];
    if (sessions > 0) {
      displayHistory.unshift({
        date: new Date().toDateString(),
        sessions: sessions,
        totalTime: totalTime
      });
    }

    sendResponse({
      timeLeft,
      isRunning,
      sessions,
      totalTime,
      currentMode,
      settings,
      blockedSites,
      history: displayHistory
    });
  }
}

// Context Menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "blockSite",
    title: "Block this site",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "blockSite") {
    await stateReady; // Wait for state
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      const result = await addBlockedSite(domain);
      
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
    } catch (e) {
      console.error("Invalid URL:", e);
    }
  }
});
