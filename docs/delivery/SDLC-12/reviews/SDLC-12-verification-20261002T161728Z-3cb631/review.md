<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: review | revision: SDLC-12-verification-20261002T161728Z-3cb631 | run: SDLC-12-verification-20261002T161728Z-3cb631 -->
<!-- input_revision: b79c275145870b7ee38741f291a238565728a0275d7037709344bab24971c425 | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate (`2009e68`) changes one line of product code: `src/App.tsx:46`, `<h1>Task list</h1>` → `<h1>My tasks</h1>`.
It adds three component tests and makes the e2e heading assertion stricter. This matches the
approved plan exactly. All three acceptance criteria are met on code reading. I found no
blocker or major findings. One input-integrity issue needs attention: the envelope gives the
same file for the approved specification and the approved plan, and that file contains only
the plan, so I could not read the specification itself. The brief's acceptance criteria are
unambiguous, so I reviewed against them and the plan. I did not run any checks; the
coordinator's configured checks (lint, typecheck, unit, build, e2e) are authoritative. This
review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:46` renders `<h1>My tasks</h1>` as the first child of `<main>`. Component test `src/App.test.tsx:115-119` asserts exactly one level-1 heading, named "My tasks". E2e `e2e/app.spec.ts:5` asserts a visible level-1 heading "My tasks" with `exact: true`. |
| AC2 | met | No heading in `src/` contains "Task list" (searched the tree). `src/App.test.tsx:121-124` asserts no heading of any level matches `/task list/i`. `e2e/app.spec.ts:6` asserts that no heading named "Task list" exists (`toHaveCount(0)`). |
| AC3 | met | The diff to `src/App.tsx` is the single heading line; the welcome section, controls, count line and `TaskList` are byte-for-byte unchanged. `src/App.test.tsx:126-137` pins the welcome text, the Status combobox, the unticked "Starred only" checkbox, the exact count line and the list length. The existing component tests and the rest of the e2e journey are unchanged. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | envelope `approved_artefacts` | Both the `specification` and `plan` entries point to `inputs/approved/v001.md`, and that file is the plan (its provenance says `kind: plan`). I could not read the approved specification. The plan cites spec assumptions A1 (exact casing "My tasks") and A3 (tab title stays "Task list"), and I could not check those against the source. The brief's ACs and scope settle both points, so this does not change the verdict, but the coordinator should fix how it stages the inputs. |
| F2 | info | `index.html:6` | `<title>Task list</title>` is unchanged, so the tab title and the page heading now differ. The brief explicitly puts the tab title out of scope, so this is correct. Noting it so product can decide whether to raise a follow-up. |
| F3 | info | `src/App.test.tsx:131-133` | The AC3 test matches the whole count line exactly (`Showing N of N tasks · 0 starred`). That is a good guard for "unchanged", but any later ticket that changes the count wording will break this test on purpose. See SDLC-11 below. |
| F4 | info | approved plan, "Coordination" | The plan says `related_work` is empty. SDLC-11 is now in flight and touches the same three files. See the interactions section. |

## Scope and standards
- **Scope:** No scope creep. Only the planned files changed (`src/App.tsx`, `src/App.test.tsx`,
  `e2e/app.spec.ts`). `index.html`, `README.md`, `CLAUDE.md` and styling are untouched, as the plan says.
- **Tests weakened:** None. The old e2e assertion (case-insensitive substring match on "Task list") is
  replaced by a stricter one (`level: 1`, `exact: true`) plus a negative check. No existing test
  was removed or loosened.
- **Standards:** The new tests follow the file's existing style: `render(<App store={memory()} />)`,
  role-based queries and `within` on the "Tasks" list.
- **Accessibility:** The page still has exactly one `<h1>`, at the top of `<main>`. The new component test now enforces this.
- **Security:** Static text change only; no security impact.

## Interactions with other in-flight work
**SDLC-11** (title search; status "Changes requested") changes `src/App.tsx`, `src/App.test.tsx` and
`e2e/app.spec.ts`, plus `src/domain/filter.ts`. Its branch is based on `be71a8c`, the same base as
this candidate, so it still contains `<h1>Task list</h1>` and the old e2e heading assertion.
Separate file paths would not prove independence anyway. Here the paths overlap, and there are
behavioural interactions:
- **Heading revert during conflict resolution:** If SDLC-11 is rebased or merged after SDLC-12 and
  someone resolves the `src/App.tsx` conflict by taking SDLC-11's side, the heading goes back to
  "Task list". The new SDLC-12 AC1/AC2 component tests and the e2e checks would catch this, provided
  they survive the same conflict resolution in `src/App.test.tsx` and `e2e/app.spec.ts`.
- **Old e2e assertion:** SDLC-11's copy of `e2e/app.spec.ts` line 5 still asserts a heading named
  "Task list". If it survives a merge, e2e fails against the new heading.
- **AC3 pinning test:** SDLC-11 adds a search control to the controls area. The SDLC-12 AC3 test does
  not assert that other controls are absent, so a new search input will not break it. If SDLC-11
  changes the count-line wording, the exact match in `src/App.test.tsx:131-133` fails (F3).
  SDLC-11 should then update that assertion on purpose, not delete it.
- **Sequencing:** SDLC-11's footprint already says to rebase `feature/SDLC-11` onto `main` after
  SDLC-12 merges and rerun all checks. I agree; after the rebase, check that `src/App.tsx` reads
  `<h1>My tasks</h1>` and that all three SDLC-12 tests are still present.
