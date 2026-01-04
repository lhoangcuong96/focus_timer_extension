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

// Tasks management
let tasks = [];
let editingTaskId = null;

// Load initial state from background
loadStateFromBackground();

// Load background image from storage or load new one on first use
async function loadSavedBackground() {
  try {
    const data = await chrome.storage.local.get(["backgroundImage"]);
    if (data.backgroundImage) {
      // Use saved background
      document.body.style.backgroundImage = `url('${data.backgroundImage}')`;
    } else {
      // First time use - load a background image
      await loadInitialBackground();
    }
  } catch (error) {
    console.error("Error loading saved background:", error);
    // Fallback to default gradient
    document.body.style.backgroundImage =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }
}

// Load initial background image (first time use, doesn't count toward limit)
async function loadInitialBackground() {
  try {
    // Get API key from config
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
    const photoData = await response.json();
    const imageUrl = photoData.urls.regular;

    // Update background
    document.body.style.backgroundImage = `url('${imageUrl}')`;

    // Save background (but don't update change count - this is initial load)
    await chrome.storage.local.set({
      backgroundImage: imageUrl,
    });
  } catch (error) {
    console.error("Error loading initial background:", error);
    // Fallback to default gradient
    document.body.style.backgroundImage =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }
}

// Change background image (limited to 5 times per day)
async function changeBackground() {
  try {
    // Check daily limit
    const data = await chrome.storage.local.get([
      "backgroundChangeCount",
      "backgroundChangeDate",
    ]);

    const today = new Date().toDateString();
    const lastChangeDate = data.backgroundChangeDate || "";
    let changeCount = data.backgroundChangeCount || 0;

    // Reset count if it's a new day
    if (lastChangeDate !== today) {
      changeCount = 0;
    }

    // Check if limit exceeded
    if (changeCount >= 5) {
      const limitMessage =
        typeof languageManager !== "undefined"
          ? languageManager.t("backgroundLimitReached")
          : "You have reached the daily limit of 5 background changes. Please try again tomorrow.";
      alert(limitMessage);
      return;
    }

    // Get API key from config
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
    const photoData = await response.json();
    const imageUrl = photoData.urls.regular;

    // Update background
    document.body.style.backgroundImage = `url('${imageUrl}')`;

    // Save background and update count
    await chrome.storage.local.set({
      backgroundImage: imageUrl,
      backgroundChangeCount: changeCount + 1,
      backgroundChangeDate: today,
    });
  } catch (error) {
    console.error("Error changing background:", error);
    const errorMessage =
      typeof languageManager !== "undefined"
        ? languageManager.t("backgroundChangeError")
        : "Error changing background. Please try again.";
    alert(errorMessage);
  }
}

// Load saved background on page load
loadSavedBackground();

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

// Change background button
const changeBgBtn = document.getElementById("changeBgBtn");
if (changeBgBtn) {
  changeBgBtn.addEventListener("click", changeBackground);
}

// Tasks panel event listeners
const tasksIcon = document.getElementById("tasksIcon");
const tasksPanel = document.getElementById("tasksPanel");
const tasksOverlay = document.getElementById("tasksOverlay");
const closeTasksBtn = document.getElementById("closeTasksBtn");

if (tasksIcon) {
  tasksIcon.addEventListener("click", openTasksPanel);
}

if (closeTasksBtn) {
  closeTasksBtn.addEventListener("click", closeTasksPanel);
}

if (tasksOverlay) {
  tasksOverlay.addEventListener("click", closeTasksPanel);
}

async function openTasksPanel() {
  if (tasksPanel && tasksOverlay) {
    tasksPanel.classList.add("show");
    tasksOverlay.classList.add("show");
    await loadTasks(); // Refresh tasks when opening
  }
}

function closeTasksPanel() {
  if (tasksPanel && tasksOverlay) {
    tasksPanel.classList.remove("show");
    tasksOverlay.classList.remove("show");
    hideAddTaskInput();
  }
}

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

// Tasks Management Functions
async function loadTasks() {
  try {
    const data = await chrome.storage.local.get(["tasks"]);
    if (data.tasks) {
      tasks = data.tasks;
    } else {
      tasks = [];
    }
    renderTasks();
  } catch (error) {
    console.error("Error loading tasks:", error);
    tasks = [];
    renderTasks();
  }
}

async function saveTasks() {
  try {
    await chrome.storage.local.set({ tasks });
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

function renderTasks() {
  const tasksList = document.getElementById("tasksList");
  if (!tasksList) return;

  if (tasks.length === 0) {
    tasksList.innerHTML = `<div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 40px 20px; font-size: 14px;" data-i18n="noTasks">No tasks yet. Add one to get started!</div>`;
    if (typeof languageManager !== "undefined") {
      languageManager.applyTranslations();
    }
    updateTasksBadge();
    return;
  }

  tasksList.innerHTML = tasks
    .map(
      (task) => `
    <div class="task-item ${task.completed ? "completed" : ""}" data-task-id="${
        task.id
      }">
      <div class="task-checkbox ${
        task.completed ? "checked" : ""
      }" data-action="toggle" data-task-id="${task.id}"></div>
      <div class="task-text">${escapeHtml(task.text)}</div>
      <button class="task-delete-btn" data-action="delete" data-task-id="${
        task.id
      }" title="Delete">
        <svg viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `
    )
    .join("");

  // Add event listeners
  tasksList.querySelectorAll("[data-action='toggle']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const taskId = e.target.getAttribute("data-task-id");
      toggleTask(taskId);
    });
  });

  tasksList.querySelectorAll("[data-action='delete']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const taskId = e.target
        .closest("[data-task-id]")
        .getAttribute("data-task-id");
      deleteTask(taskId);
    });
  });

  updateTasksBadge();
}

function updateTasksBadge() {
  const badge = document.getElementById("tasksBadge");
  const incompleteTasks = tasks.filter((t) => !t.completed).length;
  if (badge) {
    if (incompleteTasks > 0) {
      badge.textContent = incompleteTasks;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks();
  renderTasks();
}

function showAddTaskInput() {
  const container = document.getElementById("taskInputContainer");
  const input = document.getElementById("taskInput");
  if (container && input) {
    container.style.display = "block";
    input.value = "";
    editingTaskId = null;
    input.focus();
  }
}

function hideAddTaskInput() {
  const container = document.getElementById("taskInputContainer");
  const input = document.getElementById("taskInput");
  if (container && input) {
    container.style.display = "none";
    input.value = "";
    editingTaskId = null;
  }
}

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    hideAddTaskInput();
    return;
  }

  if (editingTaskId) {
    // Edit existing task
    const task = tasks.find((t) => t.id === editingTaskId);
    if (task) {
      task.text = text;
    }
  } else {
    // Add new task
    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: Date.now(),
    };
    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  hideAddTaskInput();
}

// Initialize tasks when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    initTaskEvents();
  });
} else {
  loadTasks();
  initTaskEvents();
}

function initTaskEvents() {
  const addTaskBtn = document.getElementById("addTaskBtn");
  const saveTaskBtn = document.getElementById("saveTaskBtn");
  const cancelTaskBtn = document.getElementById("cancelTaskBtn");
  const taskInput = document.getElementById("taskInput");

  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", showAddTaskInput);
  }

  if (saveTaskBtn) {
    saveTaskBtn.addEventListener("click", addTask);
  }

  if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener("click", hideAddTaskInput);
  }

  if (taskInput) {
    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addTask();
      } else if (e.key === "Escape") {
        hideAddTaskInput();
      }
    });
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Don't trigger shortcuts when user is typing in input fields
  const activeElement = document.activeElement;
  const isInputFocused =
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.isContentEditable);

  if (isInputFocused) {
    return; // Allow normal input behavior
  }

  if (e.code === "Space") {
    e.preventDefault();
    toggleTimer();
  } else if (e.code === "KeyR") {
    resetTimer();
  }
});
