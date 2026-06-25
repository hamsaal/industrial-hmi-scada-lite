using ScadaDemo.Api.Models;
using ScadaDemo.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<TelemetrySimulator>();
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

app.MapGet("/api/alarms/active", (TelemetrySimulator telemetry) =>
{
    var readings = telemetry.GetLatestReadings();
    return Results.Ok(AlarmEvaluator.BuildAlarms(readings));
});

app.MapGet("/api/summary", (TelemetrySimulator telemetry) =>
{
    var readings = telemetry.GetLatestReadings();
    var alarms = AlarmEvaluator.BuildAlarms(readings);
    var online = readings.Count(reading => !reading.IsOffline);

    return Results.Ok(new PlantSummary(
        Online: online,
        Total: readings.Count,
        ActiveAlarms: alarms.Count,
        UtilizationAverage: readings.Average(reading => reading.UtilizationPct),
        ThroughputTotal: readings.Sum(reading => reading.ThroughputPerHour)));
});

app.Run();
