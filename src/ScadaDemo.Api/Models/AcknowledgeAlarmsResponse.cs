namespace ScadaDemo.Api.Models;

public sealed record AcknowledgeAlarmsResponse(
    int AcknowledgedCount,
    DateTimeOffset AcknowledgedAt);
