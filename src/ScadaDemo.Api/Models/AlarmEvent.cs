namespace ScadaDemo.Api.Models;

public sealed record AlarmEvent(
    string Id,
    string EquipmentId,
    string EquipmentTag,
    string EquipmentName,
    AlarmSeverity Severity,
    string Title,
    string Description,
    DateTimeOffset RaisedAt,
    AlarmStatus Status = AlarmStatus.Active,
    DateTimeOffset? AcknowledgedAt = null,
    string? AcknowledgedBy = null,
    DateTimeOffset? ClearedAt = null);

public enum AlarmSeverity
{
    Info,
    Warning,
    Critical
}

public enum AlarmStatus
{
    Active,
    Acknowledged,
    Cleared,
    Shelved
}
