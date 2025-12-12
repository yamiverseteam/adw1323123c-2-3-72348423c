import { loadTheme } from "./themes.js";

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) {
    console.error("Sidebar element not found.");
    return;
  }

  // --- ESTADO GLOBAL ---
  let timerInterval;
  let alarmInterval;
  let running = false;
  let startTime;
  let elapsedTime = 0;
  let loadedTotalSeconds = 0;
  let isCountdown = false;
  let audioContext;
  let selectedAlarmSound = "Classic Beep"; // Sonido por defecto
  // Sonidos de alarma corregidos y más intensos
  const alarmSounds = {
    "Classic Beep": [{ freq: 1000, duration: 0.2, delay: 0 }],
    "Fast Beep": [
      { freq: 1200, duration: 0.1, delay: 0 },
      { freq: 1200, duration: 0.1, delay: 0.15 },
    ],
    Siren: [
      { freq: 900, duration: 0.3, delay: 0 },
      { freq: 1200, duration: 0.3, delay: 0.3 },
    ],
    Urgent: [
      { freq: 1500, duration: 0.08, delay: 0 },
      { freq: 1500, duration: 0.08, delay: 0.12 },
      { freq: 1500, duration: 0.08, delay: 0.24 },
    ],
    Digital: [
      { freq: 1000, duration: 0.1, delay: 0 },
      { freq: 1000, duration: 0.1, delay: 0.2 },
    ],
  };
  let timerPresets = [];

  // --- VARIABLES PARA LA VENTANA PIP ---
  let pipWindow = null;
  let pipDisplayElement;
  let pipStartStopButton;
  let pipStartStopIcon;
  let timerPane;
  let modalContainer;
  let fab;

  // --- LÓGICA DE LOCAL STORAGE ---
  function savePresets() {
    localStorage.setItem("pipTimer_presets", JSON.stringify(timerPresets));
  }

  function saveSelectedSound() {
    localStorage.setItem("pipTimer_selectedSound", selectedAlarmSound);
  }

  function saveLastSelectedTimer() {
    localStorage.setItem("pipTimer_lastSelected", loadedTotalSeconds);
  }

  function loadFromLocalStorage() {
    const savedPresets = localStorage.getItem("pipTimer_presets");
    const savedSound = localStorage.getItem("pipTimer_selectedSound");
    const savedLastTimer = localStorage.getItem("pipTimer_lastSelected");

    if (savedPresets) {
      timerPresets = JSON.parse(savedPresets);
    } else {
      // Carga por defecto si no hay nada guardado
      timerPresets = [
        { name: "01:30", totalSeconds: 90 },
        { name: "00:30", totalSeconds: 30 },
        { name: "02:00", totalSeconds: 120 },
        { name: "01:00", totalSeconds: 60 },
        { name: "03:00", totalSeconds: 180 },
      ];
      savePresets(); // Guarda los preajustes por defecto en la primera ejecución
    }

    if (savedSound && alarmSounds[savedSound]) {
      selectedAlarmSound = savedSound;
    }

    if (savedLastTimer) {
      loadedTotalSeconds = parseInt(savedLastTimer, 10);
    }
  }

  // --- LÓGICA DEL CRONÓMETRO Y ALARMA ---
  function initializeAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function startStopTimer() {
    initializeAudio();
    if (running) stopTimer();
    else startTimer();
  }

  function startTimer() {
    if (running) return;
    isCountdown = loadedTotalSeconds > 0 && elapsedTime === 0;
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTime, 100);
    running = true;
    updateButtonState();
    stopAlarm();
  }

  function stopTimer() {
    if (!running) return;
    clearInterval(timerInterval);
    elapsedTime = Date.now() - startTime;
    running = false;
    updateButtonState();
  }

  function resetTimer() {
    stopTimer();
    stopAlarm();
    elapsedTime = 0;
    loadedTotalSeconds = 0;
    isCountdown = false;
    updateDisplay(0);
    updateButtonState();

    const alarmOverlay = pipWindow?.document.querySelector(".alarm-overlay");
    if (alarmOverlay) alarmOverlay.remove();
  }

  function loadTimer(totalSeconds) {
    resetTimer();
    loadedTotalSeconds = totalSeconds;
    saveLastSelectedTimer(); // Guarda el temporizador seleccionado
    updateDisplay(totalSeconds * 1000);
  }

  function updateTime() {
    let displayTime;
    if (isCountdown) {
      const remainingTime = Math.max(
        0,
        loadedTotalSeconds * 1000 - (Date.now() - startTime)
      );
      displayTime = remainingTime;
      if (remainingTime <= 0) {
        stopTimer();
        startAlarm();
        showFullScreenAlarm();
      }
    } else {
      elapsedTime = Date.now() - startTime;
      displayTime = elapsedTime;
    }
    updateDisplay(displayTime);
  }

  function updateDisplay(time) {
    if (!pipDisplayElement) return;
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    pipDisplayElement.textContent = formattedTime;
  }

  function updateButtonState() {
    if (!pipStartStopIcon) return;
    pipStartStopIcon.textContent = running ? "pause" : "play_arrow";
  }

  function playSound(soundKey = selectedAlarmSound) {
    initializeAudio();
    const soundSequence = alarmSounds[soundKey];

    soundSequence.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(
        note.freq,
        audioContext.currentTime + note.delay
      );
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + note.delay);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + note.delay + note.duration
      );

      oscillator.start(audioContext.currentTime + note.delay);
      oscillator.stop(audioContext.currentTime + note.delay + note.duration);
    });
  }

  function startAlarm() {
    stopAlarm();
    playSound();
    alarmInterval = setInterval(() => playSound(), 1000);
  }

  function stopAlarm() {
    clearInterval(alarmInterval);
  }

  function showFullScreenAlarm() {
    const overlay = pipWindow.document.createElement("div");
    overlay.className = "alarm-overlay";

    const message = pipWindow.document.createElement("div");
    message.className = "alarm-message";
    message.textContent =
      "IMPORTANTE: Retomar gestión para Evitar cliente desatendido";

    const stopBtn = pipWindow.document.createElement("button");
    stopBtn.className = "alarm-stop-btn";
    stopBtn.textContent = "Pausar Alarma";
    stopBtn.onclick = () => {
      const lastTimerSeconds = loadedTotalSeconds;
      resetTimer();
      if (lastTimerSeconds > 0) {
        loadTimer(lastTimerSeconds);
      }
    };

    overlay.append(message, stopBtn);
    pipWindow.document.body.appendChild(overlay);
  }

  // --- LÓGICA PARA ABRIR Y GESTIONAR LA VENTANA PIP ---
  window.openAlarmPip = async () => {
    if (!documentPictureInPicture.requestWindow) {
      alert(
        "La función Picture-in-Picture no es compatible con este navegador."
      );
      return;
    }
    if (pipWindow) {
      pipWindow.focus();
      return;
    }

    try {
      pipWindow = await documentPictureInPicture.requestWindow({
        width: 280,
        height: 160,
      });

      const doc = pipWindow.document;
      const body = doc.body;

      loadFromLocalStorage();
      loadTheme(doc); // Apply the theme to the PiP window

      const pipStyle = doc.createElement("style");
      pipStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@700&family=Roboto:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        
        body { margin: 0; font-family: 'Roboto', sans-serif; background-color: var(--bg-primary); color: var(--text-primary); display: flex; flex-direction: column; height: 100vh; text-align: center; overflow: hidden; font-size: 14px; }
        .pip-header { position: sticky; top: 0; background-color: var(--bg-primary); z-index: 10; }
        .pip-tabs { display: flex; border-bottom: 1px solid var(--bg-tertiary); }
        .pip-tab { flex: 1; padding: 8px 5px; background-color: var(--bg-secondary); border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem; }
        .pip-tab:hover { border-bottom: 2px solid var(--accent-primary); } /* Added hover effect */
        .pip-tab.active { background-color: var(--accent-primary); color: var(--button-text-color); font-weight: 700; border-bottom: none; } /* Modified active tab to remove border-bottom */
        .pip-content { position: relative; flex: 1; overflow-y: auto; padding: 10px; }
        .tab-pane { display: none; }
        .tab-pane.active { display: flex; flex-direction: column; justify-content: flex-start; align-items: center; min-height: 100%;}
        #timer-pane { justify-content: center; }
        
        #pipDisplay { font-family: 'Roboto Mono', monospace; font-size: 2.2rem; font-weight: 700; margin-bottom: 1rem; }
        .pip-buttons { display: flex; gap: 1rem; }
        .pip-btn { background-color: var(--accent-primary); border: none; color: var(--button-text-color); border-radius: 50%; width: 42px; height: 42px; display:flex; align-items:center; justify-content:center; cursor: pointer; }
        .pip-btn.reset { background-color: var(--bg-tertiary); }
        .material-icons { font-size: 20px; }
        
        .preset-list, .settings-list { width: 100%; display: flex; flex-direction: column; gap: 6px; list-style: none; padding: 0;}
        .preset-item, .setting-item { display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-secondary); padding: 10px; border-radius: 6px; transition: border 0.2s; cursor: pointer; } /* Added cursor: pointer and changed transition */
        .preset-item:hover, .setting-item:hover { border: 1px solid var(--accent-primary); } /* Changed hover to border */
        .setting-item { cursor: pointer; }
        .item-actions { display: flex; align-items: center; gap: 8px; }
        .item-actions button { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; }
        .item-actions .select-btn { color: var(--success-color); }
        .item-actions .select-btn:hover { color: var(--success-color); }
        .item-actions .delete-btn:hover { color: var(--danger-color); }
        .setting-item .item-actions .check-icon { color: var(--accent-primary); opacity: 0; }
        .setting-item.selected .item-actions .check-icon { opacity: 1; }
        .item-actions .play-icon:hover { color: var(--text-primary); }
        .settings-title { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem; }

        .fab-btn { position: fixed; bottom: 15px; right: 15px; width: 45px; height: 45px; background-color: var(--success-color); color: var(--button-text-color); border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer; z-index: 100; transition: transform 0.2s, opacity 0.2s; }
        .fab-btn.hidden { transform: scale(0); opacity: 0; }
        
        .modal-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: var(--bg-primary); display: none; flex-direction: column; z-index: 1000; padding: 10px; box-sizing: border-box;}
        .modal-header { text-align: center; font-size: 1rem; font-weight: 500; padding: 5px 0 15px 0; }
        .modal-body { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 10px; }
        .modal-body input { padding: 8px; background-color: var(--input-bg); color: var(--input-text); border: 1px solid var(--input-border); border-radius: 6px; font-size: 0.9rem; width: 100%; box-sizing: border-box; }
        .time-picker-container { display: flex; justify-content: center; align-items: center; gap: 0.25rem; flex-wrap: wrap; }
        .number-picker { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
        .picker-value { font-family: 'Roboto Mono', monospace; font-size: 2rem; width: 45px; text-align: center; color: var(--text-primary); }
        .picker-btn { background: var(--bg-tertiary); border: none; color: var(--button-text-color); width: 28px; height: 28px; border-radius: 50%; font-size: 18px; line-height: 28px; cursor: pointer; transition: background-color 0.2s; }
        .picker-btn:hover { background-color: var(--accent-hover); }
        .modal-footer { display: flex; gap: 10px; justify-content: flex-end; }
        .modal-btn { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; font-size: 0.9rem; }
        .modal-btn.confirm { background-color: var(--success-color); color: var(--button-text-color); }
        .modal-btn.cancel { background-color: var(--bg-tertiary); color: var(--button-text-color); }

        .alarm-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: var(--danger-color); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 2000; padding: 20px; box-sizing: border-box; }
        .alarm-message { font-size: 1.2rem; font-weight: bold; text-align: center; margin-bottom: 20px; }
        .alarm-stop-btn { background-color: var(--button-text-color); color: var(--danger-color); border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }

        .modal-content { background-color: var(--bg-secondary); padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 90%; text-align: center; }
        .modal-actions { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
      `;
      doc.head.append(pipStyle);

      const header = doc.createElement("div");
      header.className = "pip-header";
      const tabsContainer = doc.createElement("div");
      tabsContainer.className = "pip-tabs";
      const timerTabButton = doc.createElement("button");
      timerTabButton.className = "pip-tab active";
      timerTabButton.dataset.tab = "timer";
      timerTabButton.textContent = "Temporizador";
      const manageTabButton = doc.createElement("button");
      manageTabButton.className = "pip-tab";
      manageTabButton.dataset.tab = "manage";
      manageTabButton.textContent = "Gestionar";
      const settingsTabButton = doc.createElement("button");
      settingsTabButton.className = "pip-tab";
      settingsTabButton.dataset.tab = "settings";
      settingsTabButton.textContent = "Ajustes";
      tabsContainer.append(timerTabButton, manageTabButton, settingsTabButton);
      header.append(tabsContainer);

      const contentContainer = doc.createElement("div");
      contentContainer.className = "pip-content";

      timerPane = doc.createElement("div");
      timerPane.id = "timer-pane";
      timerPane.className = "tab-pane active";
      pipDisplayElement = doc.createElement("div");
      pipDisplayElement.id = "pipDisplay";
      const pipButtonsDiv = doc.createElement("div");
      pipButtonsDiv.className = "pip-buttons";
      pipStartStopButton = doc.createElement("button");
      pipStartStopButton.className = "pip-btn";
      pipStartStopIcon = doc.createElement("i");
      pipStartStopIcon.className = "material-icons";
      pipStartStopButton.append(pipStartStopIcon);
      const pipResetButton = doc.createElement("button");
      pipResetButton.className = "pip-btn reset";
      pipResetButton.innerHTML = `<i class="material-icons">restart_alt</i>`;
      pipButtonsDiv.append(pipStartStopButton, pipResetButton);
      timerPane.append(pipDisplayElement, pipButtonsDiv);

      const managePane = doc.createElement("div");
      managePane.id = "manage-pane";
      managePane.className = "tab-pane";
      const presetListContainer = doc.createElement("ul");
      presetListContainer.className = "preset-list";
      managePane.append(presetListContainer);

      const settingsPane = doc.createElement("div");
      settingsPane.id = "settings-pane";
      settingsPane.className = "tab-pane";
      const settingsTitle = doc.createElement("h4");
      settingsTitle.className = "settings-title";
      settingsTitle.textContent = "Selecciona el audio de alarma";
      const settingsList = doc.createElement("ul");
      settingsList.className = "settings-list";
      settingsPane.append(settingsTitle, settingsList);

      fab = doc.createElement("button");
      fab.className = "fab-btn hidden";
      fab.innerHTML = '<i class="material-icons">add</i>';

      modalContainer = doc.createElement("div");
      modalContainer.className = "modal-container";

      contentContainer.append(timerPane, managePane, settingsPane);
      body.append(header, contentContainer, fab, modalContainer);

      const switchTab = (tabId) => {
        doc
          .querySelectorAll(".pip-tab")
          .forEach((btn) => btn.classList.remove("active"));
        doc.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
        doc
          .querySelectorAll(".tab-pane")
          .forEach((pane) => pane.classList.remove("active"));
        doc.getElementById(`${tabId}-pane`).classList.add("active");
        fab.classList.toggle("hidden", tabId !== "manage");
      };

      const renderPresetList = () => {
        presetListContainer.innerHTML = "";
        timerPresets.forEach((preset, index) => {
          const li = doc.createElement("li");
          li.className = "preset-item";
          const nameSpan = doc.createElement("span");
          nameSpan.className = "preset-name";
          const mins = Math.floor(preset.totalSeconds / 60);
          const secs = preset.totalSeconds % 60;
          nameSpan.textContent =
            preset.name ||
            `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

          const actionsDiv = doc.createElement("div");
          actionsDiv.className = "item-actions";

          const selectButton = doc.createElement("button");
          selectButton.title = "Seleccionar temporizador";
          selectButton.className = "select-btn";
          selectButton.innerHTML = `<i class="material-icons">input</i>`;
          selectButton.addEventListener("click", (e) => {
            e.stopPropagation();
            loadTimer(preset.totalSeconds);
            switchTab("timer");
          });

          const deleteButton = doc.createElement("button");
          deleteButton.title = "Eliminar temporizador";
          deleteButton.className = "delete-btn";
          deleteButton.innerHTML = `<i class="material-icons">delete_outline</i>`;
          deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            showDeleteConfirmationModal(index);
          });
          actionsDiv.append(selectButton, deleteButton);
          li.append(nameSpan, actionsDiv);
          presetListContainer.append(li);
        });
      };

      const renderSoundSettings = () => {
        settingsList.innerHTML = "";
        Object.keys(alarmSounds).forEach((key) => {
          const li = doc.createElement("li");
          li.className = `setting-item ${
            selectedAlarmSound === key ? "selected" : ""
          }`;
          li.addEventListener("click", () => {
            selectedAlarmSound = key;
            saveSelectedSound();
            renderSoundSettings();
          });

          const nameSpan = doc.createElement("span");
          nameSpan.textContent = key;

          const actionsDiv = doc.createElement("div");
          actionsDiv.className = "item-actions";

          const playBtn = doc.createElement("button");
          playBtn.title = "Probar sonido";
          playBtn.innerHTML = `<i class="material-icons play-icon">play_circle_outline</i>`;
          playBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            playSound(key);
          });

          const checkIcon = doc.createElement("i");
          checkIcon.className = "material-icons check-icon";
          checkIcon.textContent = "check_circle";

          actionsDiv.append(playBtn, checkIcon);
          li.append(nameSpan, actionsDiv);
          settingsList.appendChild(li);
        });
      };

      const createNumberPicker = (max) => {
        let value = 0;
        const picker = doc.createElement("div");
        picker.className = "number-picker";
        const upBtn = doc.createElement("button");
        upBtn.className = "picker-btn";
        upBtn.innerHTML = "▲";
        upBtn.style.fontSize = "12px";
        const valueDisplay = doc.createElement("div");
        valueDisplay.className = "picker-value";
        const downBtn = doc.createElement("button");
        downBtn.className = "picker-btn";
        downBtn.innerHTML = "▼";
        downBtn.style.fontSize = "12px";

        const updateValue = () => {
          valueDisplay.textContent = String(value).padStart(2, "0");
        };

        upBtn.addEventListener("click", () => {
          value = (value + 1) % (max + 1);
          updateValue();
        });
        downBtn.addEventListener("click", () => {
          value = (value - 1 + (max + 1)) % (max + 1);
          updateValue();
        });

        updateValue();
        picker.append(upBtn, valueDisplay, downBtn);
        return { element: picker, getValue: () => value };
      };

      const showCreateModal = () => {
        modalContainer.innerHTML = ""; // Limpiar modal anterior

        const header = doc.createElement("div");
        header.className = "modal-header";
        header.textContent = "Crear Temporizador";

        const body = doc.createElement("div");
        body.className = "modal-body";
        const nameInput = doc.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Nombre (opcional)";
        const timePickerContainer = doc.createElement("div");
        timePickerContainer.className = "time-picker-container";
        const minutePicker = createNumberPicker(59);
        const secondPicker = createNumberPicker(59);
        const separator = doc.createElement("span");
        separator.textContent = ":";
        separator.style.fontSize = "2rem";
        separator.style.fontFamily = "Roboto Mono, monospace";
        timePickerContainer.append(
          minutePicker.element,
          separator,
          secondPicker.element
        );
        body.append(nameInput, timePickerContainer);

        const footer = doc.createElement("div");
        footer.className = "modal-footer";
        const cancelBtn = doc.createElement("button");
        cancelBtn.className = "modal-btn cancel";
        cancelBtn.textContent = "Cancelar";
        cancelBtn.onclick = () => (modalContainer.style.display = "none");
        const confirmBtn = doc.createElement("button");
        confirmBtn.className = "modal-btn confirm";
        confirmBtn.textContent = "Guardar";
        confirmBtn.onclick = () => {
          const totalSeconds =
            minutePicker.getValue() * 60 + secondPicker.getValue();
          if (totalSeconds > 0) {
            const newPreset = { totalSeconds };
            const name = nameInput.value.trim();
            if (name) {
              newPreset.name = name;
            }
            timerPresets.push(newPreset);
            savePresets();
            renderPresetList();
            modalContainer.style.display = "none";
          } else {
            alert("Por favor, introduce una duración válida.");
          }
        };
        footer.append(cancelBtn, confirmBtn);

        modalContainer.append(header, body, footer);
        modalContainer.style.display = "flex";
      };

      const showDeleteConfirmationModal = (index) => {
        modalContainer.innerHTML = ""; // Limpiar modal anterior

        const preset = timerPresets[index];
        const mins = Math.floor(preset.totalSeconds / 60);
        const secs = preset.totalSeconds % 60;
        const timeString =
          preset.name ||
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        const header = doc.createElement("div");
        header.className = "modal-header";
        header.textContent = "Confirmar Eliminación";

        const body = doc.createElement("div");
        body.className = "modal-body";
        const message = doc.createElement("p");
        message.style.fontSize = "0.9rem";
        message.textContent = `¿Seguro que quieres eliminar "${timeString}"?`;
        body.append(message);

        const footer = doc.createElement("div");
        footer.className = "modal-footer";
        const cancelBtn = doc.createElement("button");
        cancelBtn.className = "modal-btn cancel";
        cancelBtn.textContent = "Cancelar";
        cancelBtn.onclick = () => (modalContainer.style.display = "none");
        const confirmBtn = doc.createElement("button");
        confirmBtn.className = "modal-btn confirm";
        confirmBtn.style.backgroundColor = "var(--danger-color)"; // Use danger color for delete
        confirmBtn.textContent = "Eliminar";
        confirmBtn.onclick = () => {
          timerPresets.splice(index, 1);
          savePresets();
          renderPresetList();
          modalContainer.style.display = "none";
        };
        footer.append(cancelBtn, confirmBtn);

        modalContainer.append(header, body, footer);
        modalContainer.style.display = "flex";
      };

      // Inicialización
      timerTabButton.addEventListener("click", () => switchTab("timer"));
      manageTabButton.addEventListener("click", () => switchTab("manage"));
      settingsTabButton.addEventListener("click", () => switchTab("settings"));
      fab.addEventListener("click", showCreateModal);

      // Carga el estado inicial y renderiza las listas
      if (loadedTotalSeconds > 0) {
        updateDisplay(loadedTotalSeconds * 1000);
      } else if (timerPresets.length > 0) {
        loadTimer(timerPresets[0].totalSeconds);
      }

      updateButtonState();
      renderPresetList();
      renderSoundSettings();

      pipStartStopButton.addEventListener("click", startStopTimer);
      pipResetButton.addEventListener("click", () => {
        resetTimer();
        if (timerPresets.length > 0) {
          loadTimer(timerPresets[0].totalSeconds);
        }
      });

      switchTab("timer");

      pipWindow.addEventListener("unload", () => {
        pipWindow = null;
      });
    } catch (error) {
      console.error("Error al abrir la ventana Picture-in-Picture:", error);
    }
  };
});
