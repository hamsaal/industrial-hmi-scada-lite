namespace ScadaDemo.Api.Models;

public sealed record AcknowledgeAlarmsRequest(
    IReadOnlyList<string> AlarmIds,
    string OperatorName);
