<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: review | revision: SDLC-12-verification-20261002T155537Z-d1c098 | run: SDLC-12-verification-20261002T155537Z-d1c098 -->
<!-- input_revision: ca5cb5b271961b14dfa5bc608036f4ca46bb1d98a141c41fd3943a92982948e2 | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate (`2009e68`) changes the single `<h1>` in `src/App.tsx` from "Task list" to
"My tasks", replaces the e2e heading assertion with a stricter one (`level: 1`, `exact: true`)
plus a negative check, and adds three component tests that map one-to-one to AC1–AC3. The
change matches the approved plan exactly and stays within the brief's scope (tab title,
styling and other wording untouched). On reading the code, all three acceptance criteria
appear met. This reviewer could not run commands, so test outcomes rest on the coordinator's
configured checks. One review-input defect needs a human decision: the approved
**specification** was not supplied (both `approved_artefacts` entries resolve to the same file,
which is the plan), so the change was checked against the brief and the plan only. This
review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 – main heading reads "My tasks" | met | `src/App.tsx:46` renders `<h1>My tasks</h1>`. Component test `src/App.test.tsx:115-119` asserts exactly one level-1 heading, with accessible name "My tasks" (Testing Library string match is exact by default). e2e `e2e/app.spec.ts:5` asserts it is visible with `level: 1, exact: true`. Not run by the reviewer. |
| AC2 – "Task list" no longer the page heading | met | No heading in `src/` contains "Task list". `src/App.test.tsx:121-124` checks that no heading of any level matches `/task list/i`. `e2e/app.spec.ts:6` checks that the count of such headings is 0. The remaining "Task list" occurrences are `index.html:6` `<title>` (excluded by the brief), `README.md:1` and `CLAUDE.md:1` (not page content) and historical `docs/delivery/SDLC-7/**`. Not run by the reviewer. |
| AC3 – rest of page unchanged | met | The diff touches only line 46 of `src/App.tsx`. The welcome section, controls, count paragraph and `TaskList` are byte-identical. New test `src/App.test.tsx:126-137` pins the welcome text, the Status combobox, the unticked "Starred only" checkbox, the exact count line and the list length. Existing component tests and the rest of the e2e journey are unchanged. Not run by the reviewer. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | major | inputs `approved_artefacts` | The specification and plan entries share one path (`inputs/approved/v001.md`), and that file is the plan (provenance `kind: plan`). The approved specification (commit `557002a`) was not available to the reviewer and is not in the worktree. The plan cites spec assumptions A1 (exact casing) and A3 (tab title stays), and both are consistent with the brief and the code, but no direct check against the spec was possible. This is not a code defect. Before acceptance, a human should confirm the spec adds nothing beyond the brief, or re-run the review with the spec supplied. |
| F2 | info | `src/App.test.tsx:126-137` | The AC3 test pins the exact count string `Showing N of N tasks · 0 starred` and checks for exactly one `h1` (`:117`). These are useful guards, but any in-flight ticket that changes the count wording or adds another `h1` will fail them (see SDLC-11 below). This is intended behaviour, flagged so those failures aren't read as regressions. |
| F3 | info | plan "Coordination" section | The plan says `related_work` is empty, but SDLC-11 is now in flight and touches the same three files. The plan is stale on this point. See "Interactions". |
| F4 | info | `index.html:6` | The browser tab title still reads "Task list" while the heading reads "My tasks". This is intended per the brief ("Out of scope: the browser tab title"), noted so a human reviewer isn't surprised. |

## Scope and standards
- **Scope:** only `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts` changed, which matches
  the plan's affected-files table. No styling, tab-title or other copy changes. No scope creep.
- **Tests:** no tests were weakened. The old e2e assertion (`name: "Task list"`, a case-insensitive
  substring match) was replaced by a stricter positive check (`level: 1`, `exact: true`) plus a
  negative check. The new component tests follow the existing file's style (`render(<App store={memory()} />)`,
  role-based queries).
- **Accessibility:** heading level and element are unchanged (a single `h1`), so the document
  outline is preserved. The new text gives an accessible name.
- **Security:** no new inputs, dependencies, storage or network behaviour.
- **Checks:** the reviewer ran no commands. Lint, typecheck, unit, build and e2e results come
  from the coordinator's configured checks.

## Interactions with other in-flight work
- **SDLC-11 (Plan review, title search):** its footprint lists `src/App.tsx`, `src/App.test.tsx`
  and `e2e/app.spec.ts`, all three files this ticket changes, and is based on `be71a8c`
  (before this change). Expected interactions:
  - *Textual:* SDLC-11 will add controls to `src/App.tsx` near the heading and append tests at
    the end of `describe("App")`, where SDLC-12 also appended. Merge conflicts in
    `src/App.test.tsx`, and possibly `e2e/app.spec.ts`, are likely. Its sequencing note
    (rebase onto main after SDLC-12 merges, then rerun checks) is the right mitigation.
  - *Behavioural:* after rebase, SDLC-12's AC1 test (exactly one `h1`) and AC3 test (exact
    count line, Status combobox) still hold only if SDLC-11 adds no `h1` and keeps the count
    wording. Its footprint changes neither, but that isn't proven until its implementation exists.
    A search field (role `searchbox`/`textbox`) won't collide with the `combobox` named
    "Status". If SDLC-11's own e2e or component tests were written against the pre-rebase page
    and assert the "Task list" heading, they will fail after rebase. Its footprint says its new
    tests don't assert the heading.
  - Separate file paths would not prove independence here anyway, and in this case the
    paths overlap.
