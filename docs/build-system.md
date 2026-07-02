# Build System

The repository has one local build contract: `npm run ci`. CI runs the same
command so local checks and pull request checks do not drift apart.

## Toolchain

- .NET SDK 8, pinned through `global.json`.
- Node.js 18 or newer, declared in `.nvmrc`.
- No frontend package dependencies are required for the current static HMI.

## Commands

- `npm run restore` restores .NET packages.
- `npm run build` builds the .NET solution and validates browser modules.
- `npm test` runs backend xUnit tests and frontend domain tests.
- `npm run ci` runs the full PR gate.
- `make check` is a shell-friendly alias for the same PR gate.

## CI

GitHub Actions runs on every pull request and every push to `main`. The workflow
restores the .NET solution, builds in Release mode, runs backend tests, validates
frontend module syntax, and runs the Node domain tests.
