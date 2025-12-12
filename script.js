import {
  formDataForSurvey,
  mostrarFechaHora,
  abrirModal,
  cerrarModal,
  abrirModalObservacion,
  cerrarModalObservacion,
  abrirModalTipificacion,
  guardarTipificacion,
  cargarTipificacion,
  cargarFormulario,
  generarObservacionPrincipal,
  generarObservacionFinal,
  limpiarFormulario,
  copyToClipboard,
} from "./js/main.js";

import { actualizarPreguntas } from "./js/genobs.js";

import {
  timers,
  activeTimerId,
  timerToDeleteId,
  alarmingTimerId,
  audioContext,
  alarmInterval,
  pipWindow,
  initializeAudio,
  playSound,
  playTickSound,
  startAlarm,
  stopAlarm,
  updateTimer,
  toggleTimer,
  resetTimer,
  deleteTimer,
  setActiveTimer,
  renderPiP,
  renderPiPMainView,
  renderPiPManageView,
  saveTimers,
  loadTimers,
  openCronometroPiP,
} from "./js/timer.js";

import {
  loadTmoData,
  addRowToTable,
  deleteRow,
  updateAverage,
} from "./js/tmo.js";

import {
  exportarHistorial,
  importarHistorial,
  limpiarHistorial,
  guardarEnHistorial,
  enviarSondeo,
  construirYEnviarSondeo,
  parseObservation,
  mostrarHistorial,
} from "./js/history.js";

import {
  generateBtn,
  testIdInput,
  generatedUrlContainer,
} from "./js/speedtest.js";

// --- LÓGICA "ACERCA DE" ---
const openAboutBtn = document.getElementById("openAboutBtn");
openAboutBtn.onclick = () => abrirModal("aboutModal");
