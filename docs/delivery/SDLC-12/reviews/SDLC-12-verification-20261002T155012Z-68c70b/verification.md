<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: verification | revision: SDLC-12-verification-20261002T155012Z-68c70b | run: SDLC-12-verification-20261002T155012Z-68c70b -->
<!-- input_revision: 200038753cfef6bb0a94f933539fa28775cc01bcd4cc7edad99e2564129e22d4 | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | `src/App.tsx:46` renders `<h1>My tasks</h1>`. A search of the candidate tree (excluding `node_modules`) finds no other `<h1` in `src/`. The component test at `src/App.test.tsx:115` asserts exactly one level-1 heading, named exactly "My tasks". `e2e/app.spec.ts:5` asserts a visible level-1 heading named "My tasks" with `exact: true`. The coordinator's runs of both suites passed on the candidate and on the integration tree. | Source read and Grep for `<h1\|My tasks\|Task list`; coordinator `unit` (candidate + integration: `src/App.test.tsx` 14 tests passed, 24/24 total); coordinator `e2e` (candidate + integration: `e2e/app.spec.ts:3:1` passed) | met |
| AC2 | No heading in `src/` contains "Task list". The only remaining occurrences in shipped files are `index.html:6` `<title>Task list</title>` (the browser tab title, out of scope per the brief), plus `README.md:1` and `CLAUDE.md:1` (not page content). None of the 12 task titles in `src/data/tasks.ts` contain "task list", so the `h2` task headings can't match. `src/App.test.tsx:121` asserts that no heading matches `/task list/i`, and `e2e/app.spec.ts:6` asserts a count of 0. Playwright's default name match is a case-insensitive substring, so that negative check is broad. | Source read and Grep; coordinator `unit` and `e2e` logs (passed on candidate + integration) | met |
| AC3 | In `candidate.diff`, the only change to `src/App.tsx` is the `h1` text on line 46. The welcome section, Status select, "Starred only" checkbox, count paragraph and `TaskList` (lines 47-74) are untouched. The test file has 11 pre-existing tests (lines 13-104), all still present, plus the new AC3 test at line 126. That test pins the welcome text, the Status combobox, the unticked "Starred only" checkbox, the line `Showing 12 of 12 tasks · 0 starred` and the 12 list items. The rest of the e2e journey is unchanged. | Source read of `src/App.tsx`, `src/App.test.tsx`, `inputs/candidate.diff`; coordinator `unit` (14/14 in `App.test.tsx`) and `e2e` (passed) | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| `npm ci` | not run | Bash is denied in this session ("don't ask mode"), so I could not install dependencies. |
| `npx vitest run src/App.test.tsx` | not run | Bash is denied. I used the coordinator's `candidate-unit.log` and `integration-unit.log` instead: 3 files, 24 tests passed, 14 of them in `src/App.test.tsx`. |
| Playwright e2e | not run (by procedure) | Chromium can't launch inside the worker sandbox. `candidate-e2e.log` and `integration-e2e.log` both show `e2e/app.spec.ts:3:1` passed (1 passed). |
| Grep for `Task list\|<h1\|My tasks` across the candidate tree | passed | Matches listed under AC1 and AC2. |
| Grep for task titles in `src/data/tasks.ts` | passed | None of the 12 titles contain "task list". |

Coordinator checks (authoritative): lint, typecheck, unit, build and e2e all passed (exit 0) on candidate `2009e68b23cb` and on integration tree `ab4cb91065cc`.

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | minor | Process: I could not run any command myself because Bash was denied for this session. The unit and component evidence therefore comes from the coordinator's logs, not from my own run. The logs report only per-file test counts, not test names. That 14 tests ran in `App.test.tsx` matches the 11 existing tests plus the 3 new SDLC-12 tests in the candidate file. |
| F2 | minor | Inputs: the envelope's `approved_artefacts` entries for `specification` and `plan` both point to `inputs/approved/v001.md`, which contains the plan. I couldn't read the approved specification, as the review's F1 also found. I verified against the brief's acceptance criteria and the plan. |
| F3 | info | `index.html:6` still sets the tab title to "Task list". This is out of scope per the brief. The visible heading and the tab title now differ, so a follow-up ticket may be worth raising. |
| F4 | info | SDLC-11 is in flight with no footprint. Any SDLC-11 text or test that refers to the "Task list" heading would be stale after this change. |

## Notes
- No tracked files were edited during verification.
- I've marked the criteria met based on a direct source read plus the coordinator's passing unit and e2e runs on both trees. A reviewer may want me to rerun the component tests locally once Bash is available (F1).
