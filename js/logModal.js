// Buffer for logs before DOM is ready
const logBuffer = [];
let isDomReady = false;

export function openLogModal() {
  const modal = document.getElementById('logModal');
  if (modal) {
    modal.style.display = 'flex'; // Flex for centering
    // Ensure centering styles are applied if not in CSS
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    // Ensure we scroll to bottom on open
    const terminalBody = document.getElementById('log-terminal-body');
    if (terminalBody) {
      // Little timeout to allow layout to settle
      setTimeout(() => {
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }, 10);
    }
  }
}

export function closeLogModal() {
  const modal = document.getElementById('logModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Local robust copy function to avoid circular dependencies
async function internalCopyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      throw new Error("Clipboard API unavailable");
    }
  } catch (err) {
    console.warn("Clipboard API failed, trying fallback:", err);
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error("Fallback copy failed:", fallbackErr);
      return false;
    }
  }
}

export function copyLogToClipboard() {
  const terminalBody = document.getElementById('log-terminal-body');
  if (terminalBody) {
    const text = terminalBody.innerText;
    internalCopyToClipboard(text).then(success => {
      if (success) {
        // Use window.showNotification if available, or alert fallback
        if (window.showNotification) {
          window.showNotification("Logs copiados al terminal", "success");
        } else {
          alert("Logs copiados al portapapeles");
        }
      } else {
        if (window.showNotification) {
          window.showNotification("No se pudo copiar los logs", "error");
        } else {
          alert("Error al copiar logs");
        }
      }
    });
  }
}

export function addLogEntry(type, message, details = '') {
  // If DOM not ready, buffer the log
  if (!isDomReady) {
    logBuffer.push({ type, message, details });
    return;
  }

  const terminalBody = document.getElementById('log-terminal-body');
  if (!terminalBody) {
    // Should not happen if isDomReady is true, but safety check
    console.error("Critical: log-terminal-body not found but DOM is ready.");
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  const logLine = document.createElement('div');

  // Base class
  logLine.className = 'log-line';

  // Add specific class based on type
  if (type === 'failure' || type === 'error') {
    logLine.classList.add('error');
  } else if (type === 'warning' || type === 'warn') {
    logLine.classList.add('warning');
  } else if (type === 'info') {
    logLine.classList.add('info');
  } else if (type === 'execution') {
    logLine.classList.add('info'); // Treat execution as info/default
    logLine.style.color = '#bd93f9'; // Dracula Purple for execution steps
  }

  // Construct content
  const timeSpan = `<span class="log-timestamp">[${timestamp}]</span>`;
  let content = `${timeSpan} [${type.toUpperCase()}] ${message}`;

  if (details) {
    content += `\n   Details: ${details}`;
  }

  logLine.innerHTML = content;

  // Add Copy Button for Errors
  if (type === 'failure' || type === 'error') {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'error-copy-btn';
    copyBtn.innerHTML = '<i class="material-icons">content_copy</i>';
    copyBtn.title = "Copiar error";
    copyBtn.onclick = (e) => {
      e.stopPropagation(); // Prevent potentially triggering other log line clicks if added later
      const textToCopy = `[${timestamp}] [${type.toUpperCase()}] ${message} ${details ? '\nDetails: ' + details : ''}`;
      internalCopyToClipboard(textToCopy).then(success => {
        if (success) {
          if (window.showNotification) window.showNotification("Error copiado", "success");
        }
      });
    };
    logLine.appendChild(copyBtn);
  }

  terminalBody.appendChild(logLine);

  // Auto-scroll to bottom
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function flushLogBuffer() {
  const terminalBody = document.getElementById('log-terminal-body');
  if (!terminalBody) return;

  isDomReady = true; // Mark ready

  // Process buffer
  while (logBuffer.length > 0) {
    const entry = logBuffer.shift();
    addLogEntry(entry.type, entry.message, entry.details);
  }
}

// Initialize immediately (module scope)
// But we can only modify window/document meaningfully safely.
// We'll rely on initConsoleInterceptor running immediately for capturing, 
// and the addLogEntry buffering to handle the storage.
initConsoleInterceptor();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if terminal body exists
  const terminalBody = document.getElementById('log-terminal-body');
  if (terminalBody) {
    isDomReady = true;
    flushLogBuffer(); // Flush any early logs
    addLogEntry('info', 'System Logger Initialized.');
  } else {
    console.error("Logger initialization failed: Element #log-terminal-body not found.");
  }

  // Expose functions to window
  window.openLogModal = openLogModal;
  window.closeLogModal = closeLogModal;
  window.addLogEntry = addLogEntry;
  window.copyLogToClipboard = copyLogToClipboard;
});

function initConsoleInterceptor() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = function (...args) {
    originalLog.apply(console, args);
    // Serialize objects
    const message = args.map(arg => {
      try {
        return (typeof arg === 'object') ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return '[Circular/Error]';
      }
    }).join(' ');
    addLogEntry('info', message);
  };

  console.warn = function (...args) {
    originalWarn.apply(console, args);
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
    addLogEntry('warning', message);
  };

  console.error = function (...args) {
    originalError.apply(console, args);
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
    // Filter out clipboard errors to avoid infinite loop
    if (!message.includes("Clipboard API failed") && !message.includes("execCommand")) {
      addLogEntry('failure', message);
    }
  };
}
