import { EquipmentReading, equipmentDefinitions } from "./domain";

let tick = 0;

export function nextTelemetryFrame(): EquipmentReading[] {
  tick += 1;
  const now = new Date();

  return equipmentDefinitions.map((equipment, index) => {
    const wave = Math.sin((tick + index * 8) / 5);
    const pulse = Math.cos((tick + index * 5) / 7);
    const incidentBoost = tick % 30 > 22 && index === 2 ? 8 : 0;
    const pumpDrift = tick % 42 > 34 && index === 1 ? 1.7 : 0;
    const conveyorDip = tick % 36 > 27 && index === 3 ? 28 : 0;
    const isOffline = tick % 55 > 48 && index === 0;

    return {
      id: equipment.id,
      tag: equipment.tag,
      name: equipment.name,
      area: equipment.area,
      temperatureC: round(equipment.nominalTemperatureC + wave * 4 + incidentBoost, 1),
      pressureBar: round(equipment.nominalPressureBar + pulse * 0.35 + pumpDrift, 1),
      vibrationMmS: round(equipment.nominalVibrationMmS + Math.abs(wave) * 1.2 + incidentBoost / 6, 1),
      throughputPerHour: Math.max(0, Math.round(equipment.nominalThroughputPerHour + pulse * 12 - conveyorDip)),
      utilizationPct: Math.max(0, Math.min(100, round(82 + wave * 12 - conveyorDip, 0))),
      isOffline,
      updatedAt: now.toISOString()
    };
  });
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
