export const themes = {
  tema_mundo: {
    "--bg-primary": "#0b3f4bff",
    "--bg-secondary": "#0b3f4bff",
    "--bg-tertiary": "#a19f0eff",
    "--text-primary": "#ffffffff",
    "--text-secondary": "#ffffffff",
    "--accent-primary": "#a19f0eff",
    "--accent-hover": "#ffa000",
    "--danger-color": "#ef4444",
    "--success-color": "var(--accent-primary)",
    "--icon-color": "#ffffffff",
    "--button-text-color": "#ffffffff",
    "--button-bg-color": "#ffda00",
    "--speedtest-url-color": "#ffffffff",
    "--logo-color": "#ffffffff" /* White for tema_mundo */,
    "--input-bg": "#f8feffff",
    "--input-border": "#ffffffff",
    "--input-text": "#000000ff",
    "--input-focus-border": "var(--accent-primary)",
    "--input-focus-shadow": "rgba(0, 0, 0, 0.2)",
    "--input-focus-bg": "var(--bg-secondary)",
    "--input-label-color": "#000000ff",
    "--input-bg": "#0b3f4bff",
    "--input-border": "#ffda00",
    "--input-text": "#e2e8f0",
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
    "--success-color": "var(--accent-primary)",
    "--icon-color": "#e2e8f0",
    "--button-text-color": "#e2e8f0",
    "--button-bg-color": "#3b82f6",
    "--speedtest-url-color": "#3b82f6",
    "--logo-color": "#e2e8f0" /* Light text color for dark_blue */,
    "--input-bg": "#1e293b",
    "--input-border": "#3b82f6",
    "--input-text": "#e2e8f0",
    "--input-focus-border": "#3b82f6",
    "--input-focus-shadow": "rgba(59, 130, 246, 0.4)",
    "--input-focus-bg": "#405166",
    "--input-label-color": "#94a3b8",
    "--input-bg": "#1e293b",
    "--input-border": "#3b82f6",
    "--input-text": "#e2e8f0",
    "--input-focus-border": "#3b82f6",
    "--input-focus-shadow": "rgba(59, 130, 246, 0.4)",
  },
  modern_black: {
    "--bg-primary": "#0f172a", // Dark Blue (Slate 900)
    "--bg-secondary": "#1e293b", // Slate 800
    "--bg-tertiary": "#334155", // Slate 700
    "--text-primary": "#f8fafc", // Slate 50
    "--text-secondary": "#cbd5e1", // Slate 300
    "--accent-primary": "#7c3aed", // Violet 600
    "--accent-hover": "#6d28d9", // Violet 700
    "--danger-color": "#ef4444", // Red 500
    "--success-color": "#22c55e", // Green 500
    "--icon-color": "#f8fafc",
    "--button-text-color": "#ffffff",
    "--button-bg-color": "#7c3aed",
    "--speedtest-url-color": "#7c3aed",
    "--logo-color": "#f8fafc",
    "--input-bg": "#1e293b",
    "--input-border": "#7c3aed",
    "--input-text": "#f8fafc",
    "--input-focus-border": "#8b5cf6", // Violet 500
    "--input-focus-shadow": "rgba(124, 58, 237, 0.3)",
    "--input-focus-bg": "#334155",
    "--input-label-color": "#cbd5e1",
  },
};

export function applyTheme(themeName, targetDocument = document) {
  const theme = themes[themeName];
  if (theme) {
    for (const [key, value] of Object.entries(theme)) {
      targetDocument.documentElement.style.setProperty(key, value);
    }
    // Only save to localStorage if applying to the main document
    if (targetDocument === document) {
      localStorage.setItem("selectedTheme", themeName);
    }
  }
}

export function loadTheme(targetDocument = document) {
  const savedTheme = localStorage.getItem("selectedTheme") || "tema_mundo";
  applyTheme(savedTheme, targetDocument);
}
