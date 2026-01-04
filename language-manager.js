// Language Manager for Focus Timer Extension
class LanguageManager {
  constructor() {
    this.currentLanguage = "en"; // Default: English
    this.translations = translations;
  }

  // Initialize language from storage
  async init() {
    try {
      const data = await chrome.storage.local.get(["language"]);
      if (data.language && this.translations[data.language]) {
        this.currentLanguage = data.language;
      }
      this.applyTranslations();
    } catch (error) {
      console.error("Error initializing language:", error);
      this.applyTranslations();
    }
  }

  // Get translation by key
  t(key, params = {}) {
    const translation =
      this.translations[this.currentLanguage][key] ||
      this.translations["en"][key] ||
      key;

    // Replace placeholders like {currentMode}, {newMode}
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }

  // Set language and save to storage
  async setLanguage(lang) {
    if (!this.translations[lang]) {
      console.error("Language not supported:", lang);
      return;
    }

    this.currentLanguage = lang;
    try {
      await chrome.storage.local.set({ language: lang });

      // Reload the page to apply language changes
      if (
        window.location.pathname.includes("index.html") ||
        window.location.href.includes("index.html")
      ) {
        window.location.reload();
      } else {
        // For popup or other pages, just reapply translations
        this.applyTranslations();
      }
    } catch (error) {
      console.error("Error setting language:", error);
    }
  }

  // Apply translations to all elements with data-i18n attribute
  applyTranslations() {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = this.t(key);

      // Handle placeholder elements
      if (element.hasAttribute("data-i18n-placeholder")) {
        element.placeholder = translation;
      } else if (
        element.tagName === "INPUT" &&
        element.type !== "button" &&
        element.type !== "submit"
      ) {
        // Don't change input values, only placeholders
      } else {
        element.textContent = translation;
      }
    });

    // Update title
    const titleElement = document.querySelector("title");
    if (titleElement) {
      titleElement.textContent = this.t("focusTimer") + " - Pomodoro";
    }

    // Update html lang attribute
    document.documentElement.lang = this.currentLanguage;
  }

  // Get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Get available languages
  getAvailableLanguages() {
    return Object.keys(this.translations).map((code) => ({
      code,
      name: this.getLanguageName(code),
    }));
  }

  // Get language name
  getLanguageName(code) {
    const names = {
      en: "English",
      vi: "Tiếng Việt",
      de: "Deutsch",
    };
    return names[code] || code;
  }
}

// Create global instance
const languageManager = new LanguageManager();

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    languageManager.init();
  });
} else {
  languageManager.init();
}
