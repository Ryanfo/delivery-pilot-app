<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-11 | kind: verification | revision: SDLC-11-verification-20261002T160214Z-6cb486 | run: SDLC-11-verification-20261002T160214Z-6cb486 -->
<!-- input_revision: b44442ee152dca43f8ae5124dfb0cc9bf81d623bc0b352080bd63a6458b7d541 | worker: ryan-mac -->
<!-- candidate_sha: 71c5eaab5a2eb945411b9d872012340950193b46 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: 283471d6cbb7999e5dde2dad2945c8407cfb24de -->
<!-- integration_with: base only -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | A `<label htmlFor="search-filter">Search</label>` and an `<input id="search-filter" type="text">` sit in the same `.controls` row as Status and "Starred only" (`src/App.tsx`). The component tests found a `textbox` named "Search" with an empty value, in the same `.controls` element as Status, and reached it with Tab from "Starred only". Both passed. The e2e test also finds `getByRole("textbox", { name: "Search" })`, and it passed on both trees. | `npm run test:unit` ("…labelled Search input in the filter controls row (search AC1)", "reaches the Search input by keyboard… (search AC1)"). Coordinator e2e: `e2e/app.spec.ts:30` | met |
| AC2 | `filterTasks` trims and lower-cases the search text, then checks whether the lower-cased title contains it. Unit tests passed for: `"  ROTA "` → `t-004` only; title only (searching "draft" does not match on descriptions); inner spaces kept. The component test typed `"  ROTA "` without submitting and got 1 item, "Update support rota". The e2e test filled `"  ROTA "` and got 1 item, and passed on both trees. | `npm run test:unit` (filter.test.ts search cases; App "filters by title as the user types… (search AC2)"). Coordinator e2e | met |
| AC3 | The search clause is ANDed with the status and starred clauses. The unit test with `in_progress` + starredOnly + "re" returned `t-002` and `t-006` only, and the input was not mutated. The component test with "re" + "In progress" returned 2 tasks, and adding star + Starred only returned 1. The e2e test with "ROTA" + "To do" showed 0 tasks. All passed. | `npm run test:unit` ("combines search with status and starredOnly", "combines Search with Status and Starred only (search AC3)"). Coordinator e2e | met |
| AC4 | The count line uses `visible.length`, which now includes the search. The component test showed "Showing 1 of 12 tasks · 1 starred" after searching "rota". The e2e test checked "Showing 1 of 12 tasks" and "Showing 0 of 12 tasks". All passed. | `npm run test:unit` ("counts only tasks the search leaves visible… (search AC4)"). Coordinator e2e | met |
| AC5 | Searching "zzz" showed `role="status"` "No tasks match the current filter." and "Showing 0 of 12 tasks". A combined no-match ("rota" + "To do") showed the same message. The e2e test checked the same `role="status"` text. All passed. | `npm run test:unit` ("shows the existing empty message… (search AC5)"). Coordinator e2e | met |
| AC6 | An empty or blank search does not filter (unit test). In the component test, with Status "Done" + "rota" (1 item), clearing the search gave 3 items and "Showing 3 of 12 tasks", and typing `"   "` still gave 3. The e2e test cleared the search and got 12 items. All passed. | `npm run test:unit` ("does not filter when the search is empty or only spaces", "restores the tasks… (search AC6)"). Coordinator e2e | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| `git rev-parse HEAD` | passed | `71c5eaab5a2eb945411b9d872012340950193b46`, which matches `candidate_sha`. |
| `npm ci` | passed | Installed from the lockfile, 0 vulnerabilities. |
| `npm run test:unit -- --reporter=verbose` | passed | 3 files, 34/34 tests, including all 6 new filter unit tests and all 7 new search component tests. |
| `npm run typecheck` | passed | `tsc --noEmit` exited cleanly. |
| `npm run lint` | passed | `eslint . --max-warnings 0` exited cleanly. |
| `git status --porcelain` | passed | No tracked changes after the run. |
| Coordinator `e2e` (candidate and integration `283471d6`) | passed (coordinator) | I did not run this (Chromium is unavailable in the sandbox). The coordinator logs show 2/2 passed on both trees, including "searches tasks by title alongside the other filters" (`e2e/app.spec.ts:30`). |
| Coordinator lint/typecheck/unit/build (candidate and integration) | passed (coordinator) | From `coordinator_checks.json`. Unit was 34/34 on both trees. |

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | major | Input problem, not a code defect. In the envelope, `approved_artefacts` lists "specification" (commit `085a3605`) and "plan" (commit `b2ff8f24`) with the same path, `inputs/approved/v001.md`, and that file is the plan. I never received the approved specification. This review reported the same problem (its F1). I checked against the ticket's ACs directly. I could not check the spec's assumptions A1–A6, as cited by the plan, against their source. |
| F2 | minor | The last step of the component test "combines Search with Status and Starred only (search AC3)" (Status "All" → 1 item) cannot catch the search clause being dropped, because only one task is starred. AC3 is still covered by the unit test and the e2e test (the review's F2). |
| F3 | minor | SDLC-12 (status "Changes requested") edits `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts`, the same files this candidate changes. Today's integration tree passed all checks. Whichever ticket merges second should rebase and rerun all checks. |

## Notes
- No defects in the implementation were observed. All six ACs are met on the evidence above.
- The design choices that come from the specification (`type="text"` rather than `type="search"`, plain `toLowerCase()` with no locale folding) are consistent with the ticket wording. They could not be checked against the specification itself (F1).
- Scope: descriptions are not searched, the search is not persisted (React state only), and matched text is not highlighted. This matches the ticket's out-of-scope list.
