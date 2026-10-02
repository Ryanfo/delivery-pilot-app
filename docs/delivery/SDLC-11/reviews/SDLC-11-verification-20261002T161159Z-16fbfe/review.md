<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-11 | kind: review | revision: SDLC-11-verification-20261002T161159Z-16fbfe | run: SDLC-11-verification-20261002T161159Z-16fbfe -->
<!-- input_revision: 0246cd31625ccfa4c2afa1e891accdeda37e89d8c1a5d52f7e7d13696890b8eb | worker: ryan-mac -->
<!-- candidate_sha: 71c5eaab5a2eb945411b9d872012340950193b46 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: 283471d6cbb7999e5dde2dad2945c8407cfb24de -->
<!-- integration_with: base only -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate adds an optional `search` field to `TaskQuery`. `filterTasks` trims the search text, lower-cases it and ANDs a title-substring clause with the existing Status and Starred only clauses. `App` keeps the search text in React state and renders a labelled `type="text"` "Search" input inside the existing `.controls` row. The change follows the approved plan step by step and respects `docs/architecture.md`, because filtering is done in the domain layer rather than in the component. Every acceptance criterion has at least one named unit, component or e2e test. I traced each test's expected result against the fixture data in `src/data/tasks.ts` and found them all correct. I found no blockers or major issues. Two minor findings remain. The approved specification was not actually provided to this review (F1), and the combined result with SDLC-12 still needs checking (F2). I could not run any commands, so the configured checks are the coordinator's to confirm. This review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:71-72`: `<label htmlFor="search-filter">Search</label>` and `<input id="search-filter" type="text">` sit inside `<div className="controls">` after the Starred only checkbox. Tests in `src/App.test.tsx`: "shows an empty, labelled Search input in the filter controls row (search AC1)" checks the role/name, empty value and the same `.controls` container as Status. "reaches the Search input by keyboard after the other controls (search AC1)" checks Tab order and that typing works. |
| AC2 | met | `src/domain/filter.ts:17,22` computes `(query.search ?? "").trim().toLowerCase()` and matches it against `task.title.toLowerCase()`. Filtering runs on every change because there is no form or submit handler. Unit tests cover case and trimming (`"  ROTA "` → t-004), title-only matching (`"draft"` → t-001 only, even though t-002's description contains "draft") and inner spaces. A component test types `"  ROTA "` and the e2e test fills `"  ROTA "`. |
| AC3 | met | The clause is ANDed in `filterTasks`. Unit test "combines search with status and starredOnly": I checked that t-010 "Plan accessibility audit" has no "re" and t-002/t-006 do. Component test "combines Search with Status and Starred only (search AC3)": I checked the in_progress + "re" result, which sorts as high-priority "Prepare demo environment" before "Review quarterly roadmap". The e2e test checks Search plus Status "To do" → 0. |
| AC4 | met | The count line `src/App.tsx:75` uses `visible.length`, and `visible` now includes the search. Component test "counts only tasks the search leaves visible…" expects `Showing 1 of 12 tasks · 1 starred` inside the `aria-live` element. The e2e test checks "Showing 1 of 12 tasks" and "Showing 0 of 12 tasks". |
| AC5 | met | `TaskList` already renders `role="status"` "No tasks match the current filter." when the list is empty. The component test types "zzz" and also checks a combined no-match (rota + To do). The e2e test checks the same message after Search + Status "To do". |
| AC6 | met | An empty or blank search skips the clause (`needle === ""`). Unit test "does not filter when the search is empty or only spaces". Component test "restores the tasks allowed by the other filters when Search is cleared or blank (search AC6)": Done + rota → 1, cleared → 3, `"   "` → 3. The e2e test clears the search and expects 12 items. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | inputs `approved/v001.md` | Both `approved_artefacts` entries (the specification at commit 085a360 and the plan at commit b2ff8f2) point to the same local path, and that file contains only the plan. I could not read the approved specification itself. Its assumptions (A1–A6: title-only, standard JS lower-casing, blank means no filter, text or search input allowed, no persistence, sort unchanged) were checked only through the plan's restatement of them. The coordinator should provide the two artefacts under distinct paths. |
| F2 | minor | `src/App.tsx`, `src/App.test.tsx`, `e2e/app.spec.ts` | SDLC-12 (Verifying, actual commit 2009e68) changes the same three files. The candidate is based on be71a8c and does not contain SDLC-12. The combined code has not been built or tested. See "Interactions". |
| F3 | info | `src/domain/filter.ts:17` | `toLowerCase()` is not locale-aware (for example Turkish dotted/dotless I), and no Unicode normalisation is applied. The plan accepts this under spec A2, and the fixture data is ASCII. No action is needed for this ticket. |

## Scope and standards
- **Scope:** I found no scope creep. Only title is searched (a test confirms descriptions are excluded). Search state is in-memory only and never written to `KeyValueStore`. There is no highlighting. All three items are out of scope in the brief, and all are respected.
- **Standards:** The change is additive and typed. `search?: string` works with `exactOptionalPropertyTypes` because `App` always passes a `string`. The code has no `any`, no non-null assertions and no lint suppressions, and the `useMemo` dependencies include `search`. The domain function stays pure (a test asserts the input is not mutated) and the component stays thin.
- **Tests:** None of the existing tests in `filter.test.ts`, `App.test.tsx` or `app.spec.ts` were changed, skipped or weakened. New tests use role and label queries and include keyboard use, as `docs/testing-policy.md` requires.
- **Accessibility:** The input has a visible label associated through `htmlFor`/`id` (accessible name "Search", role `textbox`) and is reachable by Tab after Starred only. The count line is already `aria-live="polite"`, so result counts are announced as the user types.
- **Security:** No new I/O, dependencies or storage. The search text is rendered only as a controlled input value and is not injected anywhere.
- **Checks:** I did not run lint, typecheck, unit, build or e2e. Their results must come from the coordinator.

## Interactions with other in-flight work
- **SDLC-12 (page heading text, status Verifying):** Its footprint (`actual_paths`) covers `src/App.tsx`, `src/App.test.tsx` and `e2e/app.spec.ts`, the same three files this candidate touches. Different hunks do not prove the two changes are independent.
  - *Textual:* SDLC-12 edits the `<h1>`, while this ticket edits the state, `useMemo` and `.controls` block. Both tickets may append tests at the end of `App.test.tsx` and `app.spec.ts`, so a merge conflict there is possible.
  - *Behavioural:* The new SDLC-11 tests do not assert on the heading, as SDLC-12's sequencing note asks. They do use substring text queries (`getByText("Showing 1 of 12 tasks")`) and role queries (`getByRole("status")`, `getByRole("textbox", { name: "Search" })`). These would become ambiguous only if SDLC-12 added another `status` region, textbox or matching text. Its footprint ("App (page heading)") suggests it does not, but I have not seen SDLC-12's diff, so this is unverified.
  - *Recommendation:* Whichever ticket merges second should rebase onto the other and rerun all configured checks, including e2e, on the combined code before acceptance, as the approved plan's Coordination section already requires.
