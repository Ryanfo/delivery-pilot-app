<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-10 | kind: release_verification | revision: be71a8c5dc02-local-pilot | run: SDLC-10-release_verification-20261002T125559Z-216a1c -->
<!-- input_revision: 3be5e2a1c2f2f881d70e19c1ed943ee38b825e88977ae3f7fbd79d09bf982331 | worker: ryan-mac -->
<!-- released_commit: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->

# Release verification

> Provenance (ticket, release record, released commit, provenance chain) is added by the coordinator.

## Release record
- Released commit: `be71a8c5dc029f41e237cd248eb3367a040f74e4` (matches `merged_pr` #5, `pr_head`/candidate `fd5338eabb45db7e960655cb4b1c2df8ce90b964`)
- Environment: `local-pilot`
- Merged PR: #5, merged by `Ryanfo`, strategy "merge commit"
- Provenance (from `release_record.json`): `merged_tree_matches_candidate: true`, `released_equals_merge: true` — the released commit is exactly the merge of the accepted candidate, no drift.
- Working tree for this verification is checked out at `be71a8c`, matching the release record.
- `coordinator_checks.json` for this run only contains a `setup` entry (`npm ci`, passed). No e2e run results for the candidate or integration tree were present in `check-logs/` at verification time (see Findings F1).

## Smoke evidence
| Step | Observation | Status |
|---|---|---|
| 1. Install and start the app | `npm ci` succeeded (247 packages, 0 vulnerabilities). Starting the app for interactive/browser use was not performed by me — Playwright/Chromium cannot launch in this sandbox and the command to start a local server for manual inspection was not authorized in this run. | Partial |
| 2–10 (browser-driven checkbox/filter behaviour, AC1–AC7) | Not independently exercised by me in a browser. Equivalent behaviour is covered by the component test suite (`src/App.test.tsx`), which I ran directly via `vitest run` with jsdom and React Testing Library, simulating clicks and keyboard input identical to the proposal's steps. | See evidence below |
| `npm run lint` | Passed, 0 warnings/errors. | Passed |
| `npm run typecheck` | Passed (`tsc --noEmit`). | Passed |
| `npm run test:unit` (`vitest run`) | 3 files, 21/21 tests passed, including `filterTasks` unit tests and all AC1–AC7 component tests in `App.test.tsx`. | Passed |
| `npm run build` | Passed (`tsc --noEmit` + `vite build`), produced `dist/index.html` and bundled JS. | Passed |
| `npm run test:e2e` (Playwright) | Not run by me (cannot launch Chromium in this sandbox, per procedure). No coordinator e2e log for the candidate/integration tree was available in this run's `check-logs/` to cite. | Unverified (see F1) |

## Acceptance criteria evidence
| AC | Description | Evidence | Status |
|---|---|---|---|
| AC1 | "Starred only" checkbox, visible label, unticked by default | `src/App.tsx:63-69` renders the labelled checkbox; `App.test.tsx` "shows a 'Starred only' checkbox, labelled and unticked by default (AC1)" passed. | Met (component-test evidence; not independently browser-verified) |
| AC2 | Ticking shows only starred tasks | `src/domain/filter.ts` `filterTasks` ANDs `starredOnly`/`starredIds`; `filter.test.ts` and `App.test.tsx` "narrows the list to starred tasks only when ticked (AC2)" passed. | Met (same caveat) |
| AC3 | Starred-only and status filter combine | `filter.test.ts` "combines status and starredOnly filters" and `App.test.tsx` "combines 'Starred only' with the status filter (AC3)" passed. | Met (same caveat) |
| AC4 | Unstarring while ticked removes task immediately | `App.test.tsx` "removes an unstarred task immediately while 'Starred only' is ticked (AC4)" passed. | Met (same caveat) |
| AC5 | Empty-state message when no starred task matches | `App.test.tsx` "shows the empty-state message when the combined filters match nothing (AC5)" passed. | Met (same caveat) |
| AC6 | "Showing X of Y tasks" counts the filtered list | `App.test.tsx` "updates the 'Showing X of Y tasks' count for the combined filter (AC6)" passed. | Met (same caveat) |
| AC7 | Checkbox works with keyboard; all checks pass | Keyboard toggle: `App.test.tsx` "toggles the 'Starred only' checkbox via keyboard focus and Space (AC7)" passed. Checks: lint, typecheck, unit, build all passed when I ran them directly on the released commit; e2e was not run (see F1). | Partially met — keyboard behaviour verified; "all checks pass" not fully verified because e2e has no evidence in this run |

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | major | `coordinator_checks.json` and `check-logs/` for this release-verification run contain only a `setup` (`npm ci`) entry — no e2e run results for the candidate or integration tree are present to cite as required by the procedure. AC7 requires "all checks pass (lint, typecheck, unit, build, e2e)"; e2e remains unverified for the released commit pending that evidence. |
| F2 | info | `src/App.tsx:47` still renders an unrelated `<section aria-label="Welcome">HELLO WORLD</section>` block. Confirmed via `git diff 15865a5 fd5338e -- src/App.tsx` that this predates SDLC-10 (introduced by SDLC-7) and is untouched by this release — out of scope, noted for awareness only. |
