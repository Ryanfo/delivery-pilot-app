# Task list pilot app

A small, generic task-list web app (React, TypeScript, Vite) used to pilot the local
Jira-driven AI SDLC delivered by `delivery-platform`. All data is synthetic.

```bash
npm ci
npm run dev            # http://127.0.0.1:5173 (or $PORT)
npm run lint && npm run typecheck && npm run test:unit && npm run build
npx playwright install chromium && npm run test:e2e
```

Feature work arrives through the delivery coordinator as pull requests from `feature/<TICKET>`
branches. Delivery artefacts live on `delivery/<TICKET>` branches. See `CLAUDE.md` and `docs/`.
