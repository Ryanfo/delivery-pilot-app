<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: verification | revision: SDLC-12-verification-20261002T161728Z-3cb631 | run: SDLC-12-verification-20261002T161728Z-3cb631 -->
<!-- input_revision: b79c275145870b7ee38741f291a238565728a0275d7037709344bab24971c425 | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

**Important limitation:** The Bash tool was denied in this session ("don't ask" permission mode), so I ran **no commands**. I did not run `npm ci`, the unit/component tests or any check myself. All executed-test evidence below comes from the coordinator's own runs (`coordinator_checks.json` and `inputs/check-logs/`), which are authoritative. I read those logs and the candidate source at `2009e68` directly.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | `src/App.tsx:46` renders `<h1>My tasks</h1>` as the first child of `<main>`, and it is the only `<h1>` in `src/`. Component test `src/App.test.tsx:115` asserts exactly one level-1 heading, named "My tasks". E2e `e2e/app.spec.ts:5` asserts a visible level-1 heading "My tasks" (`exact: true`). Coordinator logs: candidate unit run shows `src/App.test.tsx (14 tests)` passed, 24/24 total. The file has exactly 14 `it(` blocks and no `.skip`/`.only`/`.todo`, so the AC1 test ran and passed. Candidate e2e: `e2e/app.spec.ts:3:1` passed in Chromium. The integration tree gave the same results. | Source read; coordinator `unit` and `e2e` (candidate and integration), `check-logs/candidate-unit.log`, `check-logs/candidate-e2e.log` | met |
| AC2 | A search of the tree (excluding `node_modules`/`dist`) finds no heading containing "Task list" in `src/`. The remaining occurrences are `index.html:6` `<title>` (out of scope), `README.md`/`CLAUDE.md` titles, historical `docs/delivery/SDLC-7/**`, and the negative test assertions. Component test `src/App.test.tsx:121` asserts that no heading of any level matches `/task list/i`. E2e `e2e/app.spec.ts:6` asserts `toHaveCount(0)` for a heading named "Task list". This is a default substring match, so the check also covers the task-title `<h2>`s. Both passed in the coordinator runs (see AC1 for the log evidence). | Source search; coordinator `unit` and `e2e` logs | met |
| AC3 | `candidate.diff` changes exactly one line of product code, `src/App.tsx:46`. The welcome section, controls, count line and `TaskList` are unchanged. Component test `src/App.test.tsx:126` pins the welcome text, the Status combobox, the unticked "Starred only" checkbox, the exact count line `Showing N of N tasks · 0 starred` and the list length. The 11 earlier `App` tests are unchanged and all passed. The rest of the e2e journey (lines 7-28: filters, star persistence across reload, starred-only, counts) is unchanged and passed in Chromium. | Diff read; coordinator `unit` and `e2e` logs | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| (none) | not run | Bash was denied for this session, so I could not run `npm ci` or `npx vitest run src/App.test.tsx`. I relied on the coordinator's checks. |

Coordinator checks (authoritative, read from `coordinator_checks.json`): lint, typecheck, unit, build and e2e all **passed** (exit 0) on the candidate `2009e68` and on the integration tree `ab4cb91`.

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | minor | I could not run the verification myself: Bash was denied in this session, so there are no worker-run tests. Every executed-test evidence item comes from the coordinator's logs. The unit log is not verbose, so the specific SDLC-12 test names do not appear in it. That they ran is inferred from the count: the log shows 14 tests in `App.test.tsx`, the file has 14 `it` blocks, and none are skipped. |
| F2 | minor | Input staging: `approved_artefacts` gives the same path (`inputs/approved/v001.md`) for both the specification and the plan. The file is the plan (`kind: plan`), so I could not read the approved specification, as the review also reported in its F1. The brief's ACs are unambiguous, so I verified against them and the plan. |
| F3 | info | `coordinator_checks.json` `log_path` values point to `<run>/logs/…`, but the logs were provided under `inputs/check-logs/`. I cited the `inputs/check-logs/` copies. |
| F4 | info | `index.html:6` still has `<title>Task list</title>`. This is correct: the brief puts the tab title out of scope. |
| F5 | info | SDLC-11 (in flight) touches `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts` from the same base `be71a8c`, and its copy still has the old heading and e2e assertion. After SDLC-12 merges, rebase SDLC-11 and confirm that `<h1>My tasks</h1>` and the three SDLC-12 tests survive conflict resolution. |

## Notes
- The candidate sits directly on base `be71a8c`, so the integration tree is expected to match the candidate's behaviour. The coordinator's integration results confirm it.
- A human may want to rerun `npx vitest run src/App.test.tsx -t "SDLC-12"` in a session where shell commands are allowed, to get worker-observed evidence that names the tests.
