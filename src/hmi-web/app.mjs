import { loadDashboardSnapshot } from "./apiClient.mjs";
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
  ackAllButton: document.querySelector("#ackAllButton"),
  connectionState: document.querySelector("#connectionState")
};

const acknowledgedAlarmIds = new Set();
let currentSnapshot = buildFallbackSnapshot();

dom.ackAllButton.addEventListener("click", () => {
  currentSnapshot.alarms.forEach((alarm) => acknowledgedAlarmIds.add(alarm.id));
  render(currentSnapshot);
});

render(currentSnapshot);
updateSnapshot();
window.setInterval(updateSnapshot, 2000);

async function updateSnapshot() {
  try {
    currentSnapshot = normalizeApiSnapshot(await loadDashboardSnapshot());
  } catch (error) {
    currentSnapshot = buildFallbackSnapshot(error);
  }

  render(currentSnapshot);
}

function render(snapshot) {
  const { readings, summary, alarms, source } = snapshot;
  const activeAlarms = alarms.filter((alarm) => !acknowledgedAlarmIds.has(alarm.id));

  dom.onlineCount.textContent = `${summary.online}/${summary.total}`;
  dom.alarmCount.textContent = String(activeAlarms.length);
  dom.utilizationAvg.textContent = `${Math.round(summary.utilizationAvg)}%`;
  dom.throughputTotal.textContent = `${Math.round(summary.throughputTotal)}/h`;
  dom.lastUpdate.textContent = readings.length > 0
    ? new Date(readings[0].updatedAt).toLocaleTimeString()
    : "No readings";
  dom.connectionState.textContent = source === "api" ? "API live" : "Simulator";
  dom.connectionState.classList.toggle("offline", source !== "api");

  renderEquipmentRows(readings);
  renderAlarms(activeAlarms);
}

function normalizeApiSnapshot(snapshot) {
  return {
    source: snapshot.source,
    readings: snapshot.readings,
    alarms: snapshot.alarms.map((alarm) => ({
      ...alarm,
      severity: String(alarm.severity).toLowerCase()
    })),
    summary: {
      online: snapshot.summary.online,
      total: snapshot.summary.total,
      activeAlarms: snapshot.summary.activeAlarms,
      utilizationAvg: snapshot.summary.utilizationAverage,
      throughputTotal: snapshot.summary.throughputTotal
    }
  };
}

function buildFallbackSnapshot(error) {
  const readings = nextTelemetryFrame();

  // The frontend simulator is intentionally a resilience/demo fallback. The
  // backend owns the production telemetry contract once the API is available.
  return {
    source: "simulator",
    error,
    readings,
    summary: summarizePlant(readings),
    alarms: buildAlarms(readings)
  };
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
