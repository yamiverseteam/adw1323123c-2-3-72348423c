let callData = [];
let dataTableBody;
let avgTimeDisplay;

export function initializeTmo() {
  const openTmoBtn = document.getElementById("openTmoBtn");
  const dataFormTMO = document.getElementById("dataFormTMO");
  dataTableBody = document
    .getElementById("dataTable")
    .getElementsByTagName("tbody")[0];
  avgTimeDisplay = document.getElementById("avgTime");
  const clearAllBtn = document.getElementById("clearAllBtn");

  openTmoBtn.onclick = () => abrirModal("tmoModal");
  dataFormTMO.onsubmit = function (event) {
    event.preventDefault();
    const callTime = parseInt(document.getElementById("callTime").value);
    const failureType = document.getElementById("failureType").value;
    if (isNaN(callTime) || failureType.trim() === "") return;
    const callEntry = { callTime, failureType, id: Date.now() };
    callData.push(callEntry);
    addRowToTable(callEntry);
    updateAverage();
    localStorage.setItem("callData", JSON.stringify(callData));
    dataFormTMO.reset();
  };

  clearAllBtn.onclick = function () {
    // Show confirmation modal before clearing all data
    const modal = document.getElementById("tmoConfirmationModal");
    const messageElement = document.getElementById("tmoConfirmationMessage");
    const confirmBtn = document.getElementById("tmoConfirmDeleteBtn");

    messageElement.textContent = "¿Está seguro de que desea eliminar todos los registros?";
    modal.style.display = "flex";

    const confirmHandler = () => {
      localStorage.removeItem("callData");
      dataTableBody.innerHTML = "";
      callData = [];
      updateAverage();
      closeModal();
    };

    const closeModal = () => {
      modal.style.display = "none";
      confirmBtn.removeEventListener("click", confirmHandler);
    };

    confirmBtn.addEventListener("click", confirmHandler);
  };

  loadTmoData();
}

export function loadTmoData() {
  const savedData = localStorage.getItem("callData");
  if (savedData) {
    callData = JSON.parse(savedData);
    dataTableBody.innerHTML = "";
    callData.forEach((entry) => addRowToTable(entry));
    updateAverage();
  }
}

export function addRowToTable(callEntry) {
  let row = dataTableBody.insertRow();
  row.insertCell(0).textContent = callEntry.callTime;
  row.insertCell(1).textContent = callEntry.failureType;
  let actionsCell = row.insertCell(2);
  let deleteBtn = document.createElement("button");
  deleteBtn.innerHTML =
    '<i class="material-icons" style="font-size:16px;">delete</i>';
  deleteBtn.onclick = () => deleteRow(callEntry.id, row);
  actionsCell.appendChild(deleteBtn);
}

export function deleteRow(id, row) {
  // Show confirmation modal before deleting
  const modal = document.getElementById("tmoConfirmationModal");
  const messageElement = document.getElementById("tmoConfirmationMessage");
  const confirmBtn = document.getElementById("tmoConfirmDeleteBtn");

  messageElement.textContent = "¿Está seguro de que desea eliminar este registro?";
  modal.style.display = "flex";

  const confirmHandler = () => {
    callData = callData.filter((item) => item.id !== id);
    localStorage.setItem("callData", JSON.stringify(callData));
    row.remove();
    updateAverage();
    closeModal();
  };

  const closeModal = () => {
    modal.style.display = "none";
    confirmBtn.removeEventListener("click", confirmHandler);
  };

  confirmBtn.addEventListener("click", confirmHandler);
}

export function updateAverage() {
  const failureCounts = document.getElementById("failureCounts");
  if (callData.length === 0) {
    avgTimeDisplay.textContent = "0";
    failureCounts.innerHTML = "";
    return;
  }
  const sum = callData.reduce((acc, curr) => acc + curr.callTime, 0);
  const average = sum / callData.length;
  avgTimeDisplay.textContent = average.toFixed(2);

  const counts = callData.reduce((acc, curr) => {
    acc[curr.failureType] = (acc[curr.failureType] || 0) + 1;
    return acc;
  }, {});

  const totalCalls = callData.length; // Calculate total calls

  let countsHtml = Object.entries(counts)
    .map(([type, count]) => `<span>${type}: ${count}</span>`)
    .join("");

  failureCounts.innerHTML = `${countsHtml}<span>Total: ${totalCalls}</span>`; // Include total calls
}