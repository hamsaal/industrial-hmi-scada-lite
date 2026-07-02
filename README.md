# Industrial HMI/SCADA Lite

A small portfolio prototype for an industrial HMI/SCADA-style engineering web application.

The goal is to demonstrate approach the domain: model equipment telemetry, expose backend monitoring endpoints, visualize plant status in a browser, surface alarms, and keep the code modular and testable.

## Current Scope

- Browser-based operator dashboard with KPI cards, equipment status table, process values, and active alarms.
- API-backed telemetry snapshot with a browser simulator fallback for local demos.
- .NET Minimal API source for equipment, telemetry, alarms, and health endpoints.
- Small domain tests for alarm classification and equipment summary logic.

## Why This Project Exists

The target role is TypeScript/.NET web application development for HMI/SCADA visualization systems. This prototype is intentionally simple, but it gives you something concrete to discuss:

- How frontend screens are shaped around operators and engineering workflows.
- How telemetry models can separate raw readings from UI presentation.
- How alarms can be classified, acknowledged, and displayed.
- How a greenfield product can be structured for incremental feature work.

## Run The Frontend Demo

```bash
npm run serve
```

Then open http://localhost:5173.

For the most production-like path, run the .NET API first. The dashboard reads
from `http://localhost:5078`, subscribes to live dashboard updates, and falls
back to API polling or the committed browser simulator when the stream/API is
not available.

## Run Tests

```bash
npm test
```

## Build And CI Checks

```bash
npm run ci
```

This restores .NET packages, builds the solution in Release mode, validates the
browser modules, and runs backend/frontend tests. See `docs/build-system.md` for
the full command map.

## Run The .NET API

Install the .NET SDK, then run:

```bash
dotnet run --project src/ScadaDemo.Api
```

## Production Roadmap

See `docs/production-roadmap.md` for the branch plan. The first production
foundation branch is `feature/api-backed-hmi-foundation`, which makes the API
the owner of telemetry and alarm data while preserving a simulator fallback for
safe local demos.
