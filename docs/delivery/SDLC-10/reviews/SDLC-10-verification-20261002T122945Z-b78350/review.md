<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-10 | kind: review | revision: SDLC-10-verification-20261002T122945Z-b78350 | run: SDLC-10-verification-20261002T122945Z-b78350 -->
<!-- input_revision: 068d44dc1dd3106b4d640cd0ea351f34df4eef4f544ea636be32a46ed161b522 | worker: ryan-mac -->
<!-- candidate_sha: fd5338eabb45db7e960655cb4b1c2df8ce90b964 -->
<!-- base_sha: 15865a54b0593b1de41bd722819801325e49a118 -->
<!-- integration_tree: 41a2b51c096cc96cde81f8802f05991f85ec3caa -->
<!-- integration_with: base only -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate implements the "Starred only" filter exactly along the lines of the approved
plan: `TaskQuery` gains `starredOnly`/`starredIds`, `filterTasks` ANDs the new predicate with
the existing status predicate, and `App.tsx` wires a native checkbox into the existing
`.controls` block with no new CSS or dependencies. The diff touches only the five files the
plan named, and unit, component and e2e tests are added for every criterion including
combined filtering, immediate reactivity on unstar, the empty-state message, the count line
and keyboard operation. I could not independently confirm the "specification" artefact listed
in the inputs (see Findings) and, per the contract, could not run the configured checks
myself — both are called out below. This is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:63-69` renders `<label htmlFor="starred-only-filter">Starred only</label>` paired with the checkbox, `useState(false)` default; `src/App.test.tsx:49-54` asserts it is present, labelled "Starred only" via accessible name, and unticked by default. |
| AC2 | met | `src/domain/filter.ts:14-19` ANDs `!query.starredOnly \|\| query.starredIds.has(task.id)`; pure-function case in `src/domain/filter.test.ts` ("filters to starred tasks only...") and component case in `src/App.test.tsx:56-64` (ticking narrows to the one starred task). |
| AC3 | met | Same predicate combines both conditions with `&&`; `src/domain/filter.test.ts` ("combines status and starredOnly filters") and `src/App.test.tsx:66-76` (status "in_progress" + starred-only narrows to one matching task) both exercise the AND. |
| AC4 | met | `src/App.tsx:29-32` includes `starred` in the `useMemo` dependency array, so unstarring updates `visible` immediately; `src/App.test.tsx:78-86` ticks the filter, unstars the only visible task, and asserts the empty-state message appears without any other interaction. |
| AC5 | met | `TaskList.tsx:10-12` (unchanged) renders `role="status"` "No tasks match the current filter." whenever the filtered list is empty; `src/App.test.tsx:88-93` ticks the filter with no starred tasks and asserts this message. |
| AC6 | met | The `Showing {visible.length} of {tasks.length} tasks` line (`src/App.tsx:71-73`, unchanged) derives from the same `visible` list the combined filter produces; `src/App.test.tsx:95-102` asserts the count reflects two starred tasks while the total stays at `TASKS.length`. |
| AC7 | unverified | Keyboard operability itself is met: the control is a native `<input type="checkbox">` (always Tab/Space operable) and `src/App.test.tsx:104-113` confirms focus + Space toggles it both ways. The second half of this criterion — "all checks pass (lint, typecheck, unit, build, e2e)" — cannot be confirmed by a reviewer who cannot run commands; I did not execute any of `configured_checks` myself, so I report this half as unverified rather than claim a result I didn't see. The coordinator's own check run is authoritative here. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | `approved_artefacts` (envelope) | Both the `specification` and `plan` entries in `approved_artefacts` resolve to the same local file (`inputs/approved/v001.md`), and that file's content is the plan, not a specification. I could not independently read the approved specification text; this review relies on the brief's acceptance criteria plus the plan. Code/test conformance to the plan is confirmed; conformance to the specification's wording, if it differs, is unverified. Worth the coordinator checking the artefact-staging step that populates `approved_artefacts`. |

No defects, missing-test gaps, scope creep, standards violations, security issues or test
weakening were found in the diff itself.

## Scope and standards
- **Scope**: the diff touches exactly the five files the plan named (`src/domain/filter.ts`,
  `src/domain/filter.test.ts`, `src/App.tsx`, `src/App.test.tsx`, `e2e/app.spec.ts`). No
  storage, starring-behaviour, or unrelated-component changes. No new runtime or dev
  dependencies were added (`package.json` is unchanged).
- **Persistence (explicit exclusion)**: `starredOnly` is local `useState`, not written through
  `src/storage/starred.ts`, so the checkbox correctly does not persist across reloads, matching
  the brief's exclusion ("remembering the checkbox between visits" is out of scope). The e2e
  test unticks it and returns to `status: all` rather than asserting persistence, consistent
  with this.
- **Tests weakened**: none. The three pre-existing `filter.test.ts` cases were extended with
  the two new required `TaskQuery` fields (same assertions, same behaviour), not loosened.
- **Accessibility**: the checkbox uses the same `label[htmlFor]`/`id` pairing already used for
  the status `<select>`, giving it a correct accessible name picked up by
  `getByRole("checkbox", { name: "Starred only" })` and `page.getByLabel("Starred only")` in
  the tests. It is a native control, so standard keyboard semantics apply without extra
  handling, as the plan anticipated.
- **Security**: no new I/O, no new dependencies, no user-controlled strings rendered unescaped;
  `starredIds` is read-only `Set` membership testing. No concerns.
- **Standards**: `filter.ts` stays a pure function (no mutation of `tasks`/`starredIds`,
  confirmed by the "without mutating input" tests), keeping `src/domain/` free of I/O per the
  plan's stated architecture constraint.

## Interactions with other in-flight work
`related_work` is empty in this run's inputs, and the plan's own coordination section states no
other in-flight ticket's footprint overlaps `src/domain/filter.ts`, `src/App.tsx`, their tests,
or `e2e/app.spec.ts`. I have no visibility into tickets outside `related_work`, so this is only
as strong as that list — it is not independently derivable from the diff, and non-overlapping
file paths alone would not prove independence even if other tickets existed. One pre-existing,
unrelated element is visible in `src/App.tsx` — the `<section aria-label="Welcome">HELLO
WORLD</section>` block from ticket SDLC-7 — but this candidate does not touch it and it does
not interact with the new filter.
