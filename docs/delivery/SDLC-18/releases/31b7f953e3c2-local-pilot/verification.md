<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-18 | kind: release_verification | revision: 31b7f953e3c2-local-pilot | run: SDLC-18-release_verification-20261007T194917Z-72b1a4 -->
<!-- input_revision: 8a8296a51d6c1cd31fc884c214cbb4c9e132492de537a587368467773c6056ef | worker: ryan-mac -->
<!-- released_commit: 31b7f953e3c2a05afc1e68987108c5c193343e5c -->

# Release verification

> Provenance (ticket, release record, released commit, provenance chain) is added by the coordinator.

## Release record
- Released commit: `31b7f953e3c2a05afc1e68987108c5c193343e5c` (merge commit of PR #10, merged by Ryanfo at 2026-10-07T18:28:13Z, strategy "merge commit").
- Environment profile: `local-pilot`.
- Provenance (from `release_record.json`, source `github`): the PR head was `2a04e49986448304a3dbc9bf09c4733ea6140948`, which is the accepted candidate in release proposal v001. The coordinator recorded `merged_tree_matches_candidate: true` and `released_equals_merge: true`.
- Observed in this session: the working copy is at `31b7f95` with a clean tree, and `git diff 2a04e49 31b7f95` is empty, so the released tree is byte-identical to the reviewed candidate.
- Coordinator checks on the released commit (`coordinator_checks.json`): only `setup` (`npm ci`, exit 0, 247 packages, 0 vulnerabilities; `check-logs/release-setup.log`). The inputs contain **no e2e (Playwright) result** for the released commit. See F1.

## Smoke evidence
Run on the released commit with the reserved ports (app 56489, e2e 56490).

| Step | Observation | Status |
|---|---|---|
| 1. `npm ci`, `npm run build` | `npm ci` passed in the coordinator's `setup` check. `npm run build` (tsc + vite build) exited 0 and produced `dist/index.html`, `dist/assets/index-CDW239eD.js` (225.70 kB) and `index-KUXLR7R9.css`. The bundle contains the storage keys `task-list:status:v1` and `task-list:starred:v1`. | Passed |
| 2. Start the app on the reserved port | `npm run preview` started and reported `http://127.0.0.1:56489/`. The session could not make HTTP requests to it (`curl` was denied), so the served page was not observed. | Partly observed |
| 3. 12 tasks; each has a Status control; "Draft onboarding checklist" shows "To do" and its control offers exactly the 3 statuses | No browser was available. The component test "gives every task a status control named for the task, offering the three statuses with the current one selected (SDLC-18 AC1)" passed in jsdom. The source has a `<select>` with the label "Status for {title}" (`src/components/TaskList.tsx:37-52`). | Not checked in a browser; covered by a component test |
| 4–5. Filter "To do"; change a task to "Done"; it leaves the list and the count drops | Component test "removes a re-statused task from a filtered list and updates the count (SDLC-18 AC4)" passed. | Not checked in a browser; covered by a component test |
| 6–7. Filter "Done" shows the task; "All" keeps its position and other statuses | Component tests for SDLC-18 AC2, AC3 and AC4 passed. | Not checked in a browser; covered by a component test |
| 8. Keyboard: Tab to the control, focus ring, change the value | Component test "changes a task's status with the keyboard (SDLC-18 AC5)" passed. `src/styles.css:237-241` sets a 2px `var(--accent)` outline on `select:focus-visible`. The focus ring was not seen in a rendered page. | Not checked in a browser; partly covered by a component test |
| 9. Reload keeps changed statuses | Component test "restores changed statuses after remount… (SDLC-18 AC6)" and the `status storage` round-trip unit tests passed. | Not checked in a browser; covered by tests |
| 10. Stars survive alongside statuses; "Starred only" and search unchanged | Component test SDLC-18 AC8, the existing star, "Starred only" and search tests, and the unit test "does not touch stored stars" passed. | Not checked in a browser; covered by tests |
| 11. Corrupt or invalid `task-list:status:v1` | Component test SDLC-18 AC7 and the unit tests "treats corrupt storage as empty", "drops entries with an invalid status" and "withStatuses ignores overrides for unknown task IDs" passed. | Not checked in a browser; covered by tests |
| 12. `npm run test:unit` / `npm run test:e2e` | `npm run test:unit`: 5 files, 63 tests passed. `npm run lint` also passed. E2E: Chromium cannot run in the worker sandbox, and the coordinator supplied no e2e result for this commit. | Unit passed; e2e has no evidence |

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | major | The coordinator supplied no browser (Playwright) e2e result for the released commit: `coordinator_checks.json` has only `setup`. Smoke steps 2–11 were not observed in a real browser. They are covered only by jsdom component tests and unit tests, which all passed on the released commit. The released tree is identical to the accepted candidate `2a04e49`. Run `npm run test:e2e` on `31b7f95`, or do steps 2–11 by hand in a browser, before treating the release as fully verified. No smoke step failed. |
| F2 | info | The preview server started for step 2 (`vite preview` on 127.0.0.1:56489) could not be stopped from the sandbox (`pkill` cannot list processes). It is still running as background task `bci13di5d` and should be stopped by the developer. |
