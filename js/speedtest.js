import { abrirModal } from "./main.js";

export function initializeSpeedtest() {
  const showNotification = window.showNotification; // Access globally exposed function
  const openModalBtn = document.getElementById("openSpeedTestModalBtn");
  const generateBtn = document.getElementById("generateBtn");
  const testIdInput = document.getElementById("testIdInput");
  const resultContainer = document.getElementById("speedTestResult");
  const urlContainer = document.getElementById("generatedUrl");
  const urlLink = urlContainer.querySelector("a");
  const copyBtn = document.getElementById("copySpeedTestBtn");
  const openBtn = document.getElementById("openSpeedTestLinkBtn");
  const errorContainer = document.getElementById("speedTestError");
  const clearAllBtn = document.getElementById("clearSpeedTestBtn");

  openModalBtn.onclick = () => {
    abrirModal("speedTestModal");
    // Reset modal state when opening
    testIdInput.value = "";
    resultContainer.style.display = "none";
    errorContainer.style.display = "none";
    errorContainer.textContent = "";
  };

  generateBtn.onclick = () => {
    const testId = testIdInput.value.trim();
    errorContainer.style.display = "none";
    errorContainer.textContent = "";

    if (testId && /^\d+$/.test(testId)) {
      const url = `https://www.speedtest.net/result/${testId}+`;
      urlLink.href = url;
      urlLink.textContent = url;
      resultContainer.style.display = "block";
      urlContainer.style.display = "block"; // Ensure the URL container is visible

      // Store the URL in a data attribute for easy access
      resultContainer.dataset.url = url;
    } else {
      resultContainer.style.display = "none";
      errorContainer.textContent =
        "Por favor, ingrese un ID de test válido (solo números).";
      errorContainer.style.display = "block";
    }
  };

  copyBtn.onclick = () => {
    const url = resultContainer.dataset.url;
    if (url) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // Optional: Show a notification that text was copied
          showNotification("URL copiada al portapapeles");
        })
        .catch((err) => {
          console.error("Error al copiar la URL: ", err);
          showNotification("Error al copiar la URL", "error");
        });
    }
  };

  openBtn.onclick = () => {
    const url = resultContainer.dataset.url;
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Clear all functionality
  if (clearAllBtn) {
    clearAllBtn.onclick = () => {
      testIdInput.value = "";
      resultContainer.style.display = "none";
      urlContainer.style.display = "none";
      errorContainer.style.display = "none";
      errorContainer.textContent = "";
      resultContainer.dataset.url = "";
      showNotification("Datos de SpeedTest limpiados", "success");
    };
  }
}
