namespace ScadaDemo.Api.Models;

public sealed record EquipmentDefinition(
    string Id,
    string Tag,
    string Name,
    string Area,
    double NominalTemperatureC,
    double NominalPressureBar,
    double NominalVibrationMmS,
    int NominalThroughputPerHour);
