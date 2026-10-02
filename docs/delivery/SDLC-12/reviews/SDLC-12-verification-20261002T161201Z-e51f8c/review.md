<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-12 | kind: review | revision: SDLC-12-verification-20261002T161201Z-e51f8c | run: SDLC-12-verification-20261002T161201Z-e51f8c -->
<!-- input_revision: e2d5c229f57a316c9dd528e2fc163f47396ea6986439cb89e97b7e6bcbf8ebca | worker: ryan-mac -->
<!-- candidate_sha: 2009e68b23cb9f08c979a5c6f192e7c029f35fc3 -->
<!-- base_sha: be71a8c5dc029f41e237cd248eb3367a040f74e4 -->
<!-- integration_tree: ab4cb91065ccbe34d4c647bf43b6b25ecdddb426 -->
<!-- integration_with: base only -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate (`2009e68b23cb`) does what SDLC-12 asks and nothing more. The only production change
is `src/App.tsx:46`, which changes `<h1>Task list</h1>` to `<h1>My tasks</h1>`. The element, its
level, its position and its (absent) attributes are unchanged. Three component tests pin AC1–AC3.
The e2e heading assertion is now stricter (`level: 1`, `exact: true`), and a new negative check
covers AC2. I found no blocker or major defects and no tests were weakened. Two minor issues
concern process rather than code: the specification could not be reviewed because the envelope's
"specification" entry points at the plan file, and the plan's coordination section says there is
no in-flight work, but SDLC-11 now touches the same three files. I did not run any checks, so the
evidence below comes from reading the code and tests. The coordinator's configured checks are
authoritative. This review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified) | Evidence |
|---|---|---|
| AC1 | met | `src/App.tsx:46` renders `<h1>My tasks</h1>` as the first child of `<main>`. Component test `src/App.test.tsx:115-119` asserts exactly one level-1 heading and that its accessible name is "My tasks" (RTL string name matching is exact by default). `e2e/app.spec.ts:5` asserts a visible level-1 heading "My tasks" with `exact: true`. |
| AC2 | met | No heading in `src/` contains "Task list". The only remaining occurrences are the out-of-scope `index.html` `<title>`, the `README.md`/`CLAUDE.md` titles and historical `docs/delivery/SDLC-7` documents. `src/App.test.tsx:121-124` asserts that no heading of any level matches `/task list/i`. None of the 12 task titles (rendered as `<h2>`) collide with that pattern. `e2e/app.spec.ts:6` asserts a count of 0 for headings named "Task list" (case-insensitive substring, which is the stricter direction for a negative check). |
| AC3 | met | The diff to `src/App.tsx` is a single-line text change. Welcome section, controls, count line and `TaskList` are untouched. `src/App.test.tsx:126-137` pins the welcome text, the Status combobox, the unticked "Starred only" checkbox, the exact count line `Showing 12 of 12 tasks · 0 starred` and 12 list items. All pre-existing component tests and the rest of the e2e journey (`e2e/app.spec.ts:7-28`) are unchanged. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | inputs: `approved_artefacts` | The `specification` and `plan` entries in the envelope point to the same local file (`inputs/approved/v001.md`), and that file is the plan (provenance `kind: plan`). The approved specification (commit `557002aa39b3`) was therefore not available to this review. Its assumptions A1 (exact casing "My tasks") and A3 (tab title stays "Task list"), which the plan cites, could not be checked against the source. The review relies on the brief's ACs, which the change satisfies. The coordinator should stage the two artefacts under distinct paths. |
| F2 | minor | `src/App.tsx`, `src/App.test.tsx`, `e2e/app.spec.ts` | The plan's Coordination section says `related_work` is empty, but SDLC-11 (Verifying, title search) now changes all three of these files. See "Interactions" below. Whichever ticket merges second needs a rebase and a full rerun of unit and e2e tests on the combined tree. |
| F3 | info | `src/App.test.tsx:131-133` | The new AC3 test asserts the exact count line `Showing N of N tasks · 0 starred`. This is correct for SDLC-12, but it is a new exact-text pin that any later ticket changing the count line (including SDLC-11 if it extends that line for search) will have to update deliberately. |
| F4 | info | `index.html:6`, `README.md:1`, `CLAUDE.md:1` | The tab title and the project docs still say "Task list". The brief explicitly puts the tab title out of scope, so this is correct, but the heading and the tab title now differ. Product may want a follow-up ticket. |
| F5 | info | `docs/delivery/SDLC-7/releases/v001.md:28` | The historical SDLC-7 release smoke steps say "Confirm the 'Task list' heading is visible". Anyone reusing that checklist after SDLC-12 ships will see a failure. No change is needed in this ticket (`docs/delivery/` is coordinator-owned). Flagged for awareness. |

## Scope and standards
- **Scope:** Only the three files named in the plan are changed. `index.html`, styling, README and
  other wording are untouched, as the brief requires. There is no scope creep.
- **Tests weakened:** None. The old e2e assertion (`getByRole("heading", { name: "Task list" })`,
  substring match at any level) is replaced by a stricter one (`level: 1`, `exact: true`). All
  existing component tests are kept unchanged.
- **Standards:** The new tests follow the existing file's idioms (`render(<App store={memory()} />)`,
  role-based queries, `within(...)` for list items) and use the existing `describe("App")` block.
  The test names reference SDLC-12 ACs, so they are distinct from the SDLC-10 AC-numbered tests in
  the same file.
- **Accessibility:** The page still has exactly one `<h1>`, which is now asserted. The heading
  hierarchy (h1 page heading, h2 task titles) is unchanged.
- **Security:** Not applicable (static text change).

## Interactions with other in-flight work
**SDLC-11** (title search, status Verifying, actual commit `71c5eaab5a2e`) changes `src/App.tsx`,
`src/App.test.tsx`, `e2e/app.spec.ts`, `src/domain/filter.ts` and `src/domain/filter.test.ts`.
Its footprint was cut from the same base (`be71a8c`) as SDLC-12. I could not inspect SDLC-11's
code, so the following is based on its footprint only:
- SDLC-11's branch still has `e2e/app.spec.ts:5` asserting the "Task list" heading. If SDLC-11
  does not edit that line, a merge picks up SDLC-12's version cleanly. If SDLC-11 edits nearby
  lines of the same journey, there will be a textual conflict, and resolving it by keeping
  SDLC-11's side would bring back the old heading assertion. That would then fail e2e against
  "My tasks".
- SDLC-11's footprint says its new tests do not assert the page heading. I could not verify this.
  Any SDLC-11 test that does would fail once SDLC-12 is on main.
- SDLC-11 adds a search control to the page. SDLC-12's AC3 test only asserts that the listed
  elements are present, not that nothing else exists, so a new search box does not break it. If
  SDLC-11 changes the "Showing X of Y tasks · N starred" line or the default rendered list, the
  exact-text assertion at `src/App.test.tsx:131-133` will break (F3).
- Both tickets append tests at the end of `describe("App")` in `src/App.test.tsx`, so a trivial
  textual conflict is likely there.

Non-overlapping paths (`src/domain/filter*`) do not prove independence. Even where the files do
not overlap, the combined page should be checked by running the full unit and e2e suites on main
after both tickets merge, as SDLC-11's own sequencing note recommends.
