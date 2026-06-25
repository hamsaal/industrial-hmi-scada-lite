namespace ScadaDemo.Api.Models;

public sealed record PlantSummary(
    int Online,
    int Total,
    int ActiveAlarms,
    double UtilizationAverage,
    int ThroughputTotal);
