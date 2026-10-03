<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-13 | kind: review | revision: SDLC-13-verification-20261003T093320Z-b9f87b | run: SDLC-13-verification-20261003T093320Z-b9f87b -->
<!-- input_revision: d4c5c6784bbee664ad839e5760a90e869b031811724b00abd2770a4ad2bbd394 | worker: ryan-mac -->
<!-- candidate_sha: 03eaed98fb20ed054cf6d10a563b7d252dee9659 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: b6284a8179918107b347c9ab5cd74cce054d7aa6 -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate `03eaed9` implements approved specification v002 and plan v002 for SDLC-13 faithfully and
with no scope creep. `TaskQuery` gains a required `search` field. A new pure `matchesSearch` (trim, lowercase,
`includes`) is ANDed into `filterTasks`. `App` holds the raw search string and adds a
`type="search"` input with `placeholder="Search"` and `aria-label="Search"`, and no `<label>`, last in the
controls row. The code and tests meet all six acceptance criteria. I checked every fixture-based expectation
by hand against `src/data/tasks.ts` (for example, "re" matches t-002, t-003, t-006, t-007, t-009 and t-011). I found no
blockers or major issues. The only open point is the placeholder-contrast NFR, which nothing in the
candidate verifies. This review is static: I ran no commands, and only the coordinator's lint,
typecheck, unit, build and e2e results count. The review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:71-78`: an input in `div.controls`, after Starred only, with `type="search"`, `placeholder="Search"`, `aria-label="Search"` and initial value `""`. It has no `<label>` and no `autoFocus`. Tests: `src/App.test.tsx` "shows an empty Search input with a 'Search' placeholder and no visible label…" (placeholder, aria-label, no label element, same parent as Status/Starred only, 12 items) and "reaches the Search input with Tab…" (not focused on load, Tab from Starred only, typing). The e2e test checks visibility, empty value, the placeholder and `label[for="search-filter"]` count 0. |
| AC2 | met | `src/domain/filter.ts:306-310` `matchesSearch` trims, lowercases both sides and uses `includes`, so it matches as you type with no submit step. Unit tests cover empty, whitespace-only, case, surrounding spaces, internal spaces ("release notes" vs "releasenotes"), no match and regex characters. `filterTasks` tests cover "review"/"REVIEW" → [t-002] and "re" → the six IDs. Component test covers "REVIEW", "  review  " and "re" (6). The e2e test covers "REVIEW" (1). |
| AC3 | met | `filterTasks` ANDs the status, starred and search predicates (`src/domain/filter.ts:313-321`). Unit test "combines search with status and starredOnly". Component test "combines Search with Status and Starred only, keeping each filter's value" also checks that the Search and Status values are kept. The e2e test covers in_progress + "re" (2). |
| AC4 | met | The count line uses `visible.length`, and `visible` now includes search (`src/App.tsx:30-33, 80-82`). The `aria-live` paragraph is unchanged. Component test: "Showing 1 of 12 tasks · 1 starred" plus the `aria-live="polite"` attribute. The e2e test covers "Showing 1 of 12 tasks". |
| AC5 | met | `TaskList` is unchanged and renders the `role="status"` empty state when `visible` is empty. Component test "releasenotes" checks the status message and "Showing 0 of 12 tasks". The e2e test "zzz" checks the same. |
| AC6 | met | Empty or whitespace-only search returns `true` (`matchesSearch`). Component test: done + "fix" → 1, then clear → 3 with "Showing 3 of 12 tasks", empty value and the placeholder attribute still set, then "   " → 3. The e2e test covers `fill("")` → 3 with an empty value, then "all" → 12. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | `src/App.tsx:71` | The spec's accessibility NFR says the placeholder must meet WCAG AA contrast. The app ships no CSS, so contrast depends on each browser's default placeholder colour, and no test or recorded check verifies it. Plan Risks already hands this to verification. I could not measure it in a static review. Recommend that verification measures it in the Playwright Chromium browser and that a human decides whether a placeholder colour rule is needed for other supported browsers. |
| F2 | info | `src/App.tsx:71-78` | The Search input has no visible `<label>`, which departs from `docs/coding-standards.md` line 7. Spec v002 Constraints explicitly approves this exception (review feedback F1 / note 104845). The implementation limits it to the Search input and provides an explicit `aria-label`, and Status and Starred only keep their visible labels. Not a defect. Later tickets should not treat it as a precedent. |
| F3 | info | `src/domain/filter.ts:9` | `TaskQuery.search` is now required. Any future or in-flight change that builds a `TaskQuery` literal must supply `search`, and typecheck will flag it. Callers in this candidate (`App.tsx`, `filter.test.ts`) are updated. |

## Scope and standards
- Scope: changes are limited to the five files named in the plan. Search covers titles only, with no persistence, highlighting or fuzzy/regex matching. Sorting, starring, the existing filters, their labels and the "N starred" count are unchanged. No new dependencies.
- Architecture: query logic extends `TaskQuery` in `src/domain/filter.ts` as a pure function, and state lives in `App`, per `docs/architecture.md`.
- Standards: strict TypeScript with no `any`, non-null assertions or suppressions. `matchesSearch` has the planned doc comment. React keys are unchanged.
- Tests: existing tests change only mechanically (`search: ""` added to `TaskQuery` literals, and one reformatted). No assertion is removed, weakened or skipped. Each AC maps to named unit, component and e2e tests, with SDLC-13 prefixes that keep them distinct from SDLC-10 tests.
- Security: the search text is treated as plain text via `includes` (a test covers regex metacharacters), rendered only as a controlled input value, and not persisted, logged or sent anywhere.
- Accessibility: there is an explicit accessible name, the `searchbox` role, keyboard reachability (tested), no focus stealing, and result changes announced through the existing `aria-live` line and `role="status"` message. Placeholder contrast is unverified (F1).
- Ticket note 104845 (placeholder instead of label) is already reflected in approved spec v002, and the candidate follows it.

## Interactions with other in-flight work
`related_work` is empty for this run, so no in-flight tickets were reported. That does not prove independence. Any concurrent ticket that touches filtering, the controls row or `TaskQuery` will interact with this change: it must supply the required `search` field (F3), and any new filter combines with search by AND. A ticket that adds controls to `div.controls` would also change the Tab order the AC1 Tab test relies on (Starred only → Search). This change builds on SDLC-7 and SDLC-10, already merged at `be71a8c`.
