export function createSurveyPersisteModal() {
  // Check if modal already exists to avoid duplicates
  const existingModal = document.getElementById("surveyPersisteModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
    <div id="surveyPersisteModal" class="modal">
      <div class="modal-content survey-modal-content">
        <span class="close-button close-button-top-right" onclick="cerrarModal('surveyPersisteModal')" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: var(--text-primary);">
          <i class="material-icons">close</i>
        </span>
        <h2 class="modal-title">Confirmación de Cliente Persiste</h2>
        <p class="modal-description">Se ha generado un enlace para el sondeo. Si estás en Firefox, pulsa en "Abrir" para abrir el sondeo directamente, o si deseas validar antes, copia el enlace.</p>

        

        <div class="modal-actions" style="display: flex; flex-direction: column; gap: 15px;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="font-weight: 600; color: var(--text-primary); font-size: 14px;">Enlace Pre-rellenado:</label>
            <div style="display: flex; gap: 10px;">
              <button id="openSurveyPersisteLinkBtn" class="button-secondary" style="flex: 1;">
                <i class="material-icons">open_in_new</i> Abrir
              </button>
              <button id="copySurveyPersisteLinkBtn" class="button-secondary" style="flex: 1;">
                <i class="material-icons">content_copy</i> Copiar
              </button>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="font-weight: 600; color: var(--text-primary); font-size: 14px;">Enlace de Envío Automático:</label>
            <div style="display: flex; gap: 10px;">
              <button id="openAutoSendSurveyPersisteLinkBtn" class="button-secondary" style="flex: 1;">
                <i class="material-icons">open_in_new</i> Abrir
              </button>
              <button id="copyAutoSendSurveyPersisteLinkBtn" class="button-secondary" style="flex: 1;">
                <i class="material-icons">content_copy</i> Copiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  console.log("Survey persiste modal created and added to DOM");
}
