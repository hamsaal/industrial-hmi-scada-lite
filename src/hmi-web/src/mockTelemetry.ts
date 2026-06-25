import { EquipmentReading, equipmentDefinitions } from "./domain";

let tick = 0;

export function nextTelemetryFrame(): EquipmentReading[] {
  tick += 1;
  const now = new Date();

  return equipmentDefinitions.map((equipment, index) => {
    const wave = Math.sin((tick + index * 4) / 4);
    const pressureDrift = index === 1 && tick % 18 > 12 ? 1.8 : 0;
    const pressHeat = index === 2 && tick % 20 > 14 ? 9 : 0;
    const isOffline = index === 0 && tick % 40 > 35;

    return {
      id: equipment.id,
      tag: equipment.tag,
      name: equipment.name,
      area: equipment.area,
      temperatureC: round(equipment.nominalTemperatureC + wave * 3 + pressHeat, 1),
      pressureBar: round(equipment.nominalPressureBar + wave * 0.25 + pressureDrift, 1),
      vibrationMmS: round(equipment.nominalVibrationMmS + Math.abs(wave), 1),
      throughputPerHour: Math.max(0, Math.round(equipment.nominalThroughputPerHour + wave * 10)),
      utilizationPct: Math.max(0, Math.min(100, round(82 + wave * 10, 0))),
      isOffline,
      updatedAt: now.toISOString()
    };
  });
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
