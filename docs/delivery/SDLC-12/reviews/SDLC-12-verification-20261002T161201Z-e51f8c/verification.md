<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: verification | revision: SDLC-12-verification-20261002T161201Z-e51f8c | run: SDLC-12-verification-20261002T161201Z-e51f8c -->
<!-- input_revision: e2d5c229f57a316c9dd528e2fc163f47396ea6986439cb89e97b7e6bcbf8ebca | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | `src/App.tsx:46` renders `<h1>My tasks</h1>`. The component test asserting exactly one level-1 heading with accessible name "My tasks" passed when I ran it. In the coordinator's e2e run (candidate and integration), `e2e/app.spec.ts:5` asserts a visible level-1 heading "My tasks" with `exact: true`; that test passed on both trees. | `npx vitest run src/App.test.tsx -t "SDLC-12"` → "shows a single level-1 heading reading exactly 'My tasks' (SDLC-12 AC1)" ✓; coordinator `check-logs/candidate-e2e.log`, `check-logs/integration-e2e.log` (1 passed each) | met |
| AC2 | Grepping `src/`, `e2e/` and `index.html` for "Task list" finds it only in `index.html:6` `<title>`, which the brief puts out of scope, and in the AC2 test name/assertion. The component test asserting no heading matches `/task list/i` passed. In the coordinator's e2e run, `e2e/app.spec.ts:6` (`toHaveCount(0)` for heading "Task list") passed on candidate and integration. | `grep -rn "Task list\|My tasks" src e2e index.html`; "no longer shows 'Task list' as a page heading (SDLC-12 AC2)" ✓; coordinator e2e logs | met |
| AC3 | `git diff --stat be71a8c 2009e68` shows three files. The only production change is a one-line edit to `src/App.tsx`. The AC3 component test (welcome text "HELLO WORLD", Status combobox, unticked "Starred only", count line `Showing 12 of 12 tasks · 0 starred`, 12 list items) passed. All 11 existing App tests (filters, stars, persistence, counts) still pass unchanged, and so does the rest of the e2e journey (coordinator, both trees). | `npm run test:unit` (24/24 passed); "keeps the welcome block, filters, count line and task list unchanged (SDLC-12 AC3)" ✓; coordinator e2e logs | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| `git rev-parse HEAD` / `git status --short` | passed | HEAD = `2009e68b23cb`, clean tree before and after |
| `npm run test:unit` | passed | 3 files, 24 tests passed |
| `npx vitest run src/App.test.tsx -t "SDLC-12" --reporter=verbose` | passed | 3 SDLC-12 tests passed, 11 skipped by filter |
| `grep -rn "Task list\|My tasks" src e2e index.html` | passed | only out-of-scope `<title>` keeps "Task list" |
| `git diff --stat be71a8c 2009e68` | passed | 3 files changed, 27 insertions, 2 deletions |
| `npm run lint` | passed | exit 0 |
| `npm run typecheck` | passed | exit 0 |
| Playwright e2e | not run by me | Chromium cannot launch in the worker sandbox. I cite the coordinator's e2e logs instead: candidate and integration each show 1 passed. |

Dependencies were already installed in the checkout (`node_modules` present), so I did not run `npm ci`.

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | minor | The envelope's `approved_artefacts` lists the specification and the plan under the same local path (`inputs/approved/v001.md`), and that file is the plan. The approved specification (commit `557002aa39b3`) was therefore not available to this verification, so I verified against the brief's ACs and the plan. The review raised the same issue as its F1. |
| F2 | info | `index.html:6` still has `<title>Task list</title>`, so the tab title and the heading now differ. The brief explicitly excludes the tab title, so this is correct, but product may want a follow-up ticket. |
| F3 | info | SDLC-11 (Verifying) changes `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts`. Whichever ticket merges second needs a rebase and a full unit + e2e rerun. When resolving conflicts, keep the "My tasks" e2e assertion. |

## Notes
- The coordinator's checks (lint, typecheck, unit, build, e2e) passed on both the candidate and the integration tree (`ab4cb91065cc`). Those results are authoritative.
- I did not modify any tracked files.
