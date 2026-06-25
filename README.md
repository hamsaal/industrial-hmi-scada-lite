# Industrial HMI/SCADA Lite

A small portfolio prototype for an industrial HMI/SCADA-style engineering web application.

The goal is to demonstrate how a medior full stack developer could approach the domain: model equipment telemetry, expose backend monitoring endpoints, visualize plant status in a browser, surface alarms, and keep the code modular and testable.

## Current Scope

- Browser-based operator dashboard with equipment status, process values, alarm list, and trends.
- Mock telemetry stream so the UI can be demonstrated without real PLC or SCADA infrastructure.
- .NET Minimal API source for equipment, telemetry, alarms, and health endpoints.
- Small domain tests for alarm classification and equipment summary logic.

## Why This Project Exists

The target role is TypeScript/.NET web application development for HMI/SCADA visualization systems. This prototype is intentionally simple, but it gives you something concrete to discuss:

- How frontend screens are shaped around operators and engineering workflows.
- How telemetry models can separate raw readings from UI presentation.
- How alarms can be classified, acknowledged, and displayed.
- How a greenfield product can be structured for incremental feature work.

## Run The Frontend Demo

Open `src/hmi-web/index.html` in a browser.

The page uses a committed JavaScript build so it can run even on a machine without TypeScript tooling. The TypeScript source lives beside it in `src/hmi-web/src`.

## Run Tests

```bash
node --test tests/domain.test.mjs
```

## Run The .NET API

Install the .NET SDK, then run:

```bash
dotnet run --project src/ScadaDemo.Api
```

This environment currently does not have `dotnet` installed, so the API is included as source and documented for local use.

## Roadmap

- Add Angular or a TypeScript build pipeline.
- Add SignalR/WebSocket live updates.
- Add alarm acknowledgement persistence.
- Add integration tests for API routes.
- Add GitHub Actions CI once the repository is pushed.
