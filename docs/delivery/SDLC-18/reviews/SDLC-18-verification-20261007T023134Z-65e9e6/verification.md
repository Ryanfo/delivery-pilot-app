<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-18 | kind: verification | revision: SDLC-18-verification-20261007T023134Z-65e9e6 | run: SDLC-18-verification-20261007T023134Z-65e9e6 -->
<!-- input_revision: bffd30684c3cbde8e3ba2fe60710cdf572fde521609f2edbef47177b2ff03ce6 | worker: ryan-mac -->
<!-- candidate_sha: 2a04e49986448304a3dbc9bf09c4733ea6140948 -->
<!-- base_sha: e451adbfd571a4b60f35493eae8d93fc9a973db9 -->
<!-- integration_tree: 47f8d0e048bda2296dbbdb266968bd9d40158f10 -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

Candidate `2a04e49` against specification v003 and plan v001. Unit and component tests were run
in this checkout. Browser (e2e) evidence comes from the coordinator's Playwright runs on the
candidate and on the integration tree (`check-logs/candidate-e2e.log`,
`check-logs/integration-e2e.log`: 17 passed in each).

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | Every one of the 12 tasks has a native select named "Status for <title>", with options "To do", "In progress" and "Done" in that order and the task's current status selected. The e2e run finds the control by role and name "Status for Draft onboarding checklist" with value `todo`. | `npx vitest run src/App.test.tsx` → "gives every task a status control named for the task… (SDLC-18 AC1)" passed; `src/domain/task.test.ts` "isTaskStatus accepts only…" passed; coordinator e2e `e2e/app.spec.ts:59` passed | met |
| AC2 | Changing one task's status updates its meta line text immediately; every other task's control keeps its fixture value. | "changes one task's displayed status without affecting other tasks (SDLC-18 AC2)" passed; unit "withStatuses applies overrides by ID without mutating the input" passed | met |
| AC3 | Under "All", the task keeps its position and the full results line is unchanged. `sortTasks` is untouched and `withStatuses` preserves order. | "keeps the task in place and the results line unchanged under 'All' (SDLC-18 AC3)" passed; unit "withStatuses keeps the input order" passed; e2e asserts "Showing 12 of 12 tasks" after the change | met |
| AC4 | Under a status filter, a re-statused task leaves the list at once, X drops by one while Y and the starred count stay, the empty-state message shows when nothing remains, and the task reappears under its new status. The e2e journey sees the "To do" list drop from 6 to 5. | "removes a re-statused task from a filtered list and updates the count (SDLC-18 AC4)" passed; coordinator e2e `e2e/app.spec.ts:59` passed | met |
| AC5 | Tab from the task's star button reaches its status control; real keystrokes (type-ahead "Done") change the value in Chromium. `select:focus-visible` gives a 2px accent outline, and the styling check covers the first task status control. | "changes a task's status with the keyboard (SDLC-18 AC5)" passed (focus order; jsdom cannot press keys on a native select); coordinator e2e `e2e/app.spec.ts:59` and `e2e/styling.spec.ts` AC9 passed | met |
| AC6 | After a remount/reload, changed tasks show the user's status in the meta line, the control, the status filter and the count; unchanged tasks keep their fixture status. Statuses are saved under `task-list:status:v1`. | "restores changed statuses after remount… (SDLC-18 AC6)" passed; unit "round-trips statuses with sorted keys" passed; coordinator e2e reload step ("Showing 4 of 12 tasks" under Done) passed | met |
| AC7 | Corrupt JSON, non-object data, invalid status values and unknown task IDs are ignored; a store that throws on read or write leaves the page rendered with fixture statuses and the in-session change still visible. | unit "treats corrupt storage as empty", "drops entries with an invalid status", "survives unavailable or throwing storage", "withStatuses ignores overrides for unknown task IDs" passed; "falls back to fixture statuses when stored statuses are corrupt or storage throws (SDLC-18 AC7)" passed | met |
| AC8 | Changed statuses combine correctly with Starred only, search and the status filter; the stored stars string is byte-identical after a status change. All pre-existing star/search/filter tests still pass (only their `getByLabel("Status")` locators were made exact). Each AC has a named unit/component test and the e2e journey covers change + reload. | "combines changed statuses with Starred only, search and the status filter (SDLC-18 AC8)" passed; unit "does not touch stored stars" passed; full suite 63/63 passed; coordinator e2e 17/17 passed | met |

## Deviations observed
None. The review listed no deviations and I observed none.
| ID | Criterion | Observation |
|---|---|---|

## Commands run
| Command | Result | Notes |
|---|---|---|
| `npx vitest run` | passed | 5 files, 63 tests |
| `npx vitest run --reporter=verbose src/App.test.tsx src/storage/statuses.test.ts src/domain/task.test.ts` | passed | 37 tests, including all 8 "SDLC-18 ACn" component tests and the new unit tests |
| `npm run lint` | passed | eslint, zero warnings |
| `npm run typecheck` | passed | `tsc --noEmit` |
| Playwright e2e | not run by me | Chromium cannot launch in the worker sandbox; coordinator ran it: 17 passed on candidate and on integration |

Dependencies were already installed in the checkout; `npm ci` was not needed. `git status` was clean after the runs.

## Findings
| ID | Severity | Description |
|---|---|---|

None. The review's two informational notes (type-ahead in the e2e step is Chromium-dependent; `saveStatuses` inside the state updater may run twice under StrictMode, idempotently) still apply and need no action.

## Notes
- jsdom cannot drive a native select with key presses, so the real keyboard change for AC5 rests on the Chromium e2e run.
- "Storage full" in AC7 is covered by the throwing-store tests (`setItem` throwing is how a full `localStorage` fails).
