let shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];

// Function to reload shortcuts from localStorage
function reloadShortcuts() {
  shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
}

// Listen for a custom event that signals shortcuts have been updated
document.addEventListener("shortcutsUpdated", reloadShortcuts);

export function handleShortcut(e) {
  // Ensure shortcuts are up-to-date before handling
  reloadShortcuts();

  // 1. Handle key combinations (e.g., Ctrl+S)
  if (e.ctrlKey || e.altKey || e.shiftKey) {
    // Ignore if it's just a modifier key press
    if (["Control", "Alt", "Shift"].includes(e.key)) {
      return;
    }

    let keyParts = [];
    if (e.ctrlKey) keyParts.push("Ctrl");
    if (e.altKey) keyParts.push("Alt");
    if (e.shiftKey) keyParts.push("Shift");
    keyParts.push(e.key.toUpperCase());
    const keyString = keyParts.join("+");

    const foundShortcut = shortcuts.find(
      (s) => s.key && s.key.toLowerCase() === keyString.toLowerCase()
    );

    if (foundShortcut) {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const text = target.value;
      target.value =
        text.substring(0, start) +
        foundShortcut.template +
        text.substring(start);
      target.selectionStart = target.selectionEnd =
        start + foundShortcut.template.length;
      return; // Stop further processing
    }
  }

  // 2. Handle text shortcuts (e.g., #saludo + Enter)
  if (e.key === "Enter") {
    const target = e.target;
    const currentText = target.value;
    // Look for #word right before the cursor
    const textBeforeCursor = currentText.substring(0, target.selectionStart);
    const lastWordMatch = textBeforeCursor.match(/(\/\w+)$/); // Changed # to /

    if (lastWordMatch) {
      const shortcutKey = lastWordMatch[1];
      const foundShortcut = shortcuts.find(
        (s) => s.key && s.key === shortcutKey
      );

      if (foundShortcut) {
        e.preventDefault();
        const textAfterCursor = currentText.substring(target.selectionStart);
        const newText =
          textBeforeCursor.replace(lastWordMatch[0], foundShortcut.template) +
          textAfterCursor;
        const newCursorPos =
          textBeforeCursor.length -
          lastWordMatch[0].length +
          foundShortcut.template.length;

        target.value = newText;
        target.selectionStart = target.selectionEnd = newCursorPos;
      }
    }
  }
}

export function applyShortcutListenersToTextareas() {
  // Apply shortcut handler to all relevant textareas
  const textareas = [
    document.getElementById("observacionForm"),
    document.getElementById("soporteGenerado"),
    document.getElementById("shortcutTemplate"),
    // Select all textareas within the genobs modal, including dynamically added ones
    ...document.querySelectorAll("#genobs textarea"),
  ];

  textareas.forEach((textarea) => {
    if (textarea && !textarea.dataset.shortcutListenerAdded) {
      textarea.addEventListener("keydown", handleShortcut);
      textarea.dataset.shortcutListenerAdded = "true"; // Mark to prevent duplicate listeners
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyShortcutListenersToTextareas();
});
