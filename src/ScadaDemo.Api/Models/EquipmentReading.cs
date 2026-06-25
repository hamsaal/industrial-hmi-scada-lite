namespace ScadaDemo.Api.Models;

public sealed record EquipmentReading(
    string Id,
    string Tag,
    string Name,
    string Area,
    double TemperatureC,
    double PressureBar,
    double VibrationMmS,
    int ThroughputPerHour,
    double UtilizationPct,
    bool IsOffline,
    DateTimeOffset UpdatedAt);
