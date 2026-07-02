using ScadaDemo.Api.Models;

namespace ScadaDemo.Api.Services;

public sealed class AlarmLifecycleService
{
    private readonly object _gate = new();
    private readonly Dictionary<string, AlarmStateRecord> _states = [];

    public IReadOnlyList<AlarmEvent> ApplyLifecycle(
        IReadOnlyList<AlarmEvent> evaluatedAlarms,
        DateTimeOffset observedAt)
    {
        lock (_gate)
        {
            var activeIds = evaluatedAlarms.Select(alarm => alarm.Id).ToHashSet(StringComparer.Ordinal);
            var alarms = new List<AlarmEvent>(evaluatedAlarms.Count);

            foreach (var alarm in evaluatedAlarms)
            {
                var state = GetOrCreateState(alarm);
                alarms.Add(alarm with
                {
                    RaisedAt = state.RaisedAt,
                    Status = state.Status,
                    AcknowledgedAt = state.AcknowledgedAt,
                    AcknowledgedBy = state.AcknowledgedBy,
                    ClearedAt = state.ClearedAt
                });
            }

            foreach (var (alarmId, state) in _states)
            {
                if (!activeIds.Contains(alarmId) && state.Status != AlarmStatus.Cleared)
                {
                    state.Status = AlarmStatus.Cleared;
                    state.ClearedAt = observedAt;
                }
            }

            return alarms;
        }
    }

    public int Acknowledge(
        IReadOnlyCollection<string> alarmIds,
        string operatorName,
        DateTimeOffset acknowledgedAt)
    {
        lock (_gate)
        {
            var count = 0;

            foreach (var alarmId in alarmIds.Distinct(StringComparer.Ordinal))
            {
                if (!_states.TryGetValue(alarmId, out var state) ||
                    state.Status is AlarmStatus.Cleared or AlarmStatus.Shelved)
                {
                    continue;
                }

                if (state.Status != AlarmStatus.Acknowledged)
                {
                    count += 1;
                }

                state.Status = AlarmStatus.Acknowledged;
                state.AcknowledgedAt = acknowledgedAt;
                state.AcknowledgedBy = operatorName;
            }

            return count;
        }
    }

    private AlarmStateRecord GetOrCreateState(AlarmEvent alarm)
    {
        if (!_states.TryGetValue(alarm.Id, out var state))
        {
            state = new AlarmStateRecord
            {
                RaisedAt = alarm.RaisedAt,
                Status = AlarmStatus.Active
            };
            _states[alarm.Id] = state;
            return state;
        }

        if (state.Status == AlarmStatus.Cleared)
        {
            state.RaisedAt = alarm.RaisedAt;
            state.Status = AlarmStatus.Active;
            state.AcknowledgedAt = null;
            state.AcknowledgedBy = null;
            state.ClearedAt = null;
        }

        return state;
    }

    private sealed class AlarmStateRecord
    {
        public required DateTimeOffset RaisedAt { get; set; }
        public required AlarmStatus Status { get; set; }
        public DateTimeOffset? AcknowledgedAt { get; set; }
        public string? AcknowledgedBy { get; set; }
        public DateTimeOffset? ClearedAt { get; set; }
    }
}
