<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-11 | kind: verification | revision: SDLC-11-verification-20261002T161159Z-16fbfe | run: SDLC-11-verification-20261002T161159Z-16fbfe -->
<!-- input_revision: 0246cd31625ccfa4c2afa1e891accdeda37e89d8c1a5d52f7e7d13696890b8eb | worker: ryan-mac -->
<!-- candidate_sha: 71c5eaab5a2eb945411b9d872012340950193b46 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: 283471d6cbb7999e5dde2dad2945c8407cfb24de -->
<!-- integration_with: base only -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

Candidate: `71c5eaab5a2eb945411b9d872012340950193b46` (confirmed with `git rev-parse HEAD` in the verify checkout). Unit and component tests were run here. The e2e evidence comes from the coordinator's Playwright runs (`check-logs/candidate-e2e.log`, `check-logs/integration-e2e.log`), because Chromium cannot launch inside the worker sandbox.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | `src/App.tsx` renders `<label htmlFor="search-filter">Search</label>` and `<input id="search-filter" type="text">` inside `.controls`, after "Starred only". Observed passing: the Search input is found by role `textbox` with the name "Search", its value is empty, it shares the `.controls` container with Status, and it is the next Tab stop after "Starred only". The coordinator's e2e test locates the same input with `getByRole("textbox", { name: "Search" })`, and that test passed. | `npm run test:unit`: "shows an empty, labelled Search input in the filter controls row (search AC1)" and "reaches the Search input by keyboard after the other controls (search AC1)"; coordinator e2e "searches tasks by title alongside the other filters" | met |
| AC2 | `filterTasks` matches `(search ?? "").trim().toLowerCase()` against `task.title.toLowerCase()`. Observed passing: `"  ROTA "` → only t-004 "Update support rota"; `"draft"` matches titles only (t-001); inner spaces are kept. A component test typing `"  ROTA "` with no submit shows one item, so filtering happens as the user types. The e2e `fill("  ROTA ")` step passed on both candidate and integration. | `npm run test:unit`: filter.test.ts "matches the title case-insensitively and ignores surrounding spaces", "matches the title only, not the description", "keeps inner spaces in the search text"; App.test.tsx "filters by title as the user types… (search AC2)"; coordinator e2e | met |
| AC3 | The search clause is ANDed with the status and starred clauses. Observed passing: in_progress + starred {t-002,t-006,t-010} + "re" → t-002, t-006. In the UI, "re" + In progress → 2 items; adding a star and Starred only → 1; setting Status back to All keeps 1. The e2e step Search "  ROTA " + Status "To do" → empty, which passed. | `npm run test:unit`: "combines search with status and starredOnly", "combines Search with Status and Starred only (search AC3)"; coordinator e2e | met |
| AC4 | The count line uses `visible.length`, which now includes the search. Observed passing: the `aria-live` line reads "Showing 1 of 12 tasks · 1 starred" after starring one task and searching "rota". The e2e test asserts "Showing 1 of 12 tasks" and "Showing 0 of 12 tasks", and it passed. | `npm run test:unit`: "counts only tasks the search leaves visible… (search AC4)"; coordinator e2e | met |
| AC5 | Observed passing: searching "zzz" shows `role="status"` "No tasks match the current filter." and "Showing 0 of 12 tasks", and the combined no-match ("rota" + To do) shows the same message. The e2e test asserts the same message, and it passed. | `npm run test:unit`: "shows the existing empty message and a zero count when the search matches nothing (search AC5)"; coordinator e2e | met |
| AC6 | An empty or blank search skips the clause. Observed passing: Done + "rota" → 1, cleared → 3 ("Showing 3 of 12 tasks"), `"   "` → 3. In the domain layer, `""` and `"   "` return all tasks. The e2e test clears the search and gets 12 items, and it passed. | `npm run test:unit`: "does not filter when the search is empty or only spaces", "restores the tasks allowed by the other filters when Search is cleared or blank (search AC6)"; coordinator e2e | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| `git rev-parse HEAD` / `git status --short` (verify checkout) | passed | HEAD = 71c5eaa…; tracked tree clean before and after the runs |
| `npm ci` | passed | 247 packages added, 0 vulnerabilities |
| `npm run test:unit -- --reporter=verbose` | passed | 3 files, 34 tests passed (13 filter, 18 App, 3 storage), including all 13 new search tests. The existing Status, Starred only, sorting and persistence tests still pass |
| `npm run typecheck` | passed | `tsc --noEmit -p tsconfig.json` printed no diagnostics. The exit code was masked by a pipe, and a rerun to capture it was not permitted |
| Playwright e2e | not run | Cannot run in the sandbox. The coordinator's runs passed 2/2 on the candidate and 2/2 on the integration tree `283471d` |

Coordinator checks (authoritative): lint, typecheck, unit, build and e2e all passed on the candidate and on the integration tree (`coordinator_checks.json`).

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | minor | Both `approved_artefacts` entries (specification at commit 085a360 and plan at commit b2ff8f2) resolve to the same local file `inputs/approved/v001.md`, which contains only the plan. The approved specification itself was not available to verification, so its assumptions (A1–A6) were checked only through the plan's restatement. This repeats review F1. It is a coordinator input-staging problem, not a defect in the candidate. |
| F2 | info | SDLC-12 changes the same three files. The coordinator's integration tree `283471d` passed every check, including e2e. I did not inspect which commits that tree contains, so I can't confirm here that it includes SDLC-12's commit `2009e68`. |
| F3 | info | `toLowerCase()` is not locale-aware. This is accepted by the plan (spec A2 as restated), and the fixture data is ASCII. |

## Notes
- All six acceptance criteria were observed passing in unit and component tests run here, and in the coordinator's e2e runs on both the candidate and the integration tree.
- The scope exclusions hold: only titles are searched (a test confirms descriptions are not matched), and the search text is held only in React state.
- To make the next verification complete, the coordinator should stage the specification and the plan under different file names.
