# Production Roadmap

This project should grow toward production behavior through small, reviewable
feature branches. Each branch should leave the system runnable and should make
one architectural decision obvious.

## Branch Plan

### `feature/api-backed-hmi-foundation`

Move the browser dashboard behind an API client boundary. The frontend should
render a dashboard snapshot without caring whether the data came from the .NET
API or the local development simulator.

Production value:

- Establishes the backend as the telemetry contract owner.
- Keeps mock data available as a fallback instead of the primary integration.
- Creates a clear place for retries, timeout handling, contract mapping, and
  future authentication headers.

### `feature/alarm-lifecycle`

Replace local-only alarm acknowledgement with backend-managed alarm state.
Alarms should support raised, acknowledged, cleared, returned-to-normal, and
shelved states.

Current branch scope:

- Add in-memory backend lifecycle state for active, acknowledged, and cleared
  alarms.
- Add an acknowledgement endpoint for operator actions.
- Keep acknowledged alarms visible in the HMI list with their handled state.

Production value:

- Matches how operators actually work with alarm lists.
- Preserves acknowledgement and clearance timestamps.
- Enables auditability and role-based control.

### `feature/live-telemetry-stream`

Add SignalR or Server-Sent Events for telemetry and alarm updates.

Production value:

- Removes UI polling as the main update mechanism.
- Makes connection state observable.
- Creates a realistic path toward PLC, OPC UA, MQTT, or historian ingestion.

### `feature/historian-and-trends`

Persist telemetry and alarm events in a database, then add trend endpoints and a
basic trend view.

Production value:

- Supports engineering diagnostics and post-incident review.
- Gives alarms context before and after a limit breach.
- Introduces database migrations and environment-specific configuration.

### `feature/operator-auth-audit`

Add authentication, roles, and an audit trail for operator actions.

Production value:

- Separates viewer, operator, engineer, and admin responsibilities.
- Records who acknowledged alarms or changed configuration.
- Prepares the app for real deployment boundaries.

### `feature/deployment-observability`

Add Docker Compose, health checks, structured logging, and CI checks.

Production value:

- Makes the application reproducible outside one developer machine.
- Creates a baseline for monitoring service health.
- Keeps formatting, tests, and builds visible on every branch.

## Architecture Decisions

- The frontend owns presentation state; the API owns telemetry, alarms, and
  operational state.
- Simulator data is a development adapter, not the production domain model.
- The API contract should use readable domain values such as `critical` rather
  than language-specific enum ordinals.
- Operator-facing state changes should eventually be persisted and audited.
