export type EquipmentState = "running" | "warning" | "critical" | "offline";
export type AlarmSeverity = "info" | "warning" | "critical";

export interface EquipmentDefinition {
  id: string;
  tag: string;
  name: string;
  area: string;
  nominalTemperatureC: number;
  nominalPressureBar: number;
  nominalVibrationMmS: number;
  nominalThroughputPerHour: number;
}

export interface EquipmentReading {
  id: string;
  tag: string;
  name: string;
  area: string;
  temperatureC: number;
  pressureBar: number;
  vibrationMmS: number;
  throughputPerHour: number;
  utilizationPct: number;
  isOffline: boolean;
  updatedAt: string;
}

export interface Alarm {
  id: string;
  equipmentId: string;
  equipmentTag: string;
  equipmentName: string;
  severity: AlarmSeverity;
  title: string;
  description: string;
  raisedAt: string;
}

export interface PlantSummary {
  online: number;
  total: number;
  activeAlarms: number;
  utilizationAvg: number;
  throughputTotal: number;
}

export const equipmentDefinitions: EquipmentDefinition[] = [
  {
    id: "mix-tank-01",
    tag: "TK-401",
    name: "Mix tank",
    area: "Preparation",
    nominalTemperatureC: 62,
    nominalPressureBar: 1.2,
    nominalVibrationMmS: 1.8,
    nominalThroughputPerHour: 220
  },
  {
    id: "feed-pump-01",
    tag: "P-410",
    name: "Feed pump",
    area: "Transfer",
    nominalTemperatureC: 48,
    nominalPressureBar: 3.8,
    nominalVibrationMmS: 3.1,
    nominalThroughputPerHour: 210
  },
  {
    id: "forming-press-01",
    tag: "PR-420",
    name: "Forming press",
    area: "Packaging",
    nominalTemperatureC: 74,
    nominalPressureBar: 5.4,
    nominalVibrationMmS: 4.2,
    nominalThroughputPerHour: 198
  },
  {
    id: "outfeed-conveyor-01",
    tag: "CV-430",
    name: "Outfeed conveyor",
    area: "Dispatch",
    nominalTemperatureC: 35,
    nominalPressureBar: 0.6,
    nominalVibrationMmS: 2.3,
    nominalThroughputPerHour: 205
  }
];

export function classifyReading(reading: EquipmentReading): EquipmentState {
  if (reading.isOffline) {
    return "offline";
  }

  if (
    reading.temperatureC >= 85 ||
    reading.pressureBar >= 6.2 ||
    reading.vibrationMmS >= 6.1
  ) {
    return "critical";
  }

  if (
    reading.temperatureC >= 78 ||
    reading.pressureBar >= 5.8 ||
    reading.vibrationMmS >= 5.2 ||
    reading.utilizationPct < 55
  ) {
    return "warning";
  }

  return "running";
}

export function buildAlarms(readings: EquipmentReading[]): Alarm[] {
  return readings.flatMap((reading) => {
    const alarms: Alarm[] = [];

    if (reading.isOffline) {
      alarms.push(createAlarm(reading, "critical", "Equipment offline", "No telemetry update received from controller."));
      return alarms;
    }

    if (reading.temperatureC >= 85) {
      alarms.push(createAlarm(reading, "critical", "High temperature trip risk", `${reading.temperatureC.toFixed(1)} C exceeds the critical threshold.`));
    } else if (reading.temperatureC >= 78) {
      alarms.push(createAlarm(reading, "warning", "Temperature approaching limit", `${reading.temperatureC.toFixed(1)} C is above the warning threshold.`));
    }

    if (reading.pressureBar >= 6.2) {
      alarms.push(createAlarm(reading, "critical", "Pressure above safe range", `${reading.pressureBar.toFixed(1)} bar requires operator attention.`));
    } else if (reading.pressureBar >= 5.8) {
      alarms.push(createAlarm(reading, "warning", "Pressure drift detected", `${reading.pressureBar.toFixed(1)} bar is close to the configured limit.`));
    }

    if (reading.vibrationMmS >= 6.1) {
      alarms.push(createAlarm(reading, "critical", "Mechanical vibration high", `${reading.vibrationMmS.toFixed(1)} mm/s indicates possible mechanical wear.`));
    } else if (reading.vibrationMmS >= 5.2) {
      alarms.push(createAlarm(reading, "warning", "Vibration trend rising", `${reading.vibrationMmS.toFixed(1)} mm/s should be monitored.`));
    }

    if (reading.utilizationPct < 55) {
      alarms.push(createAlarm(reading, "info", "Low utilization", `${Math.round(reading.utilizationPct)}% utilization is below the expected operating band.`));
    }

    return alarms;
  });
}

export function summarizePlant(readings: EquipmentReading[]): PlantSummary {
  const online = readings.filter((reading) => !reading.isOffline).length;
  const activeAlarms = buildAlarms(readings).length;
  const utilizationAvg = average(readings.map((reading) => reading.utilizationPct));
  const throughputTotal = readings.reduce((sum, reading) => sum + reading.throughputPerHour, 0);

  return {
    online,
    total: readings.length,
    activeAlarms,
    utilizationAvg,
    throughputTotal
  };
}

function createAlarm(
  reading: EquipmentReading,
  severity: AlarmSeverity,
  title: string,
  description: string
): Alarm {
  return {
    id: `${reading.id}-${title.toLowerCase().replaceAll(" ", "-")}`,
    equipmentId: reading.id,
    equipmentTag: reading.tag,
    equipmentName: reading.name,
    severity,
    title,
    description,
    raisedAt: reading.updatedAt
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
