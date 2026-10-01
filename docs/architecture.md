# Architecture

Client-only React + TypeScript single-page app built with Vite. No backend, no network calls.

| Layer | Location | Responsibility |
|---|---|---|
| Domain | `src/domain/` | Types and pure functions (filtering, sorting). No React, no I/O. |
| Data | `src/data/` | Checked-in synthetic fixture tasks. |
| Storage | `src/storage/` | Persistence boundary (`KeyValueStore`), resilient to corrupt or missing storage. |
| UI | `src/App.tsx`, `src/components/` | Accessible React components composing domain functions. |

State lives in `App` (React state). Derived lists are computed with pure domain functions in
`useMemo`. New query features extend `TaskQuery` in `src/domain/filter.ts` rather than adding
ad-hoc filtering in components.
