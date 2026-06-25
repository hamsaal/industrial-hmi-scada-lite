using ScadaDemo.Api.Models;

namespace ScadaDemo.Api.Services;

public sealed class TelemetrySimulator
{
    private readonly EquipmentDefinition[] _equipment =
    [
        new("mix-tank-01", "TK-401", "Mix tank", "Preparation", 62, 1.2, 1.8, 220),
        new("feed-pump-01", "P-410", "Feed pump", "Transfer", 48, 3.8, 3.1, 210),
        new("forming-press-01", "PR-420", "Forming press", "Packaging", 74, 5.4, 4.2, 198),
        new("outfeed-conveyor-01", "CV-430", "Outfeed conveyor", "Dispatch", 35, 0.6, 2.3, 205)
    ];

    private long _tick;

    public IReadOnlyList<EquipmentDefinition> Equipment => _equipment;

    public IReadOnlyList<EquipmentReading> GetLatestReadings()
    {
        var tick = Interlocked.Increment(ref _tick);
        var now = DateTimeOffset.UtcNow;

        return _equipment
            .Select((equipment, index) => BuildReading(equipment, index, tick, now))
            .ToArray();
    }

    private static EquipmentReading BuildReading(
        EquipmentDefinition equipment,
        int index,
        long tick,
        DateTimeOffset updatedAt)
    {
        var wave = Math.Sin((tick + index * 4) / 4.0);
        var pressureDrift = index == 1 && tick % 18 > 12 ? 1.8 : 0;
        var pressHeat = index == 2 && tick % 20 > 14 ? 9 : 0;
        var isOffline = index == 0 && tick % 40 > 35;

        return new EquipmentReading(
            Id: equipment.Id,
            Tag: equipment.Tag,
            Name: equipment.Name,
            Area: equipment.Area,
            TemperatureC: Round(equipment.NominalTemperatureC + wave * 3 + pressHeat, 1),
            PressureBar: Round(equipment.NominalPressureBar + wave * 0.25 + pressureDrift, 1),
            VibrationMmS: Round(equipment.NominalVibrationMmS + Math.Abs(wave), 1),
            ThroughputPerHour: Math.Max(0, (int)Math.Round(equipment.NominalThroughputPerHour + wave * 10)),
            UtilizationPct: Math.Clamp(Round(82 + wave * 10, 0), 0, 100),
            IsOffline: isOffline,
            UpdatedAt: updatedAt);
    }

    private static double Round(double value, int digits) =>
        Math.Round(value, digits, MidpointRounding.AwayFromZero);
}
