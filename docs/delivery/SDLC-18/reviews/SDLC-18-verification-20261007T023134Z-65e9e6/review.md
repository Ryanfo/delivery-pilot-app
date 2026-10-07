<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-18 | kind: review | revision: SDLC-18-verification-20261007T023134Z-65e9e6 | run: SDLC-18-verification-20261007T023134Z-65e9e6 -->
<!-- input_revision: bffd30684c3cbde8e3ba2fe60710cdf572fde521609f2edbef47177b2ff03ce6 | worker: ryan-mac -->
<!-- candidate_sha: 2a04e49986448304a3dbc9bf09c4733ea6140948 -->
<!-- base_sha: e451adbfd571a4b60f35493eae8d93fc9a973db9 -->
<!-- integration_tree: 47f8d0e048bda2296dbbdb266968bd9d40158f10 -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
Candidate `2a04e49` implements specification v003 as the approved plan v001 describes. Each task
now has a native `<select>` labelled "Status for <title>", placed after its star button. A pure
`withStatuses` function applies user-set statuses to the task list, so the displayed status, the
status filter and the results count all read the same value. A separate storage module
(`task-list:status:v1`, sorted JSON object) loads and saves those statuses through the existing
`KeyValueStore` boundary, and corrupt or unavailable storage cannot break the page. Every
acceptance criterion maps to the named tests in the plan's criterion-to-test mapping. The only
edits to existing tests make the `getByLabel("Status")` locators exact, which weakens no
assertion. I found no defects and no deviations from the specification; there are two
informational notes. I could not run commands, so the coordinator's configured checks
(lint, typecheck, unit, build, e2e) are the authority on whether the tests pass. This review is a
proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified / deviates) | Evidence |
|---|---|---|
| AC1 | met | `src/components/TaskList.tsx`: per-task `<label htmlFor="task-status-{id}">Status <span class="visually-hidden">for {title}</span></label>` + `<select>` with options from `TASK_STATUSES`/`STATUS_LABELS`, `value={task.status}`. Tests: `src/App.test.tsx` "gives every task a status control named for the task…(SDLC-18 AC1)" (all 12 tasks: name, exactly three options in order, current value, control inside its own list item); `src/domain/task.test.ts` "isTaskStatus accepts only todo, in_progress and done". |
| AC2 | met | `App.changeStatus` → new `Map` → `withStatuses` → re-render. `src/App.test.tsx` "changes one task's displayed status without affecting other tasks (SDLC-18 AC2)" checks the `.task-meta` text and that every other control keeps its fixture value; unit test "withStatuses applies overrides by ID without mutating the input". |
| AC3 | met | `sortTasks` is unchanged (priority/title/ID) and `withStatuses` keeps the input order. `src/App.test.tsx` "keeps the task in place and the results line unchanged under 'All' (SDLC-18 AC3)" compares the order and the full results line, with one task starred. |
| AC4 | met | Filtering runs on the derived `current` list; Y stays `tasks.length`. `src/App.test.tsx` "removes a re-statused task from a filtered list…(SDLC-18 AC4)" covers the task leaving the list, X dropping while Y and the starred count stay, the empty-state message, `aria-live="polite"`, and the task reappearing under its new status. The e2e journey also checks the To do count dropping from 6 to 5. |
| AC5 | met | Native select reached by Tab after the star button; `select:focus-visible` gives a 2px accent outline. Component test "changes a task's status with the keyboard (SDLC-18 AC5)" checks focus order (jsdom cannot press keys on a native select). Real keystrokes: `e2e/app.spec.ts` "changes a task's status and keeps it after a reload" (Tab, then type-ahead "Done"). Focus ring: `e2e/styling.spec.ts` AC9, extended to the first task status control. |
| AC6 | met | `useState(() => loadStatuses(store))`. Component test "restores changed statuses after remount…(SDLC-18 AC6)" checks the displayed status, the control, the filter and the count, and that unchanged tasks keep their fixture status. Unit test "round-trips statuses with sorted keys". E2E reload journey checks the control, the meta text, an unchanged task, the Done filter count (4) and "Showing 4 of 12 tasks". |
| AC7 | met | `loadStatuses` catches everything and returns an empty map for non-objects, keeping only valid statuses; `saveStatuses` returns `false` on throw or when no store is given; `withStatuses` ignores unknown IDs. Unit tests: "treats corrupt storage as empty", "drops entries with an invalid status", "survives unavailable or throwing storage", "withStatuses ignores overrides for unknown task IDs". Component test "falls back to fixture statuses…(SDLC-18 AC7)" covers corrupt JSON, invalid value, unknown ID, and a store that throws on both load and change, with the in-session change still shown. |
| AC8 | met | Component test "combines changed statuses with Starred only, search and the status filter (SDLC-18 AC8)" checks that the stored stars string is unchanged after a status change, plus the combined filters and the starred count; unit test "does not touch stored stars". Existing tests only changed `getByLabel("Status")` to `{ exact: true }`, with no assertion changes. Every AC has a named test at the levels the plan asked for. |

## Deviations from the specification
None. The commit message notes that the space before "for <title>" sits outside the visually hidden span, not inside as the plan's DOM sketch showed. The accessible name is still "Status for <title>", as AC1 requires, so behaviour does not change.

| ID | Criterion | What the code does instead | Asked for by the developer? | Proposed specification wording |
|---|---|---|---|---|

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | info | `e2e/app.spec.ts:60` | The e2e keyboard step changes the value with `page.keyboard.type("Done")`, which relies on the browser's type-ahead on a closed native select. This works in Chromium, the only project in `playwright.config.ts`. If more browsers are added later, check that this step still fires `change`, or switch to arrow keys. |
| F2 | info | `src/App.tsx:38-44` | `saveStatuses` runs inside the `setStatuses` updater, so it can run twice under StrictMode or concurrent rendering. The write is idempotent, and the existing `toggleStar` uses the same pattern, so there is no user-visible effect. Noted only for consistency if the pattern is refactored later. |

## Scope and standards
- Scope matches the plan's affected files. `src/data/tasks.ts`, `src/domain/filter.ts`, `src/storage/starred.ts` and `package.json` are unchanged; there are no new dependencies and nothing touches `.github/`, `.claude/`, `CLAUDE.md` or `docs/delivery/`.
- TypeScript: the change has no casts, `any` or suppressions; `isTaskStatus` narrows `e.target.value`, mirroring `isStatusFilter`. React keys use stable task IDs and status values.
- Domain functions are pure and unit-tested; the components stay thin. Storage errors are handled at the boundary.
- Tests: the existing e2e locators changed only to `getByLabel("Status", { exact: true })`, so they don't also match the new "Status for …" labels. Assertions are unchanged, so no test was weakened. The styling AC9, AC10 and AC11 checks were extended to the new controls, and AC11 now asserts 12 task status controls. The styling AC4 kicker count (14) uses an explicit locator list, so the new `.task-status-label` does not change it.
- Accessibility: each control has a visible "Status" label plus a visually hidden suffix that makes the name unique per task. It is a native select, so it is keyboard operable. The results `aria-live` region is unchanged and is asserted in the AC4 test. The new label uses `--muted` on paper, the same pair as `.task-meta`, and the styling AC10 contrast check now includes it.
- Security/privacy: synthetic data only, and nothing leaves the browser. Stored IDs are used only as map keys and never rendered.

## Interactions with other in-flight work
`related_work` is empty and no tickets are linked, so I found no behavioural interactions with in-flight tickets. Future work on the task list, the status filter or locators for the "Status" label should expect several "Status…" labels on the page and should use the exact-match locator. Future work on status storage should keep `task-list:starred:v1` and `task-list:status:v1` separate.
