<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-13 | kind: verification | revision: SDLC-13-verification-20261003T091127Z-d39637 | run: SDLC-13-verification-20261003T091127Z-d39637 -->
<!-- input_revision: 73b71a06858aad504a39416b4d5d9a33c8206c362474c7dd25f54e739f429ebb | worker: ryan-mac -->
<!-- candidate_sha: 9d2dd54eca625edfa62b48f4128021258cf994bd -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: 95a5a4d32dcb7a0e864c56ef534a0aa46a117dbf -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

Candidate `9d2dd54` checked against the approved specification v001. AC2 to AC6 are met, with observed evidence. **AC1 is not met**: the Search input has no visible, programmatically associated label.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | The input `#search-filter` (`type="search"`) is in the `.controls` div with Status and Starred only. It starts empty, shows all 12 tasks, has no `autoFocus`, and Tab from Starred only reaches it. **But** its only label is `aria-label="Search"` plus `placeholder="Search"`. No `<label htmlFor="search-filter">` exists anywhere in `src/` or `e2e/`; only Status (`App.tsx:50`) and Starred only (`App.tsx:64`) have `<label>` elements. The placeholder disappears when the user types, so there is no visible label as spec AC1 and the accessibility NFR require. The AC1 tests pass because they match on accessible name and placeholder, not on a visible label. | `npx vitest run -t "SDLC-13"` (2 AC1 tests pass); search for `search-filter\|<label` in `src`, `e2e`; read `src/App.tsx:71-78` | not_met |
| AC2 | `matchesSearch` trims, lowercases and uses `String.includes`. Domain tests pass for empty, whitespace-only, case, surrounding spaces, internal spaces literal, no match and regex characters. Component test: "REVIEW" and "  review  " → only "Review quarterly roadmap"; "re" → 6 items. Coordinator e2e: "REVIEW" → 1 item. | `npx vitest run src/domain/filter.test.ts` (17/17); `npx vitest run -t "SDLC-13"`; coordinator `candidate-e2e.log` | met |
| AC3 | `filterTasks` combines status, starredOnly and search with AND. Domain test "combines search with status and starredOnly" passes. Component test: "re" + In progress → 2, + Starred only → 1 ("Review quarterly roadmap"), with the Search and Status values kept. Coordinator e2e: In progress + "re" → 2. | as above | met |
| AC4 | The count is `visible.length` of `tasks.length`. Component test: "Showing 1 of 12 tasks · 1 starred" in the `aria-live="polite"` paragraph. Coordinator e2e: "Showing 1 of 12 tasks". | `npx vitest run -t "SDLC-13"`; `candidate-e2e.log` | met |
| AC5 | Component test: "releasenotes" → `role="status"` "No tasks match the current filter." and "Showing 0 of 12 tasks". Coordinator e2e: "zzz" gives the same result. | `npx vitest run -t "SDLC-13"`; `candidate-e2e.log` | met |
| AC6 | Component test: Done + "fix" → 1; clear → 3 and "Showing 3 of 12 tasks"; "   " → 3. Coordinator e2e: fill "" → 3, Status all → 12. | `npx vitest run -t "SDLC-13"`; `candidate-e2e.log` | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| `npm ci` | passed | 0 vulnerabilities |
| `npm run test:unit` | passed | 3 files, 38/38 tests |
| `npx vitest run -t "SDLC-13" --reporter=verbose` | passed | 7 SDLC-13 component tests passed |
| `npx vitest run src/domain/filter.test.ts --reporter=verbose` | passed | 17/17, including search cases |
| Search of `src/`, `e2e/` for `search-filter\|<label` | n/a (observation) | No `<label>` is tied to `search-filter` |
| Coordinator checks (from `coordinator_checks.json`) | passed | lint, typecheck, unit, build and e2e all passed on both the candidate and the integration tree `95a5a4d`. E2E: 2/2 passed, including "searches tasks by title combined with other filters". Playwright was not run by the worker (sandbox). |

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | blocker | `src/App.tsx:71`: the Search input has no visible, associated label (only `aria-label` + `placeholder`). This fails spec AC1 ("visible, programmatically associated label"), the accessibility NFR, `docs/coding-standards.md` and plan step 3. It is also inconsistent with the Status and Starred only controls. Fix: add `<label htmlFor="search-filter">Search</label>` and remove `aria-label`. This confirms review finding F1. |
| F2 | major | `src/App.test.tsx:119`, `e2e/app.spec.ts:36`: the AC1 tests assert `placeholder="Search"` and find the input by accessible name, so they pass without a visible label. They should check for a `<label>` element associated with `#search-filter`. This confirms review finding F2. |

## Notes
- All configured checks pass. Checks passing does not mean AC1 is met: the tests do not cover the visible-label requirement.
- Behaviour for AC2 to AC6 is correct and well covered at the domain, component and e2e levels. Only the label markup and its tests need to change.
