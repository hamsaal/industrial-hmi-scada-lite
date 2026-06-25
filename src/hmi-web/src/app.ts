import { Alarm, EquipmentReading, buildAlarms, classifyReading, summarizePlant } from "./domain";
import { nextTelemetryFrame } from "./mockTelemetry";

const dom = {
  onlineCount: document.querySelector("#onlineCount") as HTMLElement,
  alarmCount: document.querySelector("#alarmCount") as HTMLElement,
  utilizationAvg: document.querySelector("#utilizationAvg") as HTMLElement,
  throughputTotal: document.querySelector("#throughputTotal") as HTMLElement,
  lastUpdate: document.querySelector("#lastUpdate") as HTMLElement,
  equipmentRows: document.querySelector("#equipmentRows") as HTMLElement,
  alarmList: document.querySelector("#alarmList") as HTMLElement,
  ackAllButton: document.querySelector("#ackAllButton") as HTMLButtonElement
};

const acknowledgedAlarmIds = new Set<string>();
let currentFrame = nextTelemetryFrame();

dom.ackAllButton.addEventListener("click", () => {
  buildAlarms(currentFrame).forEach((alarm) => acknowledgedAlarmIds.add(alarm.id));
  render(currentFrame);
});

render(currentFrame);
window.setInterval(updateFrame, 2000);

function updateFrame(): void {
  currentFrame = nextTelemetryFrame();
  render(currentFrame);
}

function render(readings: EquipmentReading[]): void {
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

function renderEquipmentRows(readings: EquipmentReading[]): void {
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

function renderAlarms(alarms: Alarm[]): void {
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
