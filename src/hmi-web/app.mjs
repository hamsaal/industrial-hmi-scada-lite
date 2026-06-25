import { buildAlarms, classifyReading, summarizePlant } from "./domain.mjs";
import { nextTelemetryFrame } from "./mockTelemetry.mjs";

const dom = {
  onlineCount: document.querySelector("#onlineCount"),
  alarmCount: document.querySelector("#alarmCount"),
  utilizationAvg: document.querySelector("#utilizationAvg"),
  throughputTotal: document.querySelector("#throughputTotal"),
  lastUpdate: document.querySelector("#lastUpdate"),
  equipmentRows: document.querySelector("#equipmentRows"),
  alarmList: document.querySelector("#alarmList"),
  ackAllButton: document.querySelector("#ackAllButton")
};

const acknowledgedAlarmIds = new Set();
let currentFrame = nextTelemetryFrame();

dom.ackAllButton.addEventListener("click", () => {
  buildAlarms(currentFrame).forEach((alarm) => acknowledgedAlarmIds.add(alarm.id));
  render(currentFrame);
});

render(currentFrame);
window.setInterval(updateFrame, 2000);

function updateFrame() {
  currentFrame = nextTelemetryFrame();
  render(currentFrame);
}

function render(readings) {
  const summary = summarizePlant(readings);
  const activeAlarms = buildAlarms(readings).filter((alarm) => !acknowledgedAlarmIds.has(alarm.id));

  dom.onlineCount.textContent = `${summary.online}/${summary.total}`;
  dom.alarmCount.textContent = String(activeAlarms.length);
  dom.utilizationAvg.textContent = `${Math.round(summary.utilizationAvg)}%`;
  dom.throughputTotal.textContent = `${Math.round(summary.throughputTotal)}/h`;
  dom.lastUpdate.textContent = new Date(readings[0].updatedAt).toLocaleTimeString();

  renderEquipmentRows(readings);
  renderAlarms(activeAlarms);
}

function renderEquipmentRows(readings) {
  dom.equipmentRows.innerHTML = readings.map((reading) => {
    const state = classifyReading(reading);

    return `
      <tr>
        <td>${reading.tag}</td>
        <td>${reading.name}</td>
        <td><span class="state ${state}">${state}</span></td>
        <td>${reading.temperatureC.toFixed(1)} C</td>
        <td>${reading.pressureBar.toFixed(1)} bar</td>
        <td>${reading.vibrationMmS.toFixed(1)} mm/s</td>
        <td>${reading.throughputPerHour}/h</td>
      </tr>
    `;
  }).join("");
}

function renderAlarms(alarms) {
  if (alarms.length === 0) {
    dom.alarmList.innerHTML = `<p class="empty">No active alarms.</p>`;
    return;
  }

  dom.alarmList.innerHTML = alarms.map((alarm) => `
    <article class="alarm ${alarm.severity}">
      <strong>${alarm.title}</strong>
      <p>${alarm.description}</p>
      <small>${alarm.equipmentTag} ${alarm.equipmentName} / ${alarm.severity.toUpperCase()}</small>
    </article>
  `).join("");
}
