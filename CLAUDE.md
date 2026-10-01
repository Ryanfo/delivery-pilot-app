# Task list pilot app

Generic sample application used to pilot the local Jira-driven AI SDLC. Read before changing code:

- [Architecture](docs/architecture.md)
- [Coding standards](docs/coding-standards.md)
- [Testing policy](docs/testing-policy.md)
- [Guardrails](docs/guardrails.md)

Commands: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:e2e`.
Anything that listens must use `PORT` (or `E2E_PORT`); never assume a fixed port.
