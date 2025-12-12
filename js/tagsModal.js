// Function to initialize tags modal
export function initializeTagsModal() {
  const tagsModal = document.getElementById("tagsModal");
  const shortcutFormModal = document.getElementById("shortcutFormModal");
  const openCreateShortcutModalBtn = document.getElementById(
    "openCreateShortcutModalBtn"
  );
  const saveShortcutBtn = document.getElementById("saveShortcutBtn");
  const shortcutIdInput = document.getElementById("shortcutId");
  const shortcutNameInput = document.getElementById("shortcutName");
  const shortcutKeyInput = document.getElementById("shortcutKey");
  const shortcutCategorySelect = document.getElementById("shortcutCategory");
  const shortcutTemplateTextarea = document.getElementById("shortcutTemplate");
  const savedShortcutsTable = document.getElementById("savedShortcutsTable");
  const shortcutTypeToggle = document.getElementById("shortcutTypeToggle");
  const openTagsBtn = document.getElementById("openTagsBtn");
  const shortcutFormTitle = document.getElementById("shortcutFormTitle");
  const shortcutSearchInput = document.getElementById("shortcutSearchInput");
  const confirmDeleteShortcutModal = document.getElementById(
    "confirmDeleteShortcutModal"
  );
  const confirmDeleteShortcutBtn = document.getElementById(
    "confirmDeleteShortcutBtn"
  );
  const cancelDeleteShortcutBtn = document.getElementById(
    "cancelDeleteShortcutBtn"
  );

  let shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || [];
  let shortcutToDeleteIndex = null;

  function handleCombinationKeydown(e) {
    if (e.key === "Backspace" || e.key === "Delete") {
      shortcutKeyInput.value = "";
      return;
    }
    e.preventDefault();
    if (e.ctrlKey || e.altKey || e.shiftKey) {
      const keyParts = [];
      if (e.ctrlKey) keyParts.push("Ctrl");
      if (e.altKey) keyParts.push("Alt");
      if (e.shiftKey) keyParts.push("Shift");
      if (!["Control", "Alt", "Shift"].includes(e.key)) {
        keyParts.push(e.key.toUpperCase());
      }
      if (keyParts.length > 1) {
        shortcutKeyInput.value = keyParts.join("+");
      }
    }
  }

  function handleTextKeydown(e) {
    if (e.key === "Backspace" || e.key === "Delete") return;

    // Block 'z' and 'Z' keys to avoid conflict with template search
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      window.showNotification('La tecla Z está reservada para el buscador de plantillas', 'error');
      return;
    }

    if (!shortcutKeyInput.value.startsWith("/")) {
      if (e.key !== "/") e.preventDefault();
    }
  }

  function updateShortcutInputListener() {
    shortcutKeyInput.removeEventListener("keydown", handleCombinationKeydown);
    shortcutKeyInput.removeEventListener("keydown", handleTextKeydown);
    if (shortcutTypeToggle.checked) {
      shortcutKeyInput.placeholder = "Ej: Ctrl+S, Alt+Shift+F";
      shortcutKeyInput.classList.add("key-combination-active");
      shortcutKeyInput.removeEventListener("keydown", handleTextKeydown); // Ensure only one listener is active
      shortcutKeyInput.addEventListener("keydown", handleCombinationKeydown);
    } else {
      shortcutKeyInput.placeholder = "Ej: /saludo"; // Changed placeholder
      shortcutKeyInput.classList.remove("key-combination-active");
      shortcutKeyInput.removeEventListener("keydown", handleCombinationKeydown); // Ensure only one listener is active
      shortcutKeyInput.addEventListener("keydown", handleTextKeydown);
    }
  }

  function renderShortcuts(filter = "") {
    const tableBody = savedShortcutsTable.querySelector("tbody");
    if (!tableBody) return;
    tableBody.innerHTML = "";
    const lowerCaseFilter = filter.toLowerCase();
    const filteredShortcuts = shortcuts.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerCaseFilter) ||
        s.key.toLowerCase().includes(lowerCaseFilter) ||
        s.template.toLowerCase().includes(lowerCaseFilter)
    );

    if (filteredShortcuts.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="text-align: center;">No se encontraron atajos.</td>`;
      tableBody.appendChild(tr);
      return;
    }

    filteredShortcuts.forEach((shortcut) => {
      const originalIndex = shortcuts.indexOf(shortcut);
      const tr = document.createElement("tr");
      const category = shortcut.category || 'General';
      tr.innerHTML = `
        <td>${shortcut.name}</td>
        <td><span style="background: var(--accent-primary); color: var(--button-text-color); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${category}</span></td>
        <td>${shortcut.key}</td>
        <td>${shortcut.template}</td>
        <td class="shortcut-actions">
          <button class="edit-shortcut-btn" data-index="${originalIndex}"><i class="material-icons">edit</i></button>
          <button class="delete-shortcut-btn" data-index="${originalIndex}"><i class="material-icons">delete_forever</i></button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function saveShortcuts() {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
    document.dispatchEvent(new Event("shortcutsUpdated")); // Dispatch custom event
  }

  function resetShortcutForm() {
    shortcutIdInput.value = "";
    shortcutNameInput.value = "";
    shortcutKeyInput.value = "";
    shortcutCategorySelect.value = "General";
    shortcutTemplateTextarea.value = "";
    shortcutTypeToggle.checked = false;
    shortcutFormTitle.textContent = "Crear Atajo";
    saveShortcutBtn.textContent = "Guardar Atajo";
    // Ensure the placeholder is reset correctly when opening a new form
    shortcutKeyInput.placeholder = "Ej: /saludo o presione una combinación";
    shortcutKeyInput.classList.remove("key-combination-active");
    updateShortcutInputListener();
  }

  function openShortcutFormModal(shortcut = null, index = null) {
    resetShortcutForm();
    if (shortcut) {
      shortcutFormTitle.textContent = "Editar Atajo";
      saveShortcutBtn.textContent = "Actualizar Atajo";
      shortcutIdInput.value = index;
      shortcutNameInput.value = shortcut.name;
      shortcutKeyInput.value = shortcut.key;
      shortcutCategorySelect.value = shortcut.category || "General";
      shortcutTemplateTextarea.value = shortcut.template;
      shortcutTypeToggle.checked = shortcut.type === "combination";
      // Manually trigger the update listener to apply correct placeholder and class
      updateShortcutInputListener();
    }
    shortcutFormModal.style.display = "flex";
  }

  shortcutSearchInput.addEventListener("input", (e) => {
    renderShortcuts(e.target.value);
  });

  openTagsBtn.addEventListener("click", () => {
    tagsModal.style.display = "flex";
    shortcutSearchInput.value = "";
    renderShortcuts();
  });

  openCreateShortcutModalBtn.addEventListener("click", () => {
    openShortcutFormModal();
  });

  saveShortcutBtn.addEventListener("click", () => {
    const name = shortcutNameInput.value.trim();
    const key = shortcutKeyInput.value.trim();
    const category = shortcutCategorySelect.value;
    const template = shortcutTemplateTextarea.value.trim();
    const id = shortcutIdInput.value;

    if (!template) {
      alert("La plantilla no puede estar vacía.");
      return;
    }
    if (!name && !key) {
      alert("Debe proporcionar al menos un nombre o un atajo de teclado.");
      return;
    }
    if (key) {
      const isCombination = shortcutTypeToggle.checked;

      // Check for 'z' or 'Z' in text shortcuts
      if (!isCombination && (key.toLowerCase().includes('z'))) {
        alert('La tecla Z está reservada para el buscador de plantillas. Por favor usa otra letra.');
        return;
      }

      if (isCombination && !key.includes("+")) {
        alert("El atajo de teclado no es una combinación válida (ej. Ctrl+S).");
        return;
      }
      if (!isCombination && !key.startsWith("/")) {
        alert('El atajo de texto debe comenzar con "/" (ej. /saludo).');
        return;
      }
    }

    const newShortcut = {
      name,
      key,
      category,
      template,
      type: shortcutTypeToggle.checked ? "combination" : "text",
    };

    if (id !== "") {
      shortcuts[parseInt(id)] = newShortcut;
    } else {
      shortcuts.push(newShortcut);
    }

    saveShortcuts();
    shortcutFormModal.style.display = "none";
  });

  savedShortcutsTable.addEventListener("click", (e) => {
    const editButton = e.target.closest(".edit-shortcut-btn");
    const deleteButton = e.target.closest(".delete-shortcut-btn");

    if (editButton) {
      const index = parseInt(editButton.dataset.index);
      const shortcut = shortcuts[index];
      openShortcutFormModal(shortcut, index);
    }

    if (deleteButton) {
      shortcutToDeleteIndex = parseInt(deleteButton.dataset.index);
      confirmDeleteShortcutModal.style.display = "flex";
    }
  });

  confirmDeleteShortcutBtn.addEventListener("click", () => {
    if (shortcutToDeleteIndex !== null) {
      shortcuts.splice(shortcutToDeleteIndex, 1);
      saveShortcuts();
      shortcutToDeleteIndex = null;
    }
    confirmDeleteShortcutModal.style.display = "none";
  });

  cancelDeleteShortcutBtn.addEventListener("click", () => {
    shortcutToDeleteIndex = null;
    confirmDeleteShortcutModal.style.display = "none";
  });

  shortcutTypeToggle.addEventListener("change", updateShortcutInputListener);

  // Initial setup
  updateShortcutInputListener();
}

// Function to quickly save content from soporteGenerado as a new template
window.guardarPlantillaRapida = function () {
  console.log('guardarPlantillaRapida: Iniciando...');

  const soporteGenerado = document.getElementById('soporteGenerado');

  if (!soporteGenerado) {
    console.error('guardarPlantillaRapida: No se encontró el campo soporteGenerado');
    window.showNotification('No se encontró el campo de soporte generado', 'error');
    return;
  }

  const contenido = soporteGenerado.value.trim();
  console.log('guardarPlantillaRapida: Contenido =', contenido.substring(0, 50) + '...');

  if (!contenido) {
    window.showNotification('Por favor escribe algo en el campo de soporte generado antes de guardar', 'warning');
    return;
  }

  // Pre-load the content in the shortcut form
  const shortcutTemplateTextarea = document.getElementById('shortcutTemplate');
  const shortcutFormModal = document.getElementById('shortcutFormModal');
  const shortcutFormTitle = document.getElementById('shortcutFormTitle');
  const shortcutNameInput = document.getElementById('shortcutName');
  const shortcutKeyInput = document.getElementById('shortcutKey');
  const shortcutCategorySelect = document.getElementById('shortcutCategory');
  const shortcutIdInput = document.getElementById('shortcutId');
  const saveShortcutBtn = document.getElementById('saveShortcutBtn');
  const shortcutTypeToggle = document.getElementById('shortcutTypeToggle');

  console.log('guardarPlantillaRapida: Elementos encontrados:', {
    shortcutFormModal: !!shortcutFormModal,
    shortcutTemplateTextarea: !!shortcutTemplateTextarea,
    shortcutNameInput: !!shortcutNameInput
  });

  if (!shortcutFormModal || !shortcutTemplateTextarea) {
    console.error('guardarPlantillaRapida: No se encontraron los elementos del modal');
    window.showNotification('Error al abrir el formulario de plantilla', 'error');
    return;
  }

  // Reset form
  if (shortcutIdInput) shortcutIdInput.value = '';
  if (shortcutNameInput) shortcutNameInput.value = '';
  if (shortcutKeyInput) shortcutKeyInput.value = '';
  if (shortcutCategorySelect) shortcutCategorySelect.value = 'General';
  if (shortcutTypeToggle) shortcutTypeToggle.checked = false;
  if (shortcutFormTitle) shortcutFormTitle.textContent = 'Crear Plantilla Nueva';
  if (saveShortcutBtn) saveShortcutBtn.textContent = 'Guardar Plantilla';

  // Pre-load the content
  shortcutTemplateTextarea.value = contenido;
  console.log('guardarPlantillaRapida: Contenido cargado en textarea');

  // Open the modal
  shortcutFormModal.style.display = 'flex';
  shortcutFormModal.style.zIndex = '10001'; // Asegurar que esté por encima del modal genobs (z-index: 1000)
  console.log('guardarPlantillaRapida: Modal abierto');

  // Focus on the name input so user can start typing immediately
  setTimeout(() => {
    if (shortcutNameInput) {
      shortcutNameInput.focus();
      console.log('guardarPlantillaRapida: Focus en nombre');
    }
  }, 100);

  window.showNotification('Completa el formulario para guardar tu plantilla', 'info');
  console.log('guardarPlantillaRapida: Completado');
};

