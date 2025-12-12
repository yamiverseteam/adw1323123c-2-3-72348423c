export let formDataForSurvey = {}; // Variable global para los datos

// La función collectSurveyData() se mantiene igual...
export function collectSurveyData() {
  // Preserve the existing survey URL from localStorage before rebuilding the data object
  const existingSondeoData = JSON.parse(localStorage.getItem("sondeo")) || {};
  const existingSurveyUrl = existingSondeoData.surveyUrl;

  // Clear all existing properties from formDataForSurvey to ensure a fresh start
  for (const key in formDataForSurvey) {
    delete formDataForSurvey[key];
  }

  // Data from the main form
  Object.assign(formDataForSurvey, {
    RUT: document.getElementById("clienteRUT")?.value || "",
    NOMBRE: document.getElementById("clienteNombre")?.value || "", // Add Name
    "SERVICIO CON LA FALLA":
      document.getElementById("tipoServicio")?.value || "", // Ahora se obtiene de tipoServicio en el modal genobs
    CONTRATO: document.getElementById("clienteContrato")?.value || "",
    ID_CLIENTE: document.getElementById("clienteID")?.value || "", // Client ID from the form
    CEDULA_EJECUTIVO: localStorage.getItem("documentNumber") || "", // Agent's ID from login
    TELÉFONO: (() => {
      const domValue = document.getElementById("clienteTelefono")?.value || "";
      localStorage.setItem("genobs_clienteTelefono", domValue);
      return domValue;
    })(),
    "DIRECCIÓN CLIENTE":
      document.getElementById("clienteDireccion")?.value || "",
    ONT: (() => {
      const domValue = document.getElementById("clienteONT")?.value || "";
      localStorage.setItem("genobs_clienteONT", domValue);
      return domValue;
    })(),
    OLT: (() => {
      const domValue = document.getElementById("clienteOLT")?.value || "";
      localStorage.setItem("genobs_clienteOLT", domValue);
      return domValue;
    })(),
    TARJETA: (() => {
      const domValue = document.getElementById("clienteTarjeta")?.value || "";
      localStorage.setItem("genobs_clienteTarjeta", domValue);
      return domValue;
    })(),
    PUERTO: (() => {
      const domValue = document.getElementById("clientePuerto")?.value || "";
      localStorage.setItem("genobs_clientePuerto", domValue);
      return domValue;
    })(),
    NODO: (() => {
      const domValue = document.getElementById("clienteNodo")?.value || "";
      localStorage.setItem("genobs_clienteNodo", domValue);
      return domValue;
    })(),
    "OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO":
      document.getElementById("observacionForm")?.value || "",
    CORREO: document.getElementById("clienteCorreo")?.value || "", // Nuevo campo para el correo
  });

  // Data from the genobs modal
  const genobsModalFields = {
    "PERDIDA DE MONITOREO":
      document.getElementById("perdidaMonitoreo")?.value || "", // Nuevo campo para pérdida de monitoreo
    "Desde Cuando Presenta la Falla":
      document.getElementById("tiempoFalla")?.value || "",
    "Suministro Eléctrico":
      document.getElementById("suministroElectrico")?.value || "",
    "Generador Eléctrico":
      document.getElementById("generadorElectrico")?.value || "",
    "Tipo de servicio": document.getElementById("tipoServicio")?.value || "",
    "Tipo de servicio General":
      document.getElementById("tipoServicioGeneral")?.value || "",
    "Inconvenientes Instalación/Reparación": (() => {
      const domValue =
        document.getElementById("instalacionReparacion")?.value || "";
      localStorage.setItem("genobs_instalacionReparacion", domValue); // Save the DOM value to localStorage
      return domValue; // Return the DOM value for formDataForSurvey
    })(),
    "El cliente es reincidente":
      document.getElementById("clienteReincidente")?.value || "",
    "Estado Luces": document.getElementById("estadoLuces")?.value || "",
    "Estado ONT": document.getElementById("estadoOnt")?.value || "",
    "Cliente Masiva": document.getElementById("clienteMasiva")?.value || "",
    "Falla Masiva": document.getElementById("fallaMasiva")?.value || "",
    "Visita Técnica": document.getElementById("visitaTecnica")?.value || "",
    "Soporte Generado": document.getElementById("soporteGenerado")?.value || "",
    "Falla Respuesta Genobs":
      document.getElementById("fallaRespuestaGenobs")?.value || "",
    "Control Remoto": document.getElementById("controlRemoto")?.value || "",
    "Cambio Pilas": document.getElementById("cambioPilas")?.value || "",
    "Prueba Cruzada": document.getElementById("pruebaCruzada")?.value || "",
    Decodificador: document.getElementById("decodificador")?.value || "",
    "Reinicio Eléctrico":
      document.getElementById("reinicioElectrico")?.value || "",
    "Cable HDMI/AV": document.getElementById("cableHDMIAV")?.value || "",
    "Observacion TV": document.getElementById("observacionTV")?.value || "",
  };

  Object.assign(formDataForSurvey, genobsModalFields);

  // If a survey URL was previously generated and stored, re-assign it to the new data object
  if (existingSurveyUrl) {
    formDataForSurvey.surveyUrl = existingSurveyUrl;
  }
}

/**
 * Esta función construye la URL COMPLETA con todos los parámetros
 * y la devuelve. No abre ninguna ventana ni modal.
 */
export function buildSurveyUrl() {
  collectSurveyData(); // Recopila los datos más recientes
  const selectedTypification = localStorage.getItem("selectedTypification");

  // Eliminar partes no deseadas de la observación para el sondeo
  let observacion =
    formDataForSurvey[
    "OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO"
    ];
  const perdidaMonitoreo = formDataForSurvey["PERDIDA DE MONITOREO"];
  const contrato = formDataForSurvey["CONTRATO"];
  const tiempoFalla = formDataForSurvey["Desde Cuando Presenta la Falla"];
  const correo = formDataForSurvey["CORREO"]; // Get the email
  const clienteID = formDataForSurvey["ID_CLIENTE"]; // Get the client ID

  const nombre = formDataForSurvey["NOMBRE"];
  const tarjeta = formDataForSurvey["TARJETA"];
  const puerto = formDataForSurvey["PUERTO"];
  const direccion = formDataForSurvey["DIRECCIÓN CLIENTE"];
  const telefono = formDataForSurvey["TELÉFONO"];

  let prefixParts = [];

  if (nombre) prefixParts.push(`NOMBRE: ${nombre}`);
  if (tarjeta) prefixParts.push(`TARJETA: ${tarjeta}`);
  if (puerto) prefixParts.push(`PUERTO: ${puerto}`);

  // SOP Line
  const today = new Date();
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  let sopPrefix = "SOP";
  if (selectedTypification === "Movil") {
    sopPrefix = "MOVIL";
  } else if (selectedTypification === "SAC") {
    sopPrefix = "SAC";
  }

  let sopLine = `${sopPrefix} ${formattedDate}`;
  if (clienteID) sopLine += ` ID de Llamada: ${clienteID}`;
  if (telefono) sopLine += ` TEL: ${telefono}`;
  prefixParts.push(sopLine);

  if (correo) prefixParts.push(`Correo: ${correo}`);
  if (direccion) prefixParts.push(`DIRECCION: ${direccion}`);

  // Add other conditional fields if needed, or keep them separate?
  // User request was specific about the top block.
  // Let's keep the other fields (Contrato, Perdida Monitoreo) if they were important, 
  // but the user's request seems to define the *header*.
  // The previous code added Contrato, ID, Perdida Monitoreo, Correo.
  // The new request covers ID, Correo. 
  // It doesn't explicitly mention Contrato or Perdida Monitoreo in the *new* header list, 
  // but usually these are important. 
  // However, strict adherence to "esto tambien dbe eestar en la observaicond e sondeo" 
  // followed by the list implies this is the desired header.
  // I will append the others *after* this block if they exist and aren't duplicates, 
  // or just stick to this list for the prefix.
  // Let's add Perdida Monitoreo back if it exists, as it's a specific question.

  if (perdidaMonitoreo) {
    prefixParts.push(`¿Tiene perdida de monitoreo?:${perdidaMonitoreo}`);
  }
  // Contrato is usually key, but if user didn't ask for it in the header...
  // Wait, the user said "esto tambien dbe eestar" (this also must be there).
  // It might mean "add these", not "replace everything with these".
  // But the format looks like a standard header.
  // I'll add Contrato back if it's not in the list, just to be safe, or maybe at the end of the prefix.
  if (contrato) {
    prefixParts.push(`Contrato: ${contrato}`);
  }

  let prefix = prefixParts.join("\n");
  if (prefix) {
    prefix += "\n"; // Add an extra newline to separate from the main observation
  }

  // Prepend the prefix to the observation
  observacion = prefix + observacion;
  if (observacion) {
    // Removals
    observacion = observacion.replace("obs: ", "").replace("OBS:", "");
    observacion = observacion.replace(
      "Tiene Luces en que estado ?: Luces Verdes (sin intermitencia)",
      ""
    );
    observacion = observacion.replace("Estado ONT: Conectado", "");

    // Replacements
    observacion = observacion.replace(
      "Cliente Masiva:",
      "Cliente dentro de una masiva"
    );
    observacion = observacion.replace("Falla Masiva", "Posible falla masiva:");
    observacion = observacion.replace(
      "Visita Técnica:",
      "¿Corresponde visita técnica?:"
    );

    // Clean up spaces and commas, and add newlines between questions
    observacion = observacion.replace(/, ,/g, ",").replace(/  +/g, " ").trim();
    // Add a newline after a response (like SI/No) followed by a new question (starting with a capital letter)
    observacion = observacion.replace(
      /(SI|NO|Si|No|si|no)\s*([A-Z¿])/g,
      "$1\n$2"
    );

    formDataForSurvey[
      "OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO"
    ] = observacion;
  }



  let requiredFields = [];

  if (
    selectedTypification === "Transferencia (Soporte)" ||
    selectedTypification === "SAC" ||
    selectedTypification === "Movil"
  ) {
    requiredFields = ["RUT", "TELÉFONO", "CONTRATO"];
  } else {
    requiredFields = [
      "RUT",
      "SERVICIO CON LA FALLA",
      "TELÉFONO",
      "DIRECCIÓN CLIENTE",
      "ONT",
      "OLT",
      "TARJETA",
      "PUERTO",
      "NODO",
      "CONTRATO",
    ];
  }

  const missingFields = requiredFields.filter(
    (field) => !formDataForSurvey[field]
  );

  if (missingFields.length > 0) {
    const message = `Por favor, complete los siguientes campos antes de enviar el sondeo: ${missingFields.join(
      ", "
    )}`;
    console.warn("Missing survey fields:", message);
    window.showNotification(message, "error");
    return null; // Return null if required fields are missing
  }

  if (Object.keys(formDataForSurvey).length === 0) {
    const message =
      "No hay datos de formulario para enviar el sondeo. Por favor, genere la observación primero.";
    console.warn("No form data for survey:", message);
    window.showNotification(message, "error");
    return null; // Return null if no form data
  }

  // Define la URL base para el formulario de sondeo.
  const baseUrl = window.SURVEY_BASE_URL;

  const urlParams = new URLSearchParams();

  // 1. Se mapean los datos recopilados (formDataForSurvey) a los parámetros de entrada ('entry')
  //    esperados por el formulario de Google. Cada 'entry.XXXXXXX' corresponde a un campo específico en el formulario.
  // Define un mapeo de los campos del formulario a los IDs de entrada de Google Forms.
  // Cada objeto contiene el 'entryId' de Google Forms y la clave correspondiente en 'formDataForSurvey'.
  const surveyFieldMappings = [
    { entryId: "entry.423430974", formDataKey: "CEDULA_EJECUTIVO" }, // Agent's CEDULA
    { entryId: "entry.1234567890", formDataKey: "CONTRATO" }, // CONTRATO
    { entryId: "entry.189057090", formDataKey: "RUT" }, // RUT DEL CLIENTE
    { entryId: "entry.189057090", formDataKey: "RUT" }, // RUT DEL CLIENTE
    { entryId: "entry.399236047", formDataKey: "SERVICIO CON LA FALLA" }, // Este campo ahora toma su valor de 'tipoServicio'
    { entryId: "entry.302927497", formDataKey: "TELÉFONO" }, // TELEFONO
    { entryId: "entry.1510722740", formDataKey: "DIRECCIÓN CLIENTE" }, // DIRECCION
    { entryId: "entry.825850316", formDataKey: "ONT" }, // ONT
    { entryId: "entry.163062648", formDataKey: "OLT" }, // OLT
    { entryId: "entry.1433390129", formDataKey: "TARJETA" }, // TARJETA
    { entryId: "entry.825069013", formDataKey: "PUERTO" }, // PUERTO
    { entryId: "entry.1038443960", formDataKey: "NODO" }, // NODO
    {
      entryId: "entry.1833454695",
      formDataKey: "Inconvenientes Instalación/Reparación",
    },
    { entryId: "entry.542616353", formDataKey: "El cliente es reincidente" },
    { entryId: "entry.1760026309", formDataKey: "Suministro Eléctrico" },
    { entryId: "entry.1092691919", formDataKey: "Generador Eléctrico" },
    { entryId: "entry.64765887", formDataKey: "Estado Luces" },
    {
      entryId: "entry.505366834",
      formDataKey: "OBSERVACIÓN CON INFORMACIÓN COMPLETA EN LA VARIBALE SONDEO",
    },
    { entryId: "entry.1944826262", formDataKey: "Falla Respuesta Genobs" },
    { entryId: "entry.1322891023", formDataKey: "Control Remoto" },
    { entryId: "entry.1944826262", formDataKey: "Cambio Pilas" },
    { entryId: "entry.1322891023", formDataKey: "Prueba Cruzada" },
    { entryId: "entry.1944826262", formDataKey: "Decodificador" },
    { entryId: "entry.1322891023", formDataKey: "Reinicio Eléctrico" },
    { entryId: "entry.1944826262", formDataKey: "Cable HDMI/AV" },
    { entryId: "entry.1322891023", formDataKey: "Observacion TV" },
    { entryId: "entry.EMAIL_ENTRY_ID", formDataKey: "CORREO" }, // Placeholder for email entry ID
  ];

  // Itera sobre el mapeo y añade los parámetros a la URL.
  surveyFieldMappings.forEach((mapping) => {
    let value = formDataForSurvey[mapping.formDataKey] || "";
    // Special handling for CEDULA_EJECUTIVO to ensure it's always taken from localStorage
    if (mapping.formDataKey === "CEDULA_EJECUTIVO") {
      value = localStorage.getItem("documentNumber") || "";
    }
    urlParams.append(mapping.entryId, value);
  });

  // Manejo especial para el campo de fecha y hora 'Desde Cuando Presenta la Falla'.
  // This declaration is now at the top of the function.
  if (tiempoFalla) {
    const date = new Date(tiempoFalla);
    urlParams.append("entry.978502501_year", date.getFullYear());
    urlParams.append("entry.978502501_month", date.getMonth() + 1);
    urlParams.append("entry.978502501_day", date.getDate());
    urlParams.append("entry.978502501_hour", date.getHours());
    urlParams.append("entry.978502501_minute", date.getMinutes());
  }

  // 2. Se construye la URL final COMPLETA concatenando la URL base con los parámetros de sondeo.
  const finalUrl = `${baseUrl}&${urlParams.toString()}`;
  console.log("Generated Survey URL:", finalUrl);
  return finalUrl;
}

/**
 * Guarda la URL del sondeo en el historial de localStorage.
 * @param {string} url La URL del sondeo a guardar.
 */
export function saveSurveyUrlToHistory(url) {
  let history = JSON.parse(localStorage.getItem("surveyHistory")) || [];
  const timestamp = new Date().toLocaleString();
  history.unshift({ url: url, timestamp: timestamp }); // Add to the beginning
  // Keep only the last 10 entries to prevent excessive storage
  history = history.slice(0, 10);
  localStorage.setItem("surveyHistory", JSON.stringify(history));
}

/**
 * Configura los botones de la modal de sondeo con la URL generada.
 * @param {string} urlToDisplay La URL del sondeo a utilizar.
 */
export function construirYEnviarSondeo(urlToDisplay = null) {
  if (!urlToDisplay) {
    window.showNotification(
      "No se proporcionó una URL para el sondeo.",
      "error"
    );
    return;
  }

  console.log("Configuring survey modal with URL:", urlToDisplay);
  saveSurveyUrlToHistory(urlToDisplay); // Save the URL to history

  // Wait a bit for the modal to be in the DOM if it was just created
  setTimeout(() => {
    const copySurveyLinkBtn = document.getElementById("copySurveyLinkBtn");
    const openSurveyLinkBtn = document.getElementById("openSurveyLinkBtn");
    const copyAutoSendSurveyLinkBtn = document.getElementById(
      "copyAutoSendSurveyLinkBtn"
    );
    const openAutoSendSurveyLinkBtn = document.getElementById(
      "openAutoSendSurveyLinkBtn"
    );

    console.log("Configuring modal elements:", {
      copySurveyLinkBtn,
      openSurveyLinkBtn,
      copyAutoSendSurveyLinkBtn,
      openAutoSendSurveyLinkBtn,
    });

    if (copySurveyLinkBtn) {
      copySurveyLinkBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(urlToDisplay);
          window.showNotification("¡Enlace de sondeo copiado!", "success");
          console.log("Survey link copied:", urlToDisplay);
        } catch (err) {
          console.error("Error al copiar el enlace de sondeo: ", err);
          window.showNotification(
            "Error al copiar el enlace de sondeo.",
            "error"
          );
        }
      };
    } else {
      console.error(
        "Error: copySurveyLinkBtn not found in DOM when trying to attach event listener."
      );
    }

    if (openSurveyLinkBtn) {
      openSurveyLinkBtn.onclick = () => {
        window.open(urlToDisplay, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
        console.log("Survey link opened:", urlToDisplay);
      };
    } else {
      console.error(
        "Error: openSurveyLinkBtn not found in DOM when trying to attach event listener."
      );
    }

    if (copyAutoSendSurveyLinkBtn) {
      copyAutoSendSurveyLinkBtn.onclick = async () => {
        const autoSendUrl = urlToDisplay.replace(
          "/viewform?usp=pp_url",
          "/formResponse?usp=pp_url"
        );
        try {
          await navigator.clipboard.writeText(autoSendUrl);
          window.showNotification(
            "¡Enlace de envío automático copiado!",
            "success"
          );
          console.log("Auto-send survey link copied:", autoSendUrl);
        } catch (err) {
          console.error("Error al copiar el enlace de envío automático: ", err);
          window.showNotification(
            "Error al copiar el enlace de envío automático.",
            "error"
          );
        }
      };
    } else {
      console.error(
        "Error: copyAutoSendSurveyLinkBtn not found in DOM when trying to attach event listener."
      );
    }

    if (openAutoSendSurveyLinkBtn) {
      openAutoSendSurveyLinkBtn.onclick = () => {
        const autoSendUrl = urlToDisplay.replace(
          "/viewform?usp=pp_url",
          "/formResponse?usp=pp_url"
        );
        window.open(autoSendUrl, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
        console.log("Auto-send survey link opened:", autoSendUrl);
      };
    } else {
      console.error(
        "Error: openAutoSendSurveyLinkBtn not found in DOM when trying to attach event listener."
      );
    }
  }, 100); // Wait 100ms for the modal to be ready
}