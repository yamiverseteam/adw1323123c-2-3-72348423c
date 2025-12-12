export function initializeHistory() {
  // Inicializar componentes y eventos del historial
  const historyModal = document.getElementById("historyModal");
  const openHistoryBtn = document.getElementById("openHistoryBtn");
  const historyFilter = document.getElementById("historyFilter");
  const filterDateFrom = document.getElementById("filterDateFrom");
  const filterDateTo = document.getElementById("filterDateTo");
  const exportHistoryBtn = document.getElementById("exportHistoryBtn");
  const openImportModalBtn = document.getElementById("openImportModalBtn");
  const importTxtBtn = document.getElementById("importTxtBtn");
  const importXlsBtn = document.getElementById("importXlsBtn");
  const importHistoryTxtInput = document.getElementById("importHistoryTxtInput");
  const importHistoryXlsInput = document.getElementById("importHistoryXlsInput");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const openExportModalBtn = document.getElementById("openExportModalBtn");
  const exportTxtBtn = document.getElementById("exportTxtBtn");
  const exportXlsBtn = document.getElementById("exportXlsBtn");
  const exportHistoryXlsBtn = document.getElementById("exportHistoryXlsBtn");

  // Configurar event listeners
  if (openHistoryBtn) {
    openHistoryBtn.addEventListener("click", () => {
      if (historyModal) {
        window.abrirModal("historyModal");
        mostrarHistorial();
      }
    });
  }

  if (historyFilter) {
    historyFilter.addEventListener("input", mostrarHistorial);
  }

  if (filterDateFrom) {
    filterDateFrom.addEventListener("change", mostrarHistorial);
  }

  if (filterDateTo) {
    filterDateTo.addEventListener("change", mostrarHistorial);
  }

  // Open export modal from history modal
  if (openExportModalBtn) {
    openExportModalBtn.addEventListener("click", () => {
      window.abrirModal("exportHistoryModal");
    });
  }

  // Open export modal from config modal
  const openExportModalBtnConfig = document.getElementById("openExportModalBtnConfig");
  if (openExportModalBtnConfig) {
    openExportModalBtnConfig.addEventListener("click", () => {
      window.abrirModal("exportHistoryModal");
    });
  }

  // Open import modal from config modal
  const openImportModalBtnConfig = document.getElementById("openImportModalBtnConfig");
  if (openImportModalBtnConfig) {
    openImportModalBtnConfig.addEventListener("click", () => {
      window.abrirModal("importHistoryModal");
    });
  }

  // Export as TXT from export modal
  if (exportTxtBtn) {
    exportTxtBtn.addEventListener("click", () => {
      exportarHistorial();
      window.cerrarModal("exportHistoryModal");
    });
  }

  // Export as XLS from export modal
  if (exportXlsBtn) {
    exportXlsBtn.addEventListener("click", () => {
      exportarHistorialXLS();
      window.cerrarModal("exportHistoryModal");
    });
  }

  // Open import modal from history modal
  const openImportModalBtnHistory = document.getElementById("openImportModalBtnHistory");
  if (openImportModalBtnHistory) {
    openImportModalBtnHistory.addEventListener("click", () => {
      window.abrirModal("importHistoryModal");
    });
  }

  // Import TXT button - triggers file input
  if (importTxtBtn && importHistoryTxtInput) {
    importTxtBtn.addEventListener("click", () => {
      importHistoryTxtInput.click();
    });

    importHistoryTxtInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        importarHistorialTXT(e.target.files[0]);
        window.cerrarModal("importHistoryModal");
        e.target.value = ""; // Reset input
      }
    });
  }

  // Import XLS button - triggers file input
  if (importXlsBtn && importHistoryXlsInput) {
    importXlsBtn.addEventListener("click", () => {
      importHistoryXlsInput.click();
    });

    importHistoryXlsInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        importarHistorialXLS(e.target.files[0]);
        window.cerrarModal("importHistoryModal");
        e.target.value = ""; // Reset input
      }
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", limpiarHistorial);
  }

  // Exponer funciones globalmente para uso en HTML
  window.mostrarHistorial = mostrarHistorial;
  window.exportarHistorial = exportarHistorial;
  window.exportarHistorialXLS = exportarHistorialXLS;
  window.limpiarHistorial = limpiarHistorial;
  window.importarHistorialTXT = importarHistorialTXT;
  window.importarHistorialXLS = importarHistorialXLS;
}

export function exportarHistorial() {
  const historial = JSON.parse(localStorage.getItem("historial")) || [];
  console.log("Historial data before export:", historial); // Debugging log
  if (historial.length === 0) {
    alert("No hay historial para exportar.");
    showNotification("No hay historial para exportar.", "error");
    return;
  }
  // Extract observation text and typification from each entry
  const contenidoHistorial = historial.map((entry) => {
    let entryParts = [];
    if (typeof entry !== "string" && entry.typificationType) {
      entryParts.push(`Tipo de Tipificación: ${entry.typificationType}`);
    }
    // Removed "Detalle de Tipificación" as per user request
    entryParts.push(`Observación: ${entry.text || entry || "N/A"}`); // Handle old string format or new object format

    // Add survey URLs if available
    if (entry.urlSondeo) {
      entryParts.push(`URL FORMULARIO SONDEO: ${entry.urlSondeo}`);
    }
    if (entry.urlPersiste) {
      entryParts.push(`URL Persiste: ${entry.urlPersiste}`);
    }
    // Backward compatibility for old entries with single URL
    if (entry.url && !entry.urlSondeo && !entry.urlPersiste) {
      entryParts.push(`URL FORMULARIO SONDEO: ${entry.url}`);
    }

    return entryParts.join("\n");
  });
  console.log("Extracted content for export:", contenidoHistorial); // Debugging log

  // For debugging: show the first observation in a notification
  if (contenidoHistorial.length > 0) {
    showNotification(
      `Exportando: "${contenidoHistorial[0].substring(0, 50)}..."`,
      "info"
    );
  }

  const tituloArchivo = "HISTORIAL DE TIPIFICACIONES";
  const separador = "\n----------------------------------------\n";
  const contenido =
    tituloArchivo + separador + contenidoHistorial.join(separador); // Add title and separated by multiple hyphens
  const fecha = new Date().toISOString().slice(0, 10);
  const blob = new Blob([contenido], { type: "text/plain; charset=utf-8" }); // Ensure UTF-8
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `historial_tipificacion_${fecha}.txt`;
  link.click();
  URL.revokeObjectURL(link.href); // Clean up the URL object
  showNotification("Historial exportado correctamente.");
}

export function exportarHistorialXLS() {
  const historial = JSON.parse(localStorage.getItem("historial")) || [];

  if (historial.length === 0) {
    window.showNotification("No hay historial para exportar.", "error");
    return;
  }

  // Prepare data for Excel
  const excelData = historial.map((entry, index) => {
    return {
      "N°": index + 1,
      "Fecha": entry.date
        ? new Date(entry.date).toLocaleString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "N/A",
      "RUT": entry.rut || "N/A",
      "Tipo de Tipificación": entry.typificationType || "N/A",
      "Observación": entry.text || "N/A",
      "URL FORMULARIO SONDEO": entry.urlSondeo || entry.url || "N/A",
      "URL Persiste": entry.urlPersiste || "N/A",
    };
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Convert URLs to hyperlinks
  excelData.forEach((row, index) => {
    const rowIndex = index + 2; // +2 because Excel is 1-indexed and we have a header row

    // URL FORMULARIO SONDEO hyperlink (column F)
    if (row["URL FORMULARIO SONDEO"] && row["URL FORMULARIO SONDEO"] !== "N/A") {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex - 1, c: 5 }); // Column F (0-indexed: 5)
      ws[cellAddress] = {
        t: 's',
        v: row["URL FORMULARIO SONDEO"],
        l: { Target: row["URL FORMULARIO SONDEO"] }
      };
    }

    // URL Persiste hyperlink (column G)
    if (row["URL Persiste"] && row["URL Persiste"] !== "N/A") {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex - 1, c: 6 }); // Column G (0-indexed: 6)
      ws[cellAddress] = {
        t: 's',
        v: row["URL Persiste"],
        l: { Target: row["URL Persiste"] }
      };
    }
  });

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // N°
    { wch: 18 },  // Fecha
    { wch: 15 },  // RUT
    { wch: 20 },  // Tipo de Tipificación
    { wch: 80 },  // Observación
    { wch: 60 },  // URL FORMULARIO SONDEO
    { wch: 60 },  // URL Persiste
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Historial");

  // Generate file name with current date
  const fecha = new Date().toISOString().slice(0, 10);
  const fileName = `historial_tipificacion_${fecha}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);

  window.showNotification("Historial exportado a Excel correctamente.", "success");
}

export function limpiarHistorial() {
  showHistoryConfirmationModal(
    "¿Está seguro de que desea limpiar todo el historial?",
    () => {
      localStorage.removeItem("historial");
      mostrarHistorial();
      window.showNotification("Historial limpiado exitosamente.", "success");
    }
  );
}

export function guardarEnHistorial(observacion, rut, formData, urlSondeo, urlPersiste) {
  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  const selectedTypification = localStorage.getItem("selectedTypification"); // Get the selected typification
  const newEntry = {
    text: observacion,
    date: new Date().toISOString(),
    rut: rut,
    formData: formData,
    url: urlSondeo, // Keep for backward compatibility
    urlSondeo: urlSondeo,
    urlPersiste: urlPersiste,
    typificationType: selectedTypification, // Store the typification type
  };

  // Check if an entry with the same RUT already exists
  const existingIndex = historial.findIndex((entry) => entry.rut === rut);

  if (existingIndex !== -1) {
    // If an entry exists, replace it with the new one (most recent)
    historial[existingIndex] = newEntry;
  } else {
    // If no entry exists, add the new one to the beginning
    historial.unshift(newEntry);
  }

  localStorage.setItem("historial", JSON.stringify(historial));
  // No need to call mostrarHistorial here as it's not visible
}

export function importarHistorialTXT(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;

      // Remove the title if present
      let cleanContent = content.replace(/^HISTORIAL DE TIPIFICACIONES\s*-+\s*/i, '');

      // Split by separator (multiple hyphens)
      const entries = cleanContent
        .split(/\n-{10,}\n/)
        .filter((entry) => entry.trim() !== "");

      let historial = JSON.parse(localStorage.getItem("historial")) || [];
      let importedCount = 0;

      entries.forEach((entryText) => {
        const lines = entryText.split('\n').filter(line => line.trim() !== '');

        // Parse the entry
        const entry = {
          text: "",
          date: new Date().toISOString(),
          rut: null,
          typificationType: null,
          urlSondeo: null,
          urlPersiste: null,
          url: null,
          formData: {}
        };

        lines.forEach(line => {
          if (line.startsWith('Tipo de Tipificación:')) {
            entry.typificationType = line.replace('Tipo de Tipificación:', '').trim();
          } else if (line.startsWith('Observación:')) {
            entry.text = line.replace('Observación:', '').trim();
          } else if (line.startsWith('URL FORMULARIO SONDEO:')) {
            const url = line.replace('URL FORMULARIO SONDEO:', '').trim();
            entry.urlSondeo = url;
            entry.url = url; // For backward compatibility
          } else if (line.startsWith('URL Persiste:')) {
            entry.urlPersiste = line.replace('URL Persiste:', '').trim();
          }
        });

        // Only add if we have at least observation text
        if (entry.text) {
          historial.unshift(entry);
          importedCount++;
        }
      });

      localStorage.setItem("historial", JSON.stringify(historial));
      mostrarHistorial();
      window.showNotification(`${importedCount} entradas importadas exitosamente desde TXT.`, "success");
    } catch (error) {
      console.error("Error al importar historial TXT:", error);
      window.showNotification("Error al importar historial desde TXT.", "error");
    }
  };
  reader.readAsText(file);
}

export function importarHistorialXLS(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let historial = JSON.parse(localStorage.getItem("historial")) || [];
      let importedCount = 0;

      jsonData.forEach((row) => {
        // Map Excel columns to history entry structure
        const entry = {
          text: row['Observación'] || row['Observacion'] || "",
          date: row['Fecha'] ? parseDateFromExcel(row['Fecha']) : new Date().toISOString(),
          rut: row['RUT'] || null,
          typificationType: row['Tipo de Tipificación'] || row['Tipo de Tipificacion'] || null,
          urlSondeo: row['URL FORMULARIO SONDEO'] || null,
          urlPersiste: row['URL Persiste'] || null,
          url: row['URL FORMULARIO SONDEO'] || null, // For backward compatibility
          formData: {}
        };

        // Only add if we have at least observation text
        if (entry.text && entry.text !== "N/A") {
          historial.unshift(entry);
          importedCount++;
        }
      });

      localStorage.setItem("historial", JSON.stringify(historial));
      mostrarHistorial();
      window.showNotification(`${importedCount} entradas importadas exitosamente desde Excel.`, "success");
    } catch (error) {
      console.error("Error al importar historial XLS:", error);
      window.showNotification("Error al importar historial desde Excel. Verifica que el archivo tenga el formato correcto.", "error");
    }
  };
  reader.readAsArrayBuffer(file);
}

// Helper function to parse dates from Excel
function parseDateFromExcel(dateValue) {
  try {
    // If it's already a valid ISO string
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      return dateValue;
    }

    // If it's a date string in Spanish format (DD/MM/YYYY HH:MM)
    if (typeof dateValue === 'string') {
      // Try to parse Spanish date format
      const parts = dateValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})/);
      if (parts) {
        const [, day, month, year, hour, minute] = parts;
        return new Date(year, month - 1, day, hour, minute).toISOString();
      }
    }

    // If it's an Excel serial date number
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return date.toISOString();
    }

    // Fallback to current date
    return new Date().toISOString();
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date().toISOString();
  }
}

import { construirYEnviarSondeo } from "./survey.js";
import { createSurveyPersisteModal } from "./surveyPersisteModal.js";
import { construirYEnviarSondeoPersiste } from "./surveyPersiste.js";

export function mostrarHistorial() {
  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  const tableBody = document.getElementById("historyTableBody");
  const filterText = document
    .getElementById("historyFilter")
    .value.toLowerCase();
  const dateFrom = document.getElementById("filterDateFrom").value;
  const dateTo = document.getElementById("filterDateTo").value;

  tableBody.innerHTML = ""; // Clear previous content

  // Backward compatibility: convert old string entries to new object format
  historial = historial.map((entry) => {
    if (typeof entry === "string") {
      return { text: entry, date: null, url: null }; // Old entries have no date or URL
    }
    return entry;
  });

  const filteredHistorial = historial.filter((entry) => {
    // Improved filter: search across multiple fields
    const searchableText = [
      entry.text || "",
      entry.rut || "",
      entry.typificationType || "",
      entry.date ? new Date(entry.date).toLocaleDateString("es-ES") : ""
    ].join(" ").toLowerCase();

    const textMatch = searchableText.includes(filterText);
    if (!textMatch) return false;

    if (dateFrom && entry.date) {
      if (new Date(entry.date) < new Date(dateFrom)) return false;
    }
    if (dateTo && entry.date) {
      // Add 1 day to 'dateTo' to include the entire day
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1);
      if (new Date(entry.date) > toDate) return false;
    }
    return true;
  });

  if (filteredHistorial.length > 0) {
    const tableContainer = document.createElement("div");
    tableContainer.className = "history-table-container";
    const table = document.createElement("table");
    table.className = "history-table";
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Fecha</th>
        <th>RUT</th>
        <th>Observación</th>
        <th style="width: 200px;">Acciones</th>
      </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");

    filteredHistorial.forEach((entry) => {
      const row = document.createElement("tr");

      // 1. Date Cell
      const dateCell = document.createElement("td");
      dateCell.textContent = entry.date
        ? new Date(entry.date).toLocaleString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "N/A";
      row.appendChild(dateCell);

      // 2. RUT Cell
      const rutCell = document.createElement("td");
      rutCell.textContent = entry.rut || "N/A";
      row.appendChild(rutCell);

      // 3. Observation Cell
      const observationCell = document.createElement("td");
      observationCell.textContent = entry.text || "N/A";
      row.appendChild(observationCell);

      // 4. Actions Cell
      const actionsCell = document.createElement("td");
      actionsCell.className = "actions-cell";

      // Detail Button
      const detailButton = document.createElement("button");
      detailButton.title = "Ver Detalle";
      detailButton.innerHTML = '<i class="material-icons">info</i>';
      detailButton.addEventListener("click", () => {
        window.showHistoryDetail(entry);
      });
      actionsCell.appendChild(detailButton);

      // Copy Observation Button
      const copyObsButton = document.createElement("button");
      copyObsButton.title = "Copiar Observación";
      copyObsButton.innerHTML = '<i class="material-icons">content_copy</i>';
      copyObsButton.addEventListener("click", () => {
        window.copyToClipboard(entry.text);
      });
      actionsCell.appendChild(copyObsButton);

      // View/Copy Survey URL Button
      const openSurveyModalButton = document.createElement("button");
      openSurveyModalButton.title = "Abrir Sondeo";
      openSurveyModalButton.innerHTML = '<i class="material-icons">link</i>';
      openSurveyModalButton.addEventListener("click", () => {
        if (entry.url) {
          construirYEnviarSondeo(entry.url);
          window.abrirModal("surveyModal"); // Open the modal
        } else {
          window.showNotification(
            "No hay URL de sondeo para esta entrada.",
            "error"
          );
        }
      });
      actionsCell.appendChild(openSurveyModalButton);

      // Open Persistent Survey Modal Button
      const openPersisteModalButton = document.createElement("button");
      openPersisteModalButton.title = "Abrir Cliente Persiste";
      openPersisteModalButton.innerHTML =
        '<i class="material-icons">launch</i>';
      openPersisteModalButton.addEventListener("click", () => {
        const sondeoPersisteData = JSON.parse(
          localStorage.getItem("sondeoPersiste")
        );
        const surveyPersisteUrl = sondeoPersisteData
          ? sondeoPersisteData.surveyUrl
          : null;
        if (surveyPersisteUrl) {
          // Open Modal
          let modal = document.getElementById("surveyPersisteModal");
          if (!modal) {
            createSurveyPersisteModal();
          }
          construirYEnviarSondeoPersiste(surveyPersisteUrl);
          window.abrirModal("surveyPersisteModal");
        } else {
          window.showNotification(
            "No hay URL de sondeo persistente para esta entrada.",
            "error"
          );
        }
      });
      actionsCell.appendChild(openPersisteModalButton);

      // Delete Button
      const deleteButton = document.createElement("button");
      deleteButton.title = "Eliminar";
      deleteButton.innerHTML = '<i class="material-icons">delete</i>';
      deleteButton.addEventListener("click", () => {
        window.eliminarDelHistorial(entry.date);
      });
      actionsCell.appendChild(deleteButton);

      row.appendChild(actionsCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    tableBody.appendChild(tableContainer);
  } else {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="no-results">No se encontraron registros.</td>`;
    tableBody.appendChild(row);
  }
}

// Helper function to be added in the global scope or imported where needed
window.copyToClipboard = (text) => {
  if (typeof text !== "string" || !text) {
    window.showNotification("No hay observación para copiar.", "error");
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      window.showNotification(
        "¡Observación copiada al portapapeles!",
        "success"
      );
    })
    .catch((err) => {
      console.error("Error al copiar la observación:", err);
      window.showNotification("Error al copiar la observación.", "error");
    });
};

window.eliminarDelHistorial = (date) => {
  showHistoryConfirmationModal(
    "¿Está seguro de que desea eliminar este registro?",
    () => {
      let historial = JSON.parse(localStorage.getItem("historial")) || [];
      historial = historial.filter((entry) => entry.date !== date);
      localStorage.setItem("historial", JSON.stringify(historial));
      mostrarHistorial();
      window.showNotification("Registro eliminado exitosamente.", "success");
    }
  );
};

function showHistoryConfirmationModal(message, onConfirm) {
  const modal = document.getElementById("historyConfirmDeleteModal");
  const textElement = document.getElementById("historyConfirmDeleteText");
  const confirmBtn = document.getElementById("historyConfirmDeleteBtn");
  const cancelBtn = document.getElementById("historyCancelDeleteBtn");

  textElement.textContent = message;
  modal.style.display = "flex";

  const confirmHandler = () => {
    onConfirm();
    closeModal();
  };

  const cancelHandler = () => {
    closeModal();
  };

  const closeModal = () => {
    modal.style.display = "none";
    confirmBtn.removeEventListener("click", confirmHandler);
    cancelBtn.removeEventListener("click", cancelHandler);
  };

  confirmBtn.addEventListener("click", confirmHandler);
  cancelBtn.addEventListener("click", cancelHandler);
}

// Function to show detailed history entry information
window.showHistoryDetail = (entry) => {
  const modal = document.getElementById("historyDetailModal");
  const detailBody = document.getElementById("historyDetailBody");
  const copyBtn = document.getElementById("copyDetailObsBtn");

  // Format the date
  const formattedDate = entry.date
    ? new Date(entry.date).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
    : "N/A";

  // Build the detail content with horizontal layout
  let detailHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <!-- Left Column -->
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="detail-section">
          <h3 style="color: var(--accent-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 14px;">
            <i class="material-icons" style="font-size: 18px;">event</i>
            Información General
          </h3>
          <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; border-left: 3px solid var(--accent-primary);">
            <div style="margin-bottom: 8px;">
              <strong style="color: var(--text-secondary); font-size: 12px;">Fecha y Hora:</strong>
              <p style="margin: 3px 0; color: var(--text-primary); font-size: 13px;">${formattedDate}</p>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: var(--text-secondary); font-size: 12px;">RUT:</strong>
              <p style="margin: 3px 0; color: var(--text-primary); font-size: 13px;">${entry.rut || "N/A"}</p>
            </div>
            <div>
              <strong style="color: var(--text-secondary); font-size: 12px;">Tipo de Tipificación:</strong>
              <p style="margin: 3px 0; color: var(--text-primary); font-size: 13px;">${entry.typificationType || "N/A"}</p>
            </div>
          </div>
        </div>
  `;

  // Add URLs if available
  if (entry.urlSondeo || entry.url || entry.urlPersiste) {
    detailHTML += `
        <div class="detail-section">
          <h3 style="color: var(--accent-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 14px;">
            <i class="material-icons" style="font-size: 18px;">link</i>
            Enlaces
          </h3>
          <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; border-left: 3px solid var(--accent-primary); display: flex; flex-direction: column; gap: 8px;">
    `;

    if (entry.urlSondeo || entry.url) {
      const sondeoUrl = entry.urlSondeo || entry.url;
      detailHTML += `
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="color: var(--text-secondary); font-size: 12px;">URL Formulario Sondeo:</strong>
          <button onclick="window.copyToClipboard('${sondeoUrl.replace(/'/g, "\\'")}')" style="background: var(--accent-primary); color: var(--button-text-color); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px; white-space: nowrap;" title="Copiar URL Sondeo">
            <i class="material-icons" style="font-size: 16px;">content_copy</i>
            Copiar
          </button>
        </div>
      `;
    }

    if (entry.urlPersiste) {
      detailHTML += `
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="color: var(--text-secondary); font-size: 12px;">URL Persiste:</strong>
          <button onclick="window.copyToClipboard('${entry.urlPersiste.replace(/'/g, "\\'")}')" style="background: var(--accent-primary); color: var(--button-text-color); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px; white-space: nowrap;" title="Copiar URL Persiste">
            <i class="material-icons" style="font-size: 16px;">content_copy</i>
            Copiar
          </button>
        </div>
      `;
    }

    detailHTML += `
          </div>
        </div>
    `;
  }

  detailHTML += `
      </div>
      
      <!-- Right Column -->
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="detail-section">
          <h3 style="color: var(--accent-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 14px;">
            <i class="material-icons" style="font-size: 18px;">description</i>
            Observación
          </h3>
          <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; border-left: 3px solid var(--accent-primary); max-height: 150px; overflow-y: auto;">
            <p style="white-space: pre-wrap; line-height: 1.5; color: var(--text-primary); font-size: 13px; margin: 0;">${entry.text || "N/A"}</p>
          </div>
        </div>
  `;

  // Add form data if available
  if (entry.formData) {
    detailHTML += `
        <div class="detail-section">
          <h3 style="color: var(--accent-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; font-size: 14px;">
            <i class="material-icons" style="font-size: 18px;">assignment</i>
            Datos del Formulario
          </h3>
          <div style="background: var(--bg-secondary); padding: 12px; border-radius: 6px; border-left: 3px solid var(--accent-primary); max-height: 120px; overflow-y: auto;">
    `;

    for (const [key, value] of Object.entries(entry.formData)) {
      if (value && value !== "" && value !== "N/A") {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        detailHTML += `
          <div style="margin-bottom: 6px;">
            <strong style="color: var(--text-secondary); font-size: 12px;">${formattedKey}:</strong>
            <span style="color: var(--text-primary); margin-left: 6px; font-size: 12px;">${value}</span>
          </div>
        `;
      }
    }

    detailHTML += `
          </div>
        </div>
    `;
  }

  detailHTML += `
      </div>
    </div>
  `;

  detailBody.innerHTML = detailHTML;

  // Update copy button handler
  copyBtn.onclick = () => {
    window.copyToClipboard(entry.text);
  };

  // Show the modal
  modal.style.display = "flex";
};
