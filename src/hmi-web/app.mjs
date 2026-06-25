import { buildAlarms, classifyReading, summarizePlant } from "./domain.mjs";
import { nextTelemetryFrame } from "./mockTelemetry.mjs";

const dom = {
  onlineCount: document.querySelector("#onlineCount"),
  alarmCount: document.querySelector("#alarmCount"),
  utilizationAvg: document.querySelector("#utilizationAvg"),
  throughputTotal: document.querySelector("#throughputTotal"),
  lastUpdate: document.querySelector("#lastUpdate"),
  equipmentGrid: document.querySelector("#equipmentGrid"),
  alarmList: document.querySelector("#alarmList"),
  ackAllButton: document.querySelector("#ackAllButton"),
  trendCanvas: document.querySelector("#trendCanvas")
};

const trendHistory = [];
const acknowledgedAlarmIds = new Set();

dom.ackAllButton.addEventListener("click", () => {
  buildAlarms(currentFrame).forEach((alarm) => acknowledgedAlarmIds.add(alarm.id));
  render(currentFrame);
});

let currentFrame = nextTelemetryFrame();
render(currentFrame);

window.setInterval(() => {
  currentFrame = nextTelemetryFrame();
  render(currentFrame);
}, 1800);

function render(readings) {
  const summary = summarizePlant(readings);
  const alarms = buildAlarms(readings).filter((alarm) => !acknowledgedAlarmIds.has(alarm.id));

  dom.onlineCount.textContent = `${summary.online}/${summary.total}`;
  dom.alarmCount.textContent = String(alarms.length);
  dom.utilizationAvg.textContent = `${Math.round(summary.utilizationAvg)}%`;
  dom.throughputTotal.textContent = `${Math.round(summary.throughputTotal)}/h`;
  dom.lastUpdate.textContent = `Updated ${new Date(readings[0].updatedAt).toLocaleTimeString()}`;

  renderEquipment(readings);
  renderAlarms(alarms);
  renderTrend(readings);
}

function renderEquipment(readings) {
  dom.equipmentGrid.innerHTML = readings.map((reading) => {
    const state = classifyReading(reading);

    return `
      <article class="equipment-card" data-state="${state}">
        <div class="equipment-card__top">
          <div>
            <h3>${reading.tag} ${reading.name}</h3>
            <p>${reading.area}</p>
          </div>
          <span class="state-pill">${state}</span>
        </div>
        <div class="equipment-card__values">
          ${readingCell("Temp", `${reading.temperatureC.toFixed(1)} C`)}
          ${readingCell("Pressure", `${reading.pressureBar.toFixed(1)} bar`)}
          ${readingCell("Vibration", `${reading.vibrationMmS.toFixed(1)} mm/s`)}
        </div>
        <div class="bar" aria-label="Utilization ${Math.round(reading.utilizationPct)} percent">
          <span style="width: ${reading.utilizationPct}%"></span>
        </div>
      </article>
    `;
  }).join("");
}

function readingCell(label, value) {
  return `
    <div class="reading">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderAlarms(alarms) {
  if (alarms.length === 0) {
    dom.alarmList.innerHTML = `<div class="empty-state">No unacknowledged alarms</div>`;
    return;
  }

  dom.alarmList.innerHTML = alarms.map((alarm) => `
    <article class="alarm-item" data-severity="${alarm.severity}">
      <strong>${alarm.title}</strong>
      <p>${alarm.description}</p>
      <div class="alarm-meta">
        <span>${alarm.equipmentTag} ${alarm.equipmentName}</span>
        <span>${alarm.severity.toUpperCase()}</span>
      </div>
    </article>
  `).join("");
}

function renderTrend(readings) {
  const avgTemperature = readings.reduce((sum, reading) => sum + reading.temperatureC, 0) / readings.length;
  const avgVibration = readings.reduce((sum, reading) => sum + reading.vibrationMmS, 0) / readings.length;

  trendHistory.push({ avgTemperature, avgVibration });

  if (trendHistory.length > 42) {
    trendHistory.shift();
  }

  const canvas = dom.trendCanvas;
  const context = canvas.getContext("2d");
  const { width, height } = canvas;

  context.clearRect(0, 0, width, height);
  drawGrid(context, width, height);
  drawSeries(context, trendHistory.map((point) => point.avgTemperature), 30, 95, "#c24132", width, height);
  drawSeries(context, trendHistory.map((point) => point.avgVibration), 0, 8, "#6c4fb5", width, height);
}

function drawGrid(context, width, height) {
  context.strokeStyle = "#d9e1e5";
  context.lineWidth = 1;
  context.font = "700 24px Segoe UI";
  context.fillStyle = "#637178";

  for (let index = 0; index <= 4; index += 1) {
    const y = 22 + index * ((height - 44) / 4);
    context.beginPath();
    context.moveTo(36, y);
    context.lineTo(width - 20, y);
    context.stroke();
  }
}

function drawSeries(context, values, min, max, color, width, height) {
  if (values.length < 2) {
    return;
  }

  const left = 36;
  const right = width - 20;
  const top = 20;
  const bottom = height - 24;
  const xStep = (right - left) / Math.max(values.length - 1, 1);

  context.strokeStyle = color;
  context.lineWidth = 5;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.beginPath();

  values.forEach((value, index) => {
    const x = left + index * xStep;
    const normalized = (value - min) / (max - min);
    const y = bottom - Math.max(0, Math.min(1, normalized)) * (bottom - top);

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.stroke();
}
