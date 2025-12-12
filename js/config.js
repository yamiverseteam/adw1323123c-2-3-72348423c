// Function to initialize configuration module
export function initializeConfig() {
  const openConfigBtn = document.getElementById("openConfigBtn");
  const configModal = document.getElementById("configModal");
  const configNavItems = document.querySelectorAll(".config-nav-item");
  const configSections = document.querySelectorAll(".config-section");

  const exportHistoryBtn = document.getElementById("exportHistoryBtn");
  const importHistoryBtn = document.getElementById("importHistoryBtn");
  const importHistoryInput = document.getElementById("importHistoryInput");

  const exportAllDataBtn = document.getElementById("exportAllDataBtn");

  if (openConfigBtn) {
    openConfigBtn.addEventListener("click", () => {
      configModal.style.display = "flex";
    });
  }

  // Handle navigation between config sections
  if (configNavItems) {
    configNavItems.forEach((navItem) => {
      navItem.addEventListener("click", () => {
        const sectionId = navItem.dataset.section;

        // Update active state for nav items
        configNavItems.forEach((item) => item.classList.remove("active"));
        navItem.classList.add("active");

        // Show the corresponding section and hide others
        configSections.forEach((section) => {
          if (section.id === `${sectionId}-section`) {
            section.classList.add("active");
          } else {
            section.classList.remove("active");
          }
        });
      });
    });
  }

  // Helper function to download data as a text file
  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Helper function to read file content
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // Import History
  if (importHistoryBtn && importHistoryInput) {
    importHistoryBtn.addEventListener("click", () => {
      importHistoryInput.click(); // Trigger the hidden file input
    });

    importHistoryInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const content = await readFile(file);
          // Validate if content is valid JSON before saving
          JSON.parse(content); // This will throw an error if not valid JSON
          localStorage.setItem("history", content);
          showNotification("Historial importado correctamente.");
          // Optionally, re-render history if it's visible
          if (typeof mostrarHistorial === "function") {
            mostrarHistorial();
          }
        } catch (error) {
          showNotification(
            "Error al importar historial: Archivo inválido o formato incorrecto.",
            "error"
          );
          console.error("Error importing history:", error);
        }
      }
    });
  }

  // Export All Data
  if (exportAllDataBtn) {
    exportAllDataBtn.addEventListener("click", () => {
      const historyData = localStorage.getItem("historial"); // Corrected key
      const tagsData = localStorage.getItem("shortcuts");
      const customTimersData = localStorage.getItem("customTimers");
      const selectedThemeData = localStorage.getItem("selectedTheme");
      const pipTimerPresetsData = localStorage.getItem("pipTimer_presets");
      const pipTimerSelectedSoundData = localStorage.getItem(
        "pipTimer_selectedSound"
      );

      const allData = {
        history: historyData ? JSON.parse(historyData) : [],
        tags: tagsData ? JSON.parse(tagsData) : [],
        customTimers: customTimersData ? JSON.parse(customTimersData) : [],
        selectedTheme: selectedThemeData || "tema_mundo", // Default theme
        pipTimerPresets: pipTimerPresetsData
          ? JSON.parse(pipTimerPresetsData)
          : [],
        pipTimerSelectedSound: pipTimerSelectedSoundData || "Classic Beep", // Default alarm sound
      };

      const fileName = `backup_tipifypro_${new Date()
        .toISOString()
        .slice(0, 10)}.txt`; // Changed extension to .txt
      downloadFile(fileName, JSON.stringify(allData, null, 2)); // Content remains JSON string
      showNotification(
        "Todos los datos (Historial, Atajos, Temporizadores, Tema y Alarma) exportados correctamente."
      );
    });
  }

  // Import All Data
  const importAllDataBtn = document.createElement("button");
  importAllDataBtn.innerHTML = `<i class="material-icons">cloud_upload</i> Importar Todo`;
  const exportImportSection = document.querySelector(
    "#export-import-section .data-section:last-child .config-actions"
  );
  if (exportImportSection) {
    exportImportSection.appendChild(importAllDataBtn);
  }

  const importAllDataInput = document.createElement("input");
  importAllDataInput.type = "file";
  importAllDataInput.accept = ".json";
  importAllDataInput.style.display = "none";
  if (exportImportSection) {
    exportImportSection.appendChild(importAllDataInput);
  }

  importAllDataBtn.addEventListener("click", () => {
    importAllDataInput.click();
  });

  importAllDataInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const content = await readFile(file);
        const allData = JSON.parse(content);

        if (allData.history) {
          localStorage.setItem("historial", JSON.stringify(allData.history)); // Corrected key
        }
        if (allData.tags) {
          localStorage.setItem("shortcuts", JSON.stringify(allData.tags));
        }
        if (allData.customTimers) {
          localStorage.setItem(
            "customTimers",
            JSON.stringify(allData.customTimers)
          );
        }
        if (allData.selectedTheme) {
          localStorage.setItem("selectedTheme", allData.selectedTheme);
        }
        if (allData.pipTimerPresets) {
          localStorage.setItem(
            "pipTimer_presets",
            JSON.stringify(allData.pipTimerPresets)
          );
        }
        if (allData.pipTimerSelectedSound) {
          localStorage.setItem(
            "pipTimer_selectedSound",
            allData.pipTimerSelectedSound
          );
        }

        showNotification("Todos los datos importados correctamente.");
        // Optionally, re-render relevant parts of the UI
        if (typeof mostrarHistorial === "function") {
          mostrarHistorial();
        }
        if (typeof renderShortcuts === "function") {
          renderShortcuts();
        }
        if (typeof loadTimers === "function") {
          loadTimers();
        }
        if (typeof applyTheme === "function") {
          applyTheme(allData.selectedTheme);
        }
        // For alarm sound and presets, a page reload might be necessary or specific functions to re-initialize
        // For simplicity, we'll assume a reload or that alarm.js handles its own loading on init.
        // If there's a specific function to reload alarm settings, it should be called here.
        // For now, we'll rely on the next page load for alarm settings to take effect.
      } catch (error) {
        showNotification(
          "Error al importar datos: Archivo inválido o formato incorrecto.",
          "error"
        );
        console.error("Error importing all data:", error);
      }
    }
  });

  const exportObservationsBtn = document.createElement("button");
  exportObservationsBtn.innerHTML = `<i class="material-icons">description</i> Exportar Observaciones`;
  exportObservationsBtn.style.marginLeft = "10px";
  const exportImportSectionFirst = document.querySelector(
    "#export-import-section .data-section:first-child .config-actions"
  );
  if (exportImportSectionFirst) {
    exportImportSectionFirst.appendChild(exportObservationsBtn);
  }
  if (exportObservationsBtn) {
    exportObservationsBtn.addEventListener("click", () => {
      const historial = JSON.parse(localStorage.getItem("historial")) || [];
      if (historial.length === 0) {
        showNotification("No hay observaciones para exportar.", "error");
        return;
      }

      // Extract observation text with typification for export
      const observacionesExport = historial.map((entry) => {
        let typification = "No definida";
        if (entry.formData && entry.formData.selectedTypification) {
          typification = entry.formData.selectedTypification;
        } else if (entry.formData && entry.formData["Tipo de servicio"]) {
          // Fallback for older entries or different naming
          typification = entry.formData["Tipo de servicio"];
        }

        const observationText = typeof entry === "string" ? entry : entry.text;
        return `--- TIPO DE TIPIFICACIÓN: ${typification} ---\n${observationText}`;
      });

      const contenido = observacionesExport.join(
        "\n\n" + "=".repeat(50) + "\n\n"
      );
      const fecha = new Date().toISOString().slice(0, 10);
      const blob = new Blob([contenido], { type: "text/plain; charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `observaciones_historial_${fecha}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);

      showNotification("Observaciones exportadas correctamente.");
    });
  }
}
