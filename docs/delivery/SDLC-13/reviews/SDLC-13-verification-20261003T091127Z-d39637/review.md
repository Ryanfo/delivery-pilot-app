<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-13 | kind: review | revision: SDLC-13-verification-20261003T091127Z-d39637 | run: SDLC-13-verification-20261003T091127Z-d39637 -->
<!-- input_revision: 73b71a06858aad504a39416b4d5d9a33c8206c362474c7dd25f54e739f429ebb | worker: ryan-mac -->
<!-- candidate_sha: 9d2dd54eca625edfa62b48f4128021258cf994bd -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: 95a5a4d32dcb7a0e864c56ef534a0aa46a117dbf -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The domain change follows the approved plan and matches the specification: `TaskQuery.search`, the pure `matchesSearch` function, and filtering combined with AND in `filterTasks`. The unit, component and e2e tests cover AC2–AC6 with the correct fixture IDs. However, the Search control does not have a **visible, associated label**. `src/App.tsx` renders `<input id="search-filter" type="search" aria-label="Search" placeholder="Search">` with no `<label htmlFor="search-filter">`. This does not meet AC1 in the approved specification ("a text input with the visible, programmatically associated label 'Search'"), the accessibility NFR, `docs/coding-standards.md` ("every control has a visible, associated label") or plan step 3. A placeholder is not a label: it disappears as soon as the user types. The new tests assert the placeholder instead of a visible label, so they lock in the deviation. I recommend changes before acceptance. This review is a proposal, not an approval. No commands were run, and the coordinator's configured checks are the authority on lint, typecheck, unit, build and e2e.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | not met | `src/App.tsx:71-78`: the input is in the `.controls` row with Status and Starred only, starts empty, has no `autoFocus` and is reachable by Tab (tests "shows an empty 'Search' input…" and "reaches the Search input with Tab…"). Its only label is `aria-label` plus a placeholder. No visible `<label>` exists, so the "visible, programmatically associated label" part fails (F1). |
| AC2 | met | `src/domain/filter.ts` `matchesSearch` trims, lowercases and uses `includes`. Unit tests cover empty, whitespace-only, case, surrounding spaces, internal spaces ("release notes" / "releasenotes"), no match and regex characters. `filterTasks` tests check "review"/"REVIEW" → [t-002] and "re" → the six IDs, which match the fixtures. The component test types "REVIEW", "  review  " and "re" (6 items). |
| AC3 | met | Logical AND in `filterTasks`. Unit test "combines search with status and starredOnly": todo+"re" → t-003, t-007, t-009, t-011; with starred {t-003, t-001} → [t-003]. The component test checks 2 → 1 items and that the Search and Status values are kept. |
| AC4 | met | The count comes from the same `visible` array. Component test: "Showing 1 of 12 tasks · 1 starred" inside the `aria-live="polite"` paragraph. E2E checks "Showing 1 of 12 tasks". |
| AC5 | met | Component test: "releasenotes" → `role="status"` "No tasks match the current filter." and "Showing 0 of 12 tasks". E2E does the same with "zzz". |
| AC6 | met | Component test: done+"fix" → 1; `user.clear` → 3 and "Showing 3 of 12 tasks"; "   " → 3. E2E: fill "" → 3, then Status all → 12. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | blocker | `src/App.tsx:71` | The Search input has no visible, associated label. It uses `aria-label="Search"` and `placeholder="Search"` instead of `<label htmlFor="search-filter">Search</label>`, as specified in the plan (step 3 and Approach). This breaks spec AC1, the accessibility NFR and `docs/coding-standards.md`. It is also inconsistent with the Status and Starred only controls, which both use visible `<label htmlFor>`. The placeholder disappears once the user types, so sighted users lose the label. Fix: add the visible `<label htmlFor="search-filter">Search</label>` before the input and remove the `aria-label`. The placeholder is optional. |
| F2 | major | `src/App.test.tsx:49`, `e2e/app.spec.ts:16` | The new AC1 tests assert `placeholder="Search"` and find the input only by its accessible name, which `aria-label` satisfies. No test checks for a visible label, so the AC1 tests pass even though the criterion fails. Replace the placeholder assertions with a check for a visible `<label>` associated with the input, for example `getByText("Search", { selector: "label" })` with `htmlFor === "search-filter"`, or `getByLabelText("Search")` resolving through a `label` element. |
| F3 | minor | `src/App.tsx:71-78` | The plan was not followed for the control markup: the approved plan specifies `<label htmlFor>` + `<input type="search">`, and the change does not mention the deviation. The second commit ("SDLC-13: follow-up c2") does not say why it differs from the approved plan. |
| F4 | info | `src/domain/filter.test.ts` | Existing tests changed only by the mechanical `search: ""` addition (plus reformatting). No assertions were weakened, removed or skipped. |

## Scope and standards
- Scope: no scope creep. Only the title is searched, nothing is persisted, there is no highlighting and sorting is unchanged. No new dependencies.
- Architecture: follows `docs/architecture.md`. Filtering extends `TaskQuery` in `src/domain/filter.ts` (pure), and state lives in `App` inside the existing `useMemo`.
- Standards: TypeScript usage looks strict-compliant (no `any`, no non-null assertions, no suppressions). The accessibility standard is not met (F1).
- Tests: each AC maps to named tests at the unit, component and e2e levels, as the plan requires. Existing tests are not weakened (F4). The AC1 tests check the wrong property (F2).
- Security: the search text is plain text and goes through `includes`, never a RegExp. It is rendered only as a controlled input value, not as markup, and is not persisted or logged.
- Keyboard: there is no `autoFocus`, and the Tab order after Starred only is tested.

## Interactions with other in-flight work
`related_work` is empty for this run and no related tickets were reported. `TaskQuery.search` is now a required field, so any future or parallel ticket that builds a `TaskQuery` literal must supply `search`, and typecheck will flag it. Any ticket that changes the controls row, the count line or the empty-state message interacts with this change at the behaviour level, even if it touches different files. The empty related-work list does not prove independence.
