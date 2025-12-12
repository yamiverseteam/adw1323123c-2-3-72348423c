import { abrirModal, cerrarModal } from "./main.js";
import { loginModalContent } from "./loginModalContent.js";

export function initializeLogin() {
  console.log("initializeLogin called");
  const loginModalContainer = document.getElementById("loginModalContainer");

  if (!loginModalContainer) {
    console.error("Login modal container element not found!");
    return;
  }

  // Render the login modal content
  loginModalContainer.innerHTML = loginModalContent;

  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    console.error("Login form element not found after rendering!");
    return;
  }

  // Initially hide all main content until login
  const mainContent = document.getElementById("mainContent");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const mainLogoContainer = document.getElementById("mainLogoContainer");

  if (mainContent) mainContent.style.display = "none";
  if (welcomeMessage) welcomeMessage.style.display = "none";
  if (mainLogoContainer) mainLogoContainer.style.display = "block"; // Ensure main logo container is always visible

  const showLoginModal = () => {
    console.log("Showing login modal.");
    const loginModal = loginModalContainer.querySelector(".login-modal");
    const mainContent = document.getElementById("mainContent");
    const welcomeMessage = document.getElementById("welcomeMessage");

    if (loginModal) {
      loginModal.style.display = "flex";
    }
    if (mainContent) {
      mainContent.style.display = "none";
    }
    if (welcomeMessage) {
      welcomeMessage.style.display = "none";
    }
  };

  const hideLoginModal = () => {
    console.log("Hiding login modal.");
    const loginModal = loginModalContainer.querySelector(".login-modal");
    const mainContent = document.getElementById("mainContent");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const userHeader = document.getElementById("userHeader");

    if (loginModal) {
      loginModal.style.display = "none";
    }
    if (userHeader) {
      userHeader.style.display = "flex";
    }

    // Update user info in header
    const docType = localStorage.getItem("userDocType");
    const documentNumber = localStorage.getItem("documentNumber");
    const userCedula = document.getElementById("user-cedula");
    if (userCedula && documentNumber) {
      userCedula.textContent = documentNumber;
    }

    // Check if there's a saved typification to decide what to show
    const savedTypification = localStorage.getItem("selectedTypification");
    if (savedTypification && savedTypification !== "No definida") {
      if (mainContent) mainContent.style.display = "block";
      if (welcomeMessage) welcomeMessage.style.display = "none";
    } else {
      if (mainContent) mainContent.style.display = "none";
      if (welcomeMessage) welcomeMessage.style.display = "block";
    }
  };

  const logout = () => {
    localStorage.removeItem("userDocType");
    localStorage.removeItem("documentNumber");
    const userCedula = document.getElementById("user-cedula");
    if (userCedula) {
      userCedula.textContent = "";
    }
    window.location.reload();
  };

  const checkLogin = () => {
    const docType = localStorage.getItem("userDocType");
    const documentNumber = localStorage.getItem("documentNumber");
    console.log(
      "Checking login status. DocType:",
      docType,
      "DocumentNumber:",
      documentNumber
    );

    if (docType && documentNumber) {
      const userCedula = document.getElementById("user-cedula");
      if (userCedula) {
        userCedula.textContent = documentNumber;
      }
      hideLoginModal();
    } else {
      showLoginModal();
    }
  };

  // Function to toggle password visibility
  window.togglePasswordVisibility = () => {
    const passwordInput = document.getElementById("documentNumber");
    const toggleIcon = document.querySelector(".toggle-password");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.textContent = "visibility_off";
    } else {
      passwordInput.type = "password";
      toggleIcon.textContent = "visibility";
    }
  };

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const documentType = document.getElementById("documentType").value;
      const documentNumber = document
        .getElementById("documentNumber")
        .value.trim();
      const loginMessageDiv = document.getElementById("loginMessage");

      const showErrorMessage = (message) => {
        loginMessageDiv.textContent = message;
        loginMessageDiv.style.display = "flex";
      };

      const hideErrorMessage = () => {
        loginMessageDiv.textContent = "";
        loginMessageDiv.style.display = "none";
      };

      hideErrorMessage(); // Clear previous errors

      if (!documentType || !documentNumber) {
        showErrorMessage(
          "Por favor, seleccione el tipo de documento e ingrese su número."
        );
        return;
      }

      if (documentType === "Cédula") {
        if (!/^\d{10}$/.test(documentNumber)) {
          showErrorMessage(
            "La Cédula debe tener exactamente 10 dígitos numéricos."
          );
          return;
        }
      } else if (documentType === "Pasaporte") {
        if (!/^[a-zA-Z0-9]{6,20}$/.test(documentNumber)) {
          showErrorMessage(
            "El Pasaporte debe tener entre 6 y 20 caracteres alfanuméricos."
          );
          return;
        }
      }

      localStorage.setItem("userDocType", documentType);
      localStorage.setItem("documentNumber", documentNumber);
      hideLoginModal();
    });
  }

  checkLogin(); // Call checkLogin when the login system is initialized

  // Make body visible after login system is initialized
  document.body.classList.add("login-initialized");
}
