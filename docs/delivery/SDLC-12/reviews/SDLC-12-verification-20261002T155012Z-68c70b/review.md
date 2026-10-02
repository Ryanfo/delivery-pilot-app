<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: review | revision: SDLC-12-verification-20261002T155012Z-68c70b | run: SDLC-12-verification-20261002T155012Z-68c70b -->
<!-- input_revision: 200038753cfef6bb0a94f933539fa28775cc01bcd4cc7edad99e2564129e22d4 | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate (`2009e68b23cb`) changes the single `<h1>` in `src/App.tsx` from "Task list" to
"My tasks" and nothing else in the component. It adds three component tests and tightens the
e2e heading assertion, as the approved plan v001 describes. From the code and tests, all three
acceptance criteria appear to be met. No blocker or major findings. One input problem: the
envelope's `approved_artefacts` entry for the specification points at the same file as the plan,
so I could not read the approved specification (referenced assumptions A1 and A3). This review is
based on the brief's criteria and the plan. I did not run any checks; the coordinator's configured
checks (lint, typecheck, unit, build, e2e) are authoritative. This review is a proposal, not an
approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:46` renders `<h1>My tasks</h1>`, the only `h1` in `src/` (`TaskList.tsx` uses `h2` for task titles). Pinned by `src/App.test.tsx:115-119` (exactly one level-1 heading; RTL string name match is exact by default) and `e2e/app.spec.ts:5` (`level: 1`, `exact: true`, visible). |
| AC2 | met | No heading in `src/` contains "Task list". `src/App.test.tsx:121-124` asserts no heading matches `/task list/i`, and none of the 12 task titles in `src/data/tasks.ts` match that pattern. `e2e/app.spec.ts:6` asserts a count of 0 for a "Task list" heading. `index.html:6` `<title>Task list</title>` is the browser tab title, which the brief puts out of scope, not the page heading. |
| AC3 | met | The diff to `src/App.tsx` is one line (the `h1` text). The welcome section, controls, count line and `TaskList` are unchanged. Pinned by the new `src/App.test.tsx:126-137` (welcome text, Status combobox, unticked "Starred only", `Showing 12 of 12 tasks · 0 starred`, 12 list items), the unchanged existing component tests and the unchanged remainder of the e2e journey. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | envelope `approved_artefacts` | The `specification` and `plan` entries both have the path `inputs/approved/v001.md`, and that file contains the plan (provenance `kind: plan`). The approved specification text was not available, and `docs/delivery/SDLC-12/` is not in the candidate tree. I could not check the plan's references to spec assumptions A1 (exact casing "My tasks") and A3 (tab title stays "Task list") against the specification. The brief's ACs and out-of-scope list agree with them. The coordinator should fix how it stages artefacts. |
| F2 | info | `index.html:6`, `README.md:1`, `CLAUDE.md:1` | "Task list" still appears as the browser tab title and the project name. This is correct per the brief ("Out of scope: the browser tab title… any other wording"). Product may want a follow-up ticket to align the tab title with the new heading. |
| F3 | info | `src/App.test.tsx:123` | The AC2 regex `/task list/i` is a case-insensitive substring match across all headings, including task-title `h2`s. It is correct today, but if a future task title contained "task list", this test would fail even though the page heading is correct. Low risk; no change needed. |
| F4 | info | related work: SDLC-11 | SDLC-11 is in flight ("Specification review") with no footprint yet, so I cannot rule out a behavioural interaction. The plan's Coordination section says `related_work` was empty at planning time; it is no longer empty. See below. |

## Scope and standards
- Scope: limited to the heading text in `src/App.tsx` plus tests in `src/App.test.tsx` and
  `e2e/app.spec.ts`, exactly the files and changes the plan lists. No styling, tab-title,
  dependency or interface changes. No scope creep.
- Tests weakened: none. No existing test or assertion was removed. The only changed e2e line
  replaced a loose "Task list" heading check with a stricter `level: 1, exact: true` check plus a
  negative assertion.
- Standards: the new tests follow the existing file's style (`render(<App store={memory()} />)`,
  role-based queries, `within`). The test names include the ticket key and criterion, which
  matches the prior pattern of AC-tagged names.
- Accessibility: the page keeps a single `h1` with a meaningful name, and the heading hierarchy
  (`h1` → task `h2`) is unchanged. The tab title ("Task list") and visible heading ("My tasks") now
  differ. That is acceptable and intended by the brief, but see F2.
- Security: not applicable (static text change).

## Interactions with other in-flight work
- **SDLC-11** (Specification review, assignee Ryan O'Connor): no footprint or brief was provided,
  so its scope is unknown. Every recent page-level ticket (SDLC-7, SDLC-10, and this one) touched
  `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts`. If SDLC-11 is page-level, expect textual
  conflicts in those files. Behaviourally, any SDLC-11 test or spec text that refers to the
  "Task list" heading, for example as a positional anchor like SDLC-7's "directly below the 'Task
  list' heading", would be wrong after this change, and the new SDLC-12 tests (single `h1` named
  "My tasks"; no heading matching `/task list/i`) would fail if SDLC-11 adds another `h1` or a
  heading containing "task list". SDLC-11's refinement and planning should be told the heading is
  now "My tasks". The absence of a footprint does not show the two tickets are independent.
