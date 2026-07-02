using ScadaDemo.Api.Models;
using ScadaDemo.Api.Services;

namespace ScadaDemo.Api.Tests;

public sealed class AlarmEvaluatorTests
{
    [Fact]
    public void BuildAlarms_CreatesCriticalOfflineAlarm()
    {
        var reading = CreateReading(isOffline: true);

        var alarms = AlarmEvaluator.BuildAlarms([reading]);

        var alarm = Assert.Single(alarms);
        Assert.Equal("forming-press-01-equipment-offline", alarm.Id);
        Assert.Equal(AlarmSeverity.Critical, alarm.Severity);
        Assert.Equal("Equipment offline", alarm.Title);
    }

    [Fact]
    public void BuildAlarms_CreatesLimitAlarmForHighPressure()
    {
        var reading = CreateReading(pressureBar: 6.3);

        var alarms = AlarmEvaluator.BuildAlarms([reading]);

        var alarm = Assert.Single(alarms);
        Assert.Equal(AlarmSeverity.Critical, alarm.Severity);
        Assert.Equal("Pressure above safe range", alarm.Title);
    }

    private static EquipmentReading CreateReading(
        double pressureBar = 5,
        bool isOffline = false) =>
        new(
            Id: "forming-press-01",
            Tag: "PR-420",
            Name: "Forming press",
            Area: "Packaging",
            TemperatureC: 72,
            PressureBar: pressureBar,
            VibrationMmS: 3.8,
            ThroughputPerHour: 200,
            UtilizationPct: 82,
            IsOffline: isOffline,
            UpdatedAt: DateTimeOffset.Parse("2026-06-25T08:00:00Z"));
}
