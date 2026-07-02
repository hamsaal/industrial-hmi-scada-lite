using System.Text.Json;
using System.Text.Json.Serialization;
using ScadaDemo.Api.Models;
using ScadaDemo.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Keep the HTTP contract explicit and frontend-friendly. Alarm severity is
    // an operator-facing state, so the API should expose "critical" instead of
    // leaking C# enum ordinals such as 2.
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

builder.Services.AddSingleton<TelemetrySimulator>();
builder.Services.AddSingleton<AlarmLifecycleService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalFrontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});

var app = builder.Build();

app.UseCors("LocalFrontend");

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    service = "ScadaDemo.Api",
    checkedAtUtc = DateTimeOffset.UtcNow
}));

app.MapGet("/api/equipment", (TelemetrySimulator telemetry) =>
    Results.Ok(telemetry.Equipment));

app.MapGet("/api/telemetry/latest", (TelemetrySimulator telemetry) =>
    Results.Ok(telemetry.GetLatestReadings()));

app.MapGet("/api/alarms/active", (
    TelemetrySimulator telemetry,
    AlarmLifecycleService alarmLifecycle) =>
{
    var readings = telemetry.GetLatestReadings();
    var alarms = alarmLifecycle.ApplyLifecycle(
        AlarmEvaluator.BuildAlarms(readings),
        DateTimeOffset.UtcNow);

    return Results.Ok(alarms);
});

app.MapPost("/api/alarms/acknowledge", (
    AcknowledgeAlarmsRequest request,
    AlarmLifecycleService alarmLifecycle) =>
{
    var operatorName = string.IsNullOrWhiteSpace(request.OperatorName)
        ? "operator"
        : request.OperatorName.Trim();
    var acknowledgedAt = DateTimeOffset.UtcNow;
    var alarmIds = request.AlarmIds ?? [];
    var count = alarmLifecycle.Acknowledge(
        alarmIds,
        operatorName,
        acknowledgedAt);

    return Results.Ok(new AcknowledgeAlarmsResponse(count, acknowledgedAt));
});

app.MapGet("/api/dashboard/snapshot", (
    TelemetrySimulator telemetry,
    AlarmLifecycleService alarmLifecycle) =>
{
    var readings = telemetry.GetLatestReadings();
    var capturedAt = DateTimeOffset.UtcNow;
    var alarms = alarmLifecycle.ApplyLifecycle(
        AlarmEvaluator.BuildAlarms(readings),
        capturedAt);

    return Results.Ok(new DashboardSnapshot(
        Summary: BuildSummary(readings, alarms),
        Readings: readings,
        Alarms: alarms,
        CapturedAt: capturedAt));
});

app.MapGet("/api/summary", (
    TelemetrySimulator telemetry,
    AlarmLifecycleService alarmLifecycle) =>
{
    var readings = telemetry.GetLatestReadings();
    var alarms = alarmLifecycle.ApplyLifecycle(
        AlarmEvaluator.BuildAlarms(readings),
        DateTimeOffset.UtcNow);

    return Results.Ok(BuildSummary(readings, alarms));
});

static PlantSummary BuildSummary(
    IReadOnlyList<EquipmentReading> readings,
    IReadOnlyList<AlarmEvent> alarms)
{
    var online = readings.Count(reading => !reading.IsOffline);

    return new PlantSummary(
        Online: online,
        Total: readings.Count,
        ActiveAlarms: alarms.Count,
        UtilizationAverage: readings.Count > 0
            ? readings.Average(reading => reading.UtilizationPct)
            : 0,
        ThroughputTotal: readings.Sum(reading => reading.ThroughputPerHour));
}

app.Run();
