using ScadaDemo.Api.Models;

namespace ScadaDemo.Api.Services;

public static class AlarmEvaluator
{
    public static IReadOnlyList<AlarmEvent> BuildAlarms(IReadOnlyList<EquipmentReading> readings)
    {
        var alarms = new List<AlarmEvent>();

        foreach (var reading in readings)
        {
            if (reading.IsOffline)
            {
                alarms.Add(CreateAlarm(
                    reading,
                    AlarmSeverity.Critical,
                    "Equipment offline",
                    "No telemetry update received from controller."));
                continue;
            }

            AddLimitAlarm(
                alarms,
                reading,
                reading.TemperatureC,
                warningLimit: 78,
                criticalLimit: 85,
                warningTitle: "Temperature approaching limit",
                criticalTitle: "High temperature trip risk",
                unit: "C");

            AddLimitAlarm(
                alarms,
                reading,
                reading.PressureBar,
                warningLimit: 5.8,
                criticalLimit: 6.2,
                warningTitle: "Pressure drift detected",
                criticalTitle: "Pressure above safe range",
                unit: "bar");

            AddLimitAlarm(
                alarms,
                reading,
                reading.VibrationMmS,
                warningLimit: 5.2,
                criticalLimit: 6.1,
                warningTitle: "Vibration trend rising",
                criticalTitle: "Mechanical vibration high",
                unit: "mm/s");

            if (reading.UtilizationPct < 55)
            {
                alarms.Add(CreateAlarm(
                    reading,
                    AlarmSeverity.Info,
                    "Low utilization",
                    $"{Math.Round(reading.UtilizationPct)}% utilization is below the expected operating band."));
            }
        }

        return alarms;
    }

    private static void AddLimitAlarm(
        ICollection<AlarmEvent> alarms,
        EquipmentReading reading,
        double value,
        double warningLimit,
        double criticalLimit,
        string warningTitle,
        string criticalTitle,
        string unit)
    {
        if (value >= criticalLimit)
        {
            alarms.Add(CreateAlarm(
                reading,
                AlarmSeverity.Critical,
                criticalTitle,
                $"{value:F1} {unit} exceeds the critical threshold."));
        }
        else if (value >= warningLimit)
        {
            alarms.Add(CreateAlarm(
                reading,
                AlarmSeverity.Warning,
                warningTitle,
                $"{value:F1} {unit} is above the warning threshold."));
        }
    }

    private static AlarmEvent CreateAlarm(
        EquipmentReading reading,
        AlarmSeverity severity,
        string title,
        string description)
    {
        return new AlarmEvent(
            Id: $"{reading.Id}-{title.ToLowerInvariant().Replace(' ', '-')}",
            EquipmentId: reading.Id,
            EquipmentTag: reading.Tag,
            EquipmentName: reading.Name,
            Severity: severity,
            Title: title,
            Description: description,
            RaisedAt: reading.UpdatedAt);
    }
}
