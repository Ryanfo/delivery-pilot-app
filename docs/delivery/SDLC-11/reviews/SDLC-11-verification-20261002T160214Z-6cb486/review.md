<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-11 | kind: review | revision: SDLC-11-verification-20261002T160214Z-6cb486 | run: SDLC-11-verification-20261002T160214Z-6cb486 -->
<!-- input_revision: b44442ee152dca43f8ae5124dfb0cc9bf81d623bc0b352080bd63a6458b7d541 | worker: ryan-mac -->
<!-- candidate_sha: 71c5eaab5a2eb945411b9d872012340950193b46 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: 283471d6cbb7999e5dde2dad2945c8407cfb24de -->
<!-- integration_with: base only -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate (`71c5eaab5a2e`) adds an optional `search` field to `TaskQuery`. `filterTasks` applies it as a trimmed, case-insensitive title match, ANDed with the Status and Starred-only clauses. `App` adds a labelled `type="text"` Search input to the existing `.controls` row and feeds it into the existing `useMemo` query. Reading the code and tests, all six acceptance criteria in the brief are met. Each one maps to named unit, component and e2e tests, and no existing test was changed. No code defects were found. There is one input problem: in the envelope, the "specification" and "plan" entries both point to the same file (`inputs/approved/v001.md`), and that file contains only the plan. This reviewer could not read the approved specification, so the plan's references to spec assumptions A1–A6 could not be checked against their source (F1). Tests were not run in this review. The coordinator's configured checks are authoritative. This review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:71-72` adds `<label htmlFor="search-filter">Search</label>` and `<input id="search-filter" type="text">` inside `.controls`, after "Starred only". Tests in `src/App.test.tsx` check it has role `textbox` with name "Search", sits in the same `.controls` as Status, and is reached by Tab from the checkbox. |
| AC2 | met | `src/domain/filter.ts:17,22`: `needle = (search ?? "").trim().toLowerCase()`, then `title.toLowerCase().includes(needle)`. It filters on every change because there is no form or submit. Unit tests cover case, trimming, title-only matching and inner spaces. A component test types `"  ROTA "`. The e2e test fills `"  ROTA "`. |
| AC3 | met | The clause is ANDed in `filterTasks` (`src/domain/filter.ts:20-22`). Covered by the unit test "combines search with status and starredOnly", the component test (search AC3) and the e2e step that combines "ROTA" with Status "To do". |
| AC4 | met | The count line uses `visible.length` (`src/App.tsx:75`), and `visible` now includes search. The component test asserts "Showing 1 of 12 tasks · 1 starred". The e2e test asserts "Showing 1 of 12 tasks" and "Showing 0 of 12 tasks". |
| AC5 | met | The existing `TaskList` empty state (`src/components/TaskList.tsx:10-11`) runs whenever `visible` is empty. The component test types "zzz" and also tries a combined no-match. The e2e test checks `role="status"` text. |
| AC6 | met | An empty or blank needle matches every task (`src/domain/filter.ts:22`). Covered by the unit test for empty and all-space input, the component test (clear → 3 of 12 under "Done", then `"   "` → still 3) and the e2e step (clear → 12 items). |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | major | envelope `approved_artefacts` | The specification and plan entries point to the same path, `inputs/approved/v001.md`, but have different commits (`085a3605…` and `b2ff8f24…`). That file contains only the plan, so this reviewer never received the approved specification. The plan's claims about spec assumptions A1–A6 (title-only substring, plain JS lower-casing, blank means no filter, either input type allowed, no persistence, sort unchanged) could not be checked against the spec. The ACs in the brief were checked directly. The coordinator should give each artefact its own file and re-check against the specification before acceptance. |
| F2 | minor | `src/App.test.tsx` "combines Search with Status and Starred only (search AC3)" | The last step sets Status back to "All" and expects 1 item, to show that Search and Starred only both still apply. Only one task is starred, so Starred only alone would also give 1 item, and the step cannot detect search being dropped. The unit test and the e2e step still cover AC3. One fix is to star a second task that fails "re" (for example "Plan accessibility audit") before the final assertion. |
| F3 | info | `src/App.test.tsx` (search AC4) | The test finds the count line with `container.querySelector('[aria-live="polite"]')` rather than a role or label, which is less in line with the testing policy's "through roles and labels". It is acceptable because the line has no role. Other tests use `getByText(..., { exact: false })`. |
| F4 | minor | `src/App.tsx`, `src/App.test.tsx`, `e2e/app.spec.ts` | SDLC-12 is in flight (see below) and edits the same three files. Rebase after it merges and rerun all checks. Details below. |

## Scope and standards
- **Scope:** Matches the plan's affected files exactly. Descriptions are not searched (unit test "matches the title only"), nothing is persisted (React state only, no `KeyValueStore` writes) and nothing is highlighted, as the out-of-scope list requires. No new dependencies.
- **Architecture:** Follows `docs/architecture.md`: filtering lives in `TaskQuery` and `filterTasks` in `src/domain/`, not in the component. `filterTasks` stays pure.
- **Standards:** Under `exactOptionalPropertyTypes`, the optional `search?: string` is always given a `string` by `App`, so this is fine. No `any`, non-null assertions or suppressions.
- **Tests weakened:** None. The diff only adds tests. Existing tests in all three files are unchanged.
- **Accessibility:** The visible label is linked with `htmlFor`/`id`. The input is a native control and is keyboard operable, which a Tab-order test confirms. The count line keeps `aria-live="polite"`. Using `type="text"` (role `textbox`) rather than `type="search"` is a deliberate plan decision. It could not be checked against the spec's A4 (F1).
- **Security:** Client-only. The search text goes only into a substring comparison and React-escaped rendering. Nothing is stored or sent.
- **Locale:** `toLowerCase()` without locale folding is accepted per the plan (spec A2, unverified per F1). The fixture data is ASCII.

## Interactions with other in-flight work
- **SDLC-12** (status "Changes requested", footprint `docs/delivery/SDLC-12/plan/v001.footprint.json`, actual commit `2009e68b23cb`) changes the page heading ("App (page heading)") in `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts`. These are the same files this candidate changes. This candidate is based on `be71a8c`, which does not include SDLC-12.
  - *Textual:* In `App.tsx` the `<h1>` (line 47) and this change's hunks (lines 27-33, 71-72) are not adjacent, but a merge could still conflict. Both tickets may append tests at the end of `App.test.tsx` and `app.spec.ts`, which can cause conflicts there.
  - *Behavioural:* The new search tests do not assert on the heading text, so a heading change should not break them. The existing e2e test asserts the heading "Task list", and updating it belongs to SDLC-12. If SDLC-12's final change goes beyond the heading text (it is in "Changes requested", so its scope may still move), for example by adding focusable elements or text matching "Showing …" or "Search", then the Tab-order test and the `getByText` queries here could be affected. Different file hunks do not prove the two changes are independent. Whichever ticket merges second should rebase onto `main` and rerun lint, typecheck, unit, build and e2e.
