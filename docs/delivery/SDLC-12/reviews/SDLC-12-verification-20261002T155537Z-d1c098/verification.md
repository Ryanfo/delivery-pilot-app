<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: verification | revision: SDLC-12-verification-20261002T155537Z-d1c098 | run: SDLC-12-verification-20261002T155537Z-d1c098 -->
<!-- input_revision: ca5cb5b271961b14dfa5bc608036f4ca46bb1d98a141c41fd3943a92982948e2 | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

Candidate verified: `2009e68b23cb9f08c979a5c6f192e7c029f35fc3` (worktree HEAD confirmed with `git rev-parse HEAD`).
Base: `be71a8c`. Diff against base touches only `src/App.tsx` (1 line), `src/App.test.tsx` (+24) and `e2e/app.spec.ts` (+2/−1).

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 – main heading reads "My tasks" | `src/App.tsx:46` renders `<h1>My tasks</h1>`. Component test "shows a single level-1 heading reading exactly 'My tasks' (SDLC-12 AC1)" passed: there is exactly one `h1`, and its accessible name is exactly "My tasks". In a real browser, the coordinator's e2e run of `e2e/app.spec.ts` (asserting `level: 1, name: "My tasks", exact: true` is visible) passed on both the candidate and the integration tree (`check-logs/candidate-e2e.log`, `check-logs/integration-e2e.log`: 1 passed). | `npm run test:unit -- --reporter=verbose`; coordinator `e2e` | met |
| AC2 – "Task list" no longer the page heading | Component test "no longer shows 'Task list' as a page heading (SDLC-12 AC2)" passed. It checks that no heading of any level matches `/task list/i`. The coordinator e2e run passed with `getByRole("heading", { name: "Task list" })` at count 0. A search of the repository finds no "Task list" in `src/` page markup. The remaining occurrences are `index.html:6` `<title>` (the tab title, out of scope per brief), `README.md:1` and `CLAUDE.md:1` (not page content), historical `docs/delivery/SDLC-7/**`, and the test files' negative assertions. | `npm run test:unit -- --reporter=verbose`; repository search for "Task list"; coordinator `e2e` | met |
| AC3 – rest of page unchanged | `git diff --stat` against base shows `src/App.tsx` with only 1 line changed (the `h1` text). The welcome section, controls, count line and list markup are unchanged. The new AC3 component test passed: it checks the Welcome region text "HELLO WORLD", the "Status" combobox, the unticked "Starred only" checkbox, the exact line `Showing N of N tasks · 0 starred`, and that the list holds every task. All 18 earlier component and unit tests (filters, starring, persistence, counts, empty state) still pass, and none were changed. The coordinator e2e journey (filter, star, reload persistence) passed on the candidate and the integration tree. | `git diff --stat be71a8c..2009e68`; `npm run test:unit -- --reporter=verbose`; coordinator `e2e` | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| `git rev-parse HEAD` | passed | `2009e68b23cb9f08c979a5c6f192e7c029f35fc3`, which is the candidate. |
| `npm ci` | passed | 247 packages, 0 vulnerabilities. |
| `npm run test:unit -- --reporter=verbose` | passed | 3 files, 24/24 tests, including all three SDLC-12 tests. |
| `git diff --stat be71a8c… 2009e68…` | passed | 3 files changed, 27 insertions, 2 deletions. |
| `npm run lint` | passed | eslint, `--max-warnings 0`. |
| `npm run typecheck` | passed | `tsc --noEmit`. |
| `npm run build` | passed | vite build produced `dist/`. |
| `git status --short` | passed | No tracked files modified. |
| e2e (Playwright) | not run by worker | Chromium cannot launch in the worker sandbox. Evidence comes from the coordinator's runs: candidate and integration e2e both passed (1 test). |

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | major | Input defect, not a code defect. In `approved_artefacts`, the specification and plan entries both resolve to `inputs/approved/v001.md`, and its provenance says `kind: plan`. The approved specification (commit `557002a`) was not available, so verification was against the brief's AC1–AC3 and the plan. The independent review (F1) reported the same issue. A human should confirm the spec adds no criteria beyond the brief. |
| F2 | info | The tab title in `index.html:6` still reads "Task list". The brief makes this out of scope, but the tab title and heading now differ. |
| F3 | info | SDLC-11 (Plan review) touches `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts` and is based on `be71a8c`. The AC1 test (exactly one `h1`) and the AC3 test (exact count line) will catch any change to the heading or count wording after SDLC-11 rebases. That is intended, but those failures should not be read as SDLC-12 regressions. |

## Notes
- The coordinator's configured checks (lint, typecheck, unit, build, e2e) all passed on both the candidate and the integration tree (`ab4cb91`). Those results are authoritative. The worker's local lint, typecheck, unit and build runs agree with them.
- No designs or attachments were supplied, and none are referenced by the criteria.
