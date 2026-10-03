<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-13 | kind: review | revision: SDLC-13-verification-20261003T085159Z-5c5791 | run: SDLC-13-verification-20261003T085159Z-5c5791 -->
<!-- input_revision: 5a9715d91f0cdb46ad2f3371c625c33b23f2e1c974f003de294aa9619523483f | worker: ryan-mac -->
<!-- candidate_sha: bcc5ae8583a1d3f22e64be0589e0ea888713e243 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: 654c0de74c325b9e3e7fa226e4bd356d3f0031bd -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate at `bcc5ae8` implements the approved specification v001 and plan v001 closely.
`TaskQuery` in `src/domain/filter.ts` gains a required `search` field and a pure exported
`matchesSearch` (trim, `toLowerCase`, `includes`). `filterTasks` ANDs it with the existing
predicates. `App` holds the raw search string in state and adds a labelled `type="search"` input
as the last control in the existing `.controls` row. The count line, its `aria-live` region and
`TaskList` are unchanged, so the count and empty state come from the same `visible` array. Each
acceptance criterion has named unit, component and e2e tests. I checked every expected ID and
count in the tests by hand against `src/data/tasks.ts`, and they are correct. I found no blockers
or major issues. There are two minor test gaps and one informational note. I could not run
commands, so whether the checks pass rests on the coordinator's configured checks (lint,
typecheck, unit, build, e2e). This review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:71-72`: `<label htmlFor="search-filter">Search</label>` + `<input id="search-filter" type="search">`, inside the same `.controls` div as Status and Starred only, initial value `""`, no `autoFocus`. Tests: `src/App.test.tsx` "shows an empty 'Search' input in the controls with the other filters (SDLC-13 AC1)" (same parent, empty, 12 items) and "reaches the Search input with Tab and types into it (SDLC-13 AC1)" (not focused on load, Tab from Starred only, typing works). e2e checks visible and empty. |
| AC2 | met | `matchesSearch` (`src/domain/filter.ts:15-19`) trims only the ends, lowercases both sides, uses `includes` (no regex). `onChange` updates state on every keystroke, no debounce. Unit tests cover empty, whitespace-only, case, surrounding spaces, internal spaces ("release notes" vs "releasenotes"), no match and regex characters. The `filterTasks` "re" test asserts the six fixture IDs t-002, t-003, t-006, t-007, t-009, t-011, which I confirmed against the fixtures. The component test covers "REVIEW", "  review  " and "re" giving 6. |
| AC3 | met | Predicate ANDs status, starredOnly and search (`src/domain/filter.ts:25-27`). Unit "combines search with status and starredOnly": "re"+todo → t-003, t-007, t-009, t-011, then starred {t-003, t-001} → [t-003] (correct). Component test: "re"+in_progress → 2 (t-002, t-006), +Starred only → "Review quarterly roadmap", and the Search and Status values are kept. e2e: in_progress+"re" → 2. |
| AC4 | met | The count line `Showing {visible.length} of {tasks.length} tasks · {starred.size} starred` is unchanged, and `visible` now includes search. Component test "counts only the tasks the search leaves visible (SDLC-13 AC4)" stars a task that does not match ("Draft onboarding checklist"), searches "review" and expects "Showing 1 of 12 tasks · 1 starred" on the `aria-live="polite"` element. This also confirms that N counts all starred tasks. e2e asserts "Showing 1 of 12 tasks". |
| AC5 | met | `TaskList` renders the existing `role="status"` message when `visible` is empty. Component test: "releasenotes" → status message and "Showing 0 of 12 tasks". e2e: "zzz" → same. The combined-filter zero-result case is not tested directly (see F2). |
| AC6 | met | An empty or whitespace-only search returns `true` from `matchesSearch`. Component test: done+"fix" → 1, `user.clear` → 3 and "Showing 3 of 12 tasks", then "   " → 3. e2e: `fill("")` with in_progress → 3, then all → 12. The native clear button is not exercised, but it goes through the same `onChange` (plan risk table). |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | `src/domain/filter.test.ts` | No test guards the exclusion "searching task descriptions is out of scope". The fixtures allow a cheap negative check: "draft" appears in the title of t-001 and in the description of t-002, and "comments" appears only in the description of t-002. A test such as `filterTasks(..., search: "draft")` → `["t-001"]` would catch a later regression that searches descriptions. |
| F2 | minor | `src/App.test.tsx`, `e2e/app.spec.ts` | Spec AC5 covers a search "alone or combined with other filters" that matches nothing, but every zero-result test uses search alone ("releasenotes", "zzz"). The logic is shared, so the risk is low. One combined case (for example status `done` + "review") would close the gap. |
| F3 | info | `src/App.test.tsx` AC2 test | "Updates as they type" is shown through `user.type` keystroke by keystroke and checked on the final state only. No test checks an intermediate state, but no debounce exists in the code (`src/App.tsx:72`), so the behaviour is clear from inspection. |

## Scope and standards
- **Scope:** Only the five files named in the plan changed. There is no persistence, no
  highlighting and no description search. The sort, the Starred only and Status behaviour, the
  count line and `TaskList` are unchanged. I found no scope creep.
- **Architecture:** The filtering extends `TaskQuery` in the pure domain layer, as
  `docs/architecture.md` requires. State lives in `App`, and the derived list stays in the
  existing `useMemo` with `search` added to its dependencies.
- **Standards:** There are no `any` types, no non-null assertions and no suppressions. The
  domain function is small and named, and it has a doc comment. There are no new dependencies.
- **Tests weakened:** None. The existing `filterTasks` tests changed only by the mechanical
  `search: ""` addition, and some were rewrapped. Their assertions are identical. The existing
  e2e test is unchanged. New test names carry the "SDLC-13" prefix, so they are distinct from the
  SDLC-10 AC tests.
- **Accessibility:** The input has a visible label associated through `for`/`id`, and its role is
  `searchbox`. It is reachable by keyboard after Starred only, so the existing Tab order is kept.
  It has no autofocus. Changes are announced through the existing `aria-live` count line and the
  `role="status"` empty state.
- **Security:** The search text is plain text matched with `includes` and is never used as a
  RegExp. A unit test covers `"("` and `".*"`. The text is rendered only as a controlled input
  value. It is not persisted, logged or sent anywhere.

## Interactions with other in-flight work
`related_work` is empty for this run, so no in-flight tickets are reported. File-path separation
would not prove independence in any case. The behavioural point for future work is that
`TaskQuery.search` is now **required**. Any ticket in flight or to come that builds a `TaskQuery`
literal or calls `filterTasks` (for example a new filter, or a persisted-filters feature) must
supply `search`, or the typecheck will fail. Any feature that persists or restores filter state
must also decide whether search is excluded, since remembering the search is out of scope here.
SDLC-7 and SDLC-10 are already merged at the base `be71a8c`, and this change keeps their behaviour.
