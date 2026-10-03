<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-13 | kind: verification | revision: SDLC-13-verification-20261003T093320Z-b9f87b | run: SDLC-13-verification-20261003T093320Z-b9f87b -->
<!-- input_revision: d4c5c6784bbee664ad839e5760a90e869b031811724b00abd2770a4ad2bbd394 | worker: ryan-mac -->
<!-- candidate_sha: 03eaed98fb20ed054cf6d10a563b7d252dee9659 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: b6284a8179918107b347c9ab5cd74cce054d7aa6 -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

Candidate `03eaed9` checked against approved specification v002 (AC1 to AC6, including the F1 change that turns the label into a placeholder). I ran unit and component tests, lint, typecheck and build in this checkout. Browser e2e evidence comes from the coordinator's Playwright runs (`check-logs/candidate-e2e.log`, `check-logs/integration-e2e.log`), which both report 2 passed. I also checked the fixture-based expectations by hand against `src/data/tasks.ts`.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | `src/App.tsx` renders `<input id="search-filter" type="search" aria-label="Search" placeholder="Search">` inside `div.controls` after Starred only. It has no `<label>` and no `autoFocus`, and its initial state is `""`. The component tests passed: they check that the searchbox is found by role and name "Search", that the value is empty, the placeholder and `aria-label` attributes, that no label element exists, that it shares a parent with Status and Starred only, and that 12 items show. The Tab test passed: the input is not focused on load, Tab from Starred only focuses it, and typing works. The e2e test passed in Chromium on the candidate and integration trees: the input is visible, the value is empty, the placeholder is set and `label[for=search-filter]` count is 0. | `npx vitest run` ("…placeholder and no visible label… (SDLC-13 AC1)", "reaches the Search input with Tab… (SDLC-13 AC1)"); coordinator e2e "searches tasks by title combined with other filters" | met |
| AC2 | `matchesSearch` trims the search, lowercases both sides and uses `String.includes`. It is called in `filterTasks` on every render from controlled `onChange`, so there is no submit step. The unit tests passed: "review"/"REVIEW" → [t-002]; "re" → t-002, t-003, t-006, t-007, t-009, t-011 (I confirmed this by hand against the fixture; t-011 matches through "shared"); surrounding spaces; "release notes" true and "releasenotes" false; regex characters treated as plain text. The component test passed for "REVIEW", "  review  " (1 item each) and "re" (6). The e2e test passed for "REVIEW" (1 item). | `npx vitest run` (filter.test.ts `filterTasks`/`matchesSearch`; App "…ignoring case and surrounding spaces (SDLC-13 AC2)"); coordinator e2e | met |
| AC3 | The predicates are ANDed in `filterTasks`. The unit test passed: todo + "re" → 4, and adding starred {t-003, t-001} → [t-003]. The component test passed: "re" + in_progress → 2, then + Starred only (t-002 starred) → 1, with the Search value "re" and the Status value in_progress kept. The e2e test passed for in_progress + "re" → 2, which matches the hand check (t-002, t-006). | `npx vitest run` ("combines search with status and starredOnly", "…keeping each filter's value (SDLC-13 AC3)"); coordinator e2e | met |
| AC4 | The count line uses `visible.length`, which now includes search, and `tasks.length`/`starred.size` are unchanged. The component test passed: "Showing 1 of 12 tasks · 1 starred" on the `aria-live="polite"` element while a non-matching task is starred, so N counts all starred tasks. The e2e test passed for "Showing 1 of 12 tasks". | `npx vitest run` ("counts only the tasks the search leaves visible (SDLC-13 AC4)"); coordinator e2e | met |
| AC5 | `TaskList` is unchanged and renders the `role="status"` empty state. The component test passed: "releasenotes" shows "No tasks match the current filter." and "Showing 0 of 12 tasks". The e2e test passed for "zzz", with the same message and count. | `npx vitest run` ("…search matches nothing (SDLC-13 AC5)"); coordinator e2e | met |
| AC6 | An empty or whitespace-only search matches every task. The component test passed: done + "fix" → 1; clear → 3 (the done tasks t-004, t-008, t-012), "Showing 3 of 12 tasks", empty value, placeholder still set; "   " → 3. The e2e test passed: `fill("")` → 3 with an empty value, then Status all → 12. | `npx vitest run` ("…cleared or left with only spaces (SDLC-13 AC6)"); coordinator e2e | met |

## Commands run
| Command | Result | Notes |
|---|---|---|
| `npx vitest run --reporter=verbose` | passed | 3 files, 38 tests passed, including all 7 SDLC-13 component tests and the 10 new search tests in `filter.test.ts`. |
| `npm run lint` | passed | eslint, `--max-warnings 0`, exit 0. |
| `npm run typecheck` | passed | `tsc --noEmit`, exit 0. |
| `npm run build` | passed | Vite build succeeded and wrote output to `dist/`. `git status --porcelain` is empty afterwards, so no tracked files changed. |
| `node --experimental-strip-types` probe of `filterTasks` with fixture data | not run | Permission denied in this session. I checked the same expectations by hand against `src/data/tasks.ts`. |
| Playwright e2e | not run (by worker) | Chromium cannot launch in the worker sandbox. The coordinator's candidate and integration e2e runs both passed (2/2), including "searches tasks by title combined with other filters". |

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | minor | The spec's accessibility NFR requires the "Search" placeholder to meet WCAG AA contrast. The app ships no CSS rule for placeholder colour, so contrast depends on each browser's default. I could not measure it because no browser is available to the worker, and no automated test covers it. This is carried forward from review F1. A human should check it in a supported browser and decide whether to add an explicit placeholder colour. The AC1 to AC6 statuses do not depend on it. |
| F2 | info | The Search input has no visible `<label>`, which is an approved exception to `docs/coding-standards.md` line 7 (spec v002 Constraints, ticket note 104845). The implementation limits the exception to Search and gives it an explicit `aria-label`. Not a defect. |

## Notes
- All coordinator checks passed (lint, typecheck, unit, build and e2e) on both the candidate and the integration tree `b6284a8`. My runs of unit, lint, typecheck and build agree.
- Placeholder contrast (F1) is the only item still open. It needs a human to look at it in a browser.
- Making `TaskQuery.search` required means any concurrent ticket that builds a `TaskQuery` must supply `search`. Typecheck will catch this (review F3).
