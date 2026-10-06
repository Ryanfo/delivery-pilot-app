<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-17 | kind: verification | revision: SDLC-17-verification-20261006T120507Z-563452 | run: SDLC-17-verification-20261006T120507Z-563452 -->
<!-- input_revision: d79c987309cd341eab7b48686ae8e54584326ef9f36ab2042a6a4f3f67f9fe7b | worker: ryan-mac -->
<!-- candidate_sha: e438a6b15e0ef8a7a102bcd25b0a8c79a493163b -->
<!-- base_sha: 48583e88df470ea0dba878b32cf59faa026d1bf7 -->
<!-- integration_tree: df8563e0c12365d0f8dc2b709621a5a616afa414 -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Verification report

> Provenance (ticket, run, candidate SHA, tested trees) is added by the coordinator.

Candidate `e438a6b` against base `48583e8`. Browser evidence comes from the coordinator's `e2e`
check (`check-logs/candidate-e2e.log` and `check-logs/integration-e2e.log`): 16 of 16 Playwright
tests passed on both the candidate and the integration tree. I ran the unit, lint, typecheck and
build checks myself, and recomputed the palette contrast ratios independently.

## Observed evidence per criterion
| Criterion | Observation | Command / test | Status |
|---|---|---|---|
| AC1 | `src/styles.css` is imported in `src/main.tsx` and bundled (`dist/assets/index-*.css`, 3.09 kB). Body background `rgb(247,244,238)` (#f7f4ee), text `rgb(28,27,25)` (#1c1b19). The test asserts that every request goes to the app's origin. The built CSS/HTML contain no `url(`, `@import` or `http` references. | e2e "AC1 applies the bundled stylesheet…" ✓ (candidate and integration); `npm run build`; grep of `dist` | met |
| AC2 | The masthead's font stack ends in `serif`, it is centred, has a `3px double` bottom border and sits inside `main`. Its font size is larger than every other text element in `main`. | e2e "AC2 sets the masthead in a serif stack…" ✓ | met |
| AC3 | All 12 task `h2`s use the same computed font-family as the `h1`. Descriptions are 16px or larger, with a line-height ratio between 1.4 and 1.7 (CSS: 1rem / 1.6). | e2e "AC3 …" ✓ | met |
| AC4 | 14 kickers (2 control labels and 12 metadata lines): uppercase via CSS, letter-spacing above 0, smaller than body text, muted `#5c5750`. DOM `textContent` is still "Status" / "Starred only". | e2e "AC4 …" ✓ | met |
| AC5 | At 1280px, `main` is 768px wide or less with equal left and right margins. The masthead, controls, results line and list all sit inside it. The welcome section in the criterion's list no longer exists (D1). | e2e "AC5 …" ✓ | met |
| AC6 | `list-style-type: none`. Each item has the same padding, `box-shadow: none`, `border-radius: 0px` and a transparent background. Items 2 to 12 have a 1–2px solid top border. | e2e "AC6 …" ✓ | met |
| AC7 | At 768px the two labels, select, checkbox and search box share one row. At 480px Search wraps below the select with no horizontal scroll. The select and search box use the body font. Only 768px was tested; widths above it keep the same 48rem column, so the row holds. | e2e "AC7 …" ✓ | met |
| AC8 | The starred button has an accent background `rgb(163,34,43)` and a text colour different from the unstarred button, which is transparent. The "★ Starred" / "☆ Star" text is kept. | e2e "AC8 …" ✓ | met |
| AC9 | The select, checkbox, search box and first star button each get focus by Tab and show an outline of 2px or more in the accent colour. Contrast against paper is 3:1 or more (I computed 6.78:1). The CSS has no `outline: none`. | e2e "AC9 …" ✓; contrast recomputed with node | met |
| AC10 | The test checks all text, the placeholder, the starred button and the empty state against AA. Recomputed: ink/paper 15.68, muted/paper 6.52, accent/paper 6.78, paper/accent 6.78, ink/field 16.93, muted/field 7.04. | e2e "AC10 …" ✓; contrast-helper self-test ✓; node calculation | met |
| AC11 | At 320×640: no horizontal scroll, every control and star button is within 0–320px, body text is 16px or larger, and search still filters ("review" leaves 1 task). | e2e "AC11 …" ✓ | met |
| AC12 | The empty state reads "No tasks match the current filter.", uses the body font-family, italic, muted, and keeps `role="status"`. | e2e "AC12 …" ✓; `src/components/TaskList.tsx:11` | met |
| AC13 | Apart from D1, the markup diff adds only `className`s. Text, roles, `aria-*`, `data-testid` and order are unchanged. The Welcome region (`HELLO WORLD`) is removed and two existing assertions were changed to expect its absence (`src/App.test.tsx`, `e2e/app.spec.ts:6`). All 44 unit tests and both existing e2e tests pass. | `git diff 48583e8 HEAD`; `npm run test:unit` ✓; e2e `app.spec.ts` ✓ | deviates (D1) |

Non-functional: e2e "disables transitions when reduced motion is preferred" ✓. Font sizes use `rem` (masthead `clamp()` with rem bounds). No new dependencies, no external resources.

## Deviations observed
| ID | Criterion | Observation |
|---|---|---|
| D1 (review) | AC13 (also AC5's list and Exclusions/A4) | Confirmed as built: there is no Welcome region or "HELLO WORLD" text on the page, and the SDLC-7 assertions now check that it is absent. The developer asked for this (commit `e438a6b`). The behaviour works; a human needs to decide whether to accept it. |

No further deviations found.

## Commands run
| Command | Result | Notes |
|---|---|---|
| `npm ci` | passed | 247 packages, 0 vulnerabilities |
| `npm run test:unit` | passed | 3 files, 44 tests |
| `npm run lint` | passed | eslint, max-warnings 0 |
| `npm run typecheck` | passed | `tsc --noEmit` |
| `npm run build` | passed | CSS bundle 3.09 kB (1.18 kB gzip) |
| node WCAG contrast calculation on the palette | passed | all text pairs ≥ 6.5:1 |
| grep `url(`, `@import`, `http` in `dist/*.css,*.html` | passed | no matches |
| `npm run test:e2e` | not run | The sandbox cannot launch Chromium. Coordinator e2e: 16/16 passed on candidate and integration. |

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | minor | Same as review F1: removing the Welcome section (D1) retires SDLC-7's delivered behaviour. If D1 is accepted, the product owner should know about this, and the specification (Exclusions, A4, AC5, AC13) should be amended as the review proposes. |
| F2 | info | The e2e styling tests hard-code the seed data (12 tasks, 14 kickers, 1 "review" match). They are valid now but need updating when `src/data/tasks.ts` changes (review F4). |

## Notes
- The candidate meets every visual criterion (AC1–AC12). The only open item is the human decision on D1.
- The ≤30rem two-column controls grid (review F2) refines the plan. It satisfies AC7 and AC11.
