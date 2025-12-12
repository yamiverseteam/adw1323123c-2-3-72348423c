// Function to load CSS files
function loadCSS(filename) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = filename;
  document.head.appendChild(link);
}

// Function to load JavaScript files
function loadJS(filename, isModule = false) {
  const script = document.createElement("script");
  script.src = filename;
  if (isModule) {
    script.type = "module";
  }
  document.body.appendChild(script);
}

// Load CSS files
loadCSS("style.css");
loadCSS("login.css");
loadCSS("style-history.css");
loadCSS("style-themes.css");
loadCSS("style-genobs.css");
loadCSS("style-survey-modal.css");
loadCSS("style-pip.css");
loadCSS("style-tmo-modal.css");
loadCSS("style-alarm.css");

// Synchronously apply theme from localStorage to prevent FOUC
(function () {
  const themes = {
    tema_mundo: {
      "--bg-primary": "#0b3f4bff",
      "--bg-secondary": "#0b3f4bff",
      "--bg-tertiary": "#a19f0eff",
      "--text-primary": "#ffffffff",
      "--text-secondary": "#ffffffff",
      "--accent-primary": "#a19f0eff",
      "--accent-hover": "#ffa000",
      "--danger-color": "#ef4444",
      "--success-color": "#22c55e",
      "--icon-color": "#ffffffff",
      "--button-text-color": "#ffffffff",
      "--button-bg-color": "#ffda00",
      "--speedtest-url-color": "#ffffffff",
      "--logo-color": "#ffffffff",
      "--input-bg": "#f8feffff",
      "--input-border": "#ffffffff",
      "--input-text": "#000000ff",
      "--input-focus-border": "#ffffffff",
      "--input-focus-shadow": "rgba(255, 255, 255, 0.4)",
      "--input-focus-bg": "#a19f0eff",
      "--input-label-color": "#ffffffff",
    },
    dark_blue: {
      "--bg-primary": "#152533",
      "--bg-secondary": "#2a3b4c",
      "--bg-tertiary": "#405166",
      "--text-primary": "#e2e8f0",
      "--text-secondary": "#94a3b8",
      "--accent-primary": "#3b82f6",
      "--accent-hover": "#2563eb",
      "--danger-color": "#ef4444",
      "--success-color": "#22c55e",
      "--icon-color": "#e2e8f0",
      "--button-text-color": "#e2e8f0",
      "--button-bg-color": "#3b82f6",
      "--speedtest-url-color": "#3b82f6",
      "--logo-color": "#e2e8f0",
      "--input-bg": "#1e293b",
      "--input-border": "#3b82f6",
      "--input-text": "#e2e8f0",
      "--input-focus-border": "#3b82f6",
      "--input-focus-shadow": "rgba(59, 130, 246, 0.4)",
      "--input-focus-bg": "#405166",
      "--input-label-color": "#94a3b8",
    },
  };
  const defaultThemeName =
    localStorage.getItem("selectedTheme") || "tema_mundo";
  const theme = themes[defaultThemeName];
  if (theme) {
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
  }
})();

// Load JavaScript files
loadJS("js/assetLoader.js");
loadJS("js/body.js", true);
loadJS("js/main.js", true);
loadJS("js/speedtest.js", true);
loadJS("js/alarm.js", true);

// Handle the specific module import for abrirModalTipificacion
// This needs to be done after main.js is loaded and its module is evaluated.
// A simple way is to add a script tag that runs after the main scripts.
// However, directly assigning to window from a module is generally not recommended.
// If abrirModalTipificacion is meant to be globally accessible, it should be exported
// and then imported where needed, or explicitly attached to window in main.js itself.
// For now, I'll replicate the original behavior by adding a script that imports it.
// This might cause issues if main.js isn't fully loaded when this script runs.
// A more robust solution would involve a promise-based loading system or
// ensuring main.js itself exposes this function globally if it's truly needed globally.
const scriptAbrirModal = document.createElement("script");
scriptAbrirModal.type = "module";
scriptAbrirModal.textContent = `
  import { abrirModalTipificacion } from "./js/main.js";
  window.abrirModalTipificacion = abrirModalTipificacion;
`;
document.body.appendChild(scriptAbrirModal);
