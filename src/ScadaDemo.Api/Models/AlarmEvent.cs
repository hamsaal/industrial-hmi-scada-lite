namespace ScadaDemo.Api.Models;

public sealed record AlarmEvent(
    string Id,
    string EquipmentId,
    string EquipmentTag,
    string EquipmentName,
    AlarmSeverity Severity,
    string Title,
    string Description,
    DateTimeOffset RaisedAt);

public enum AlarmSeverity
{
    Info,
    Warning,
    Critical
}
