namespace ScadaDemo.Api.Models;

public sealed record DashboardSnapshot(
    PlantSummary Summary,
    IReadOnlyList<EquipmentReading> Readings,
    IReadOnlyList<AlarmEvent> Alarms,
    DateTimeOffset CapturedAt);
