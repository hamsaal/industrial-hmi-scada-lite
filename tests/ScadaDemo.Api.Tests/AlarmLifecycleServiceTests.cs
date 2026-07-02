using ScadaDemo.Api.Models;
using ScadaDemo.Api.Services;

namespace ScadaDemo.Api.Tests;

public sealed class AlarmLifecycleServiceTests
{
    [Fact]
    public void ApplyLifecycle_PreservesOriginalRaisedTime()
    {
        var lifecycle = new AlarmLifecycleService();
        var firstRaisedAt = DateTimeOffset.Parse("2026-06-25T08:00:00Z");
        var laterRaisedAt = firstRaisedAt.AddMinutes(5);

        lifecycle.ApplyLifecycle([CreateAlarm(raisedAt: firstRaisedAt)], firstRaisedAt);
        var alarms = lifecycle.ApplyLifecycle([CreateAlarm(raisedAt: laterRaisedAt)], laterRaisedAt);

        var alarm = Assert.Single(alarms);
        Assert.Equal(firstRaisedAt, alarm.RaisedAt);
        Assert.Equal(AlarmStatus.Active, alarm.Status);
    }

    [Fact]
    public void Acknowledge_RecordsOperatorStateForActiveAlarm()
    {
        var lifecycle = new AlarmLifecycleService();
        var raisedAt = DateTimeOffset.Parse("2026-06-25T08:00:00Z");
        var acknowledgedAt = raisedAt.AddMinutes(2);

        lifecycle.ApplyLifecycle([CreateAlarm(raisedAt: raisedAt)], raisedAt);
        var count = lifecycle.Acknowledge(["alarm-1"], "operator-a", acknowledgedAt);
        var alarms = lifecycle.ApplyLifecycle([CreateAlarm(raisedAt: raisedAt.AddMinutes(3))], raisedAt.AddMinutes(3));

        var alarm = Assert.Single(alarms);
        Assert.Equal(1, count);
        Assert.Equal(AlarmStatus.Acknowledged, alarm.Status);
        Assert.Equal(acknowledgedAt, alarm.AcknowledgedAt);
        Assert.Equal("operator-a", alarm.AcknowledgedBy);
    }

    [Fact]
    public void ApplyLifecycle_MarksMissingActiveAlarmAsClearedInternally()
    {
        var lifecycle = new AlarmLifecycleService();
        var raisedAt = DateTimeOffset.Parse("2026-06-25T08:00:00Z");
        var clearedAt = raisedAt.AddMinutes(1);

        lifecycle.ApplyLifecycle([CreateAlarm(raisedAt: raisedAt)], raisedAt);
        lifecycle.ApplyLifecycle([], clearedAt);
        var count = lifecycle.Acknowledge(["alarm-1"], "operator-a", clearedAt.AddMinutes(1));

        Assert.Equal(0, count);
    }

    private static AlarmEvent CreateAlarm(DateTimeOffset raisedAt) =>
        new(
            Id: "alarm-1",
            EquipmentId: "forming-press-01",
            EquipmentTag: "PR-420",
            EquipmentName: "Forming press",
            Severity: AlarmSeverity.Warning,
            Title: "Vibration trend rising",
            Description: "3.8 mm/s should be monitored.",
            RaisedAt: raisedAt);
}
