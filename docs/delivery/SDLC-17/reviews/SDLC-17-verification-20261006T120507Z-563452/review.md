<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-17 | kind: review | revision: SDLC-17-verification-20261006T120507Z-563452 | run: SDLC-17-verification-20261006T120507Z-563452 -->
<!-- input_revision: d79c987309cd341eab7b48686ae8e54584326ef9f36ab2042a6a4f3f67f9fe7b | worker: ryan-mac -->
<!-- candidate_sha: e438a6b15e0ef8a7a102bcd25b0a8c79a493163b -->
<!-- base_sha: 48583e88df470ea0dba878b32cf59faa026d1bf7 -->
<!-- integration_tree: df8563e0c12365d0f8dc2b709621a5a616afa414 -->
<!-- integration_with: base only -->
<!-- merge_conflicts: none -->

# Independent review

> Provenance (ticket, run, candidate SHA, inputs) is added by the coordinator.

## Verdict summary
The candidate (`e438a6b`) adds one plain stylesheet, `src/styles.css`, imported from
`src/main.tsx`. Markup changes are class names only. It closely follows the approved plan:
paper-and-ink tokens, a serif masthead and task titles, uppercase muted kicker labels and
metadata, a 48rem centred column, tasks separated by rules, an accent-filled starred button,
2px accent focus rings, an italic empty state and reduced-motion handling. It also adds a
computed-style Playwright spec covering AC1–AC12 and the reduced-motion NFR. I found no defect
that blocks acceptance.

One deviation needs a human decision. The follow-up commit removes the "Welcome" /
"HELLO WORLD" section and rewrites the two existing tests that pinned it (D1). The developer
asked for this ("Remove the "hello world" line too"). The approved specification excludes it
(Exclusions, A4, AC13), and it reverses behaviour delivered by SDLC-7.

This review is static: I could not run commands. The developer's commit says the e2e suite was
not run locally, so the browser evidence for AC1–AC12 depends on the coordinator's `e2e` check.
A review is a proposal, not an approval.

## Acceptance criteria
| Criterion | Status (met / not met / unverified / deviates) | Evidence |
|---|---|---|
| AC1 | met | `src/styles.css` `body`/`html` use `--paper` `#f7f4ee` and `--ink` `#1c1b19`, imported in `src/main.tsx`; no external URLs in the CSS. Test "AC1 applies the bundled stylesheet…" in `e2e/styling.spec.ts` (needs the coordinator's e2e run). |
| AC2 | met | `.masthead`: display serif stack ending `serif`, `clamp(2.5rem, …, 4rem)` (≥40px against 24px h2 as the next largest), centred, `border-bottom: 3px double var(--ink)`. Test "AC2 …". |
| AC3 | met | `.task-title` uses `--font-display` (same as the masthead); `.task-description` is 1rem with line-height 1.6; body stack ends `serif`. Test "AC3 …". |
| AC4 | met | `.controls label` and `.task-meta`: kicker font, 0.75rem, `text-transform: uppercase`, `letter-spacing: 0.12em`, `--muted`. DOM text unchanged (the test checks `textContent`). Test "AC4 …". |
| AC5 | met | `main { max-width: 48rem; margin: 0 auto }`. Test "AC5 …" checks width ≤768, equal margins and that the sections sit inside `main` (the Welcome section is no longer in the list; see D1). |
| AC6 | met | `.task-list { list-style: none }`, `.task + .task { border-top: 1px solid }`, uniform `padding: 1.5rem 0`, transparent background, `box-shadow: none` and `border-radius: 0`. Test "AC6 …". |
| AC7 | met | `.controls` is a `flex-wrap` row with Search at `flex: 1 1 12rem; min-width: 0`. My estimate puts the controls at about 550px against 720px of content width at 768px. At ≤30rem a grid puts Search on its own row (a plan refinement, F2). Fields use `font: inherit`. Test "AC7 …" checks one row at 768px and wrapping at 480px. |
| AC8 | met | `.star-button[aria-pressed="true"]` uses an `--accent` fill with `--paper` text; the unstarred button is transparent with accent text; "★ Starred"/"☆ Star" text is kept. Test "AC8 …". |
| AC9 | met | `select/input/button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`; there is no `outline: none`. Accent on paper is about 6.8:1 by my calculation. Test "AC9 …" reaches each control with Tab. |
| AC10 | met | By my calculation: ink on paper about 15.7:1, muted on paper about 6.5:1, accent on paper and paper on accent about 6.8:1, muted placeholder on `--field` #fffdf8 above 6.5:1. Test "AC10 …" plus the helper self-test "contrast helper returns known WCAG ratios". |
| AC11 | met | Below 30rem, `main` padding is 1rem and the controls use a two-column grid with `min-width: 0` on the select; Search spans the full row. Test "AC11 …" at 320×640 checks no horizontal scroll and that controls stay in bounds. |
| AC12 | met | `.empty-state`: body font, italic, muted, centred; `role="status"` kept (`src/components/TaskList.tsx:11`). Test "AC12 …". |
| AC13 | deviates | D1. Apart from the removed Welcome section, the changes are class names only: no other text, role, `aria-*`, `data-testid` or order changes. However, `src/App.test.tsx` and `e2e/app.spec.ts` were modified to assert that the Welcome region is absent, contrary to "pass without being modified". |

## Deviations from the specification
| ID | Criterion | What the code does instead | Asked for by the developer? | Proposed specification wording |
|---|---|---|---|---|
| D1 | AC13 | Removes `<section aria-label="Welcome">HELLO WORLD</section>` from `src/App.tsx`. Rewrites the unit test "shows the welcome block…" as "does not show the HELLO WORLD welcome block" and changes the e2e assertion to `toHaveCount(0)`. The spec excluded copy changes "including … the "HELLO WORLD" welcome text" and A4 said the section stays. | Yes. Commit `e438a6b`: "Remove the "hello world" line too" | Exclusions: drop "the HELLO WORLD welcome text" from the unchanged copy. A4: "The "Welcome" / "HELLO WORLD" section (SDLC-7) is removed from the page." AC13: "…all existing visible text, roles, accessible names, `aria-*` attributes, `data-testid` values and element order are unchanged, except that the Welcome region is removed. The existing tests pass unmodified, except the SDLC-7 welcome assertions in `src/App.test.tsx` and `e2e/app.spec.ts`, which now assert the region is absent." AC5: drop "welcome section" from the list of column contents. |

## Findings
| ID | Severity | Location | Description |
|---|---|---|---|
| F1 | minor | `src/App.tsx:47` | Removing the Welcome section (D1) reverses SDLC-7's delivered and released criteria ("HELLO WORLD" directly below the heading). If D1 is accepted, the product owner should know SDLC-7's behaviour is retired. The request also says "too", which suggests an earlier removal request. No other removal appears in the diff or commit messages, so confirm nothing else was meant. |
| F2 | info | `src/styles.css:207` | This is a refinement of the plan rather than a deviation from the specification. At ≤30rem the controls bar switches from the planned flex row to a two-column grid so each label stays beside its control. It still satisfies AC7 and AC11. The developer's commit message discloses it. |
| F3 | info | `e2e/styling.spec.ts` | The developer did not run the e2e suite locally (commit `26c7871`), and I could not run it either. Evidence for AC1–AC12 depends on the coordinator's `e2e` check passing. |
| F4 | info | `e2e/styling.spec.ts:145` | The tests hard-code the seed data (12 tasks, 14 kickers, "review" matches 1). That is acceptable for this fixture, but they will need updating when `src/data/tasks.ts` changes. |

## Scope and standards
- No new dependencies, no external resources and no changes to `.github/`, `.claude/`, `CLAUDE.md` or `docs/delivery/`.
- Tests weakened: none. The two modified assertions now assert the opposite behaviour (absence) required by D1. They are not loosened. They are a change to existing tests that AC13 forbids, which is why D1 is a deviation.
- Accessibility: focus rings are kept, the starred state is shown by text and `aria-pressed` as well as colour, contrast passes by calculation, the Search field still has no visible label (SDLC-13), and the controls still share one parent (the unit assertion is kept).
- Font sizes use `rem`; the masthead uses `clamp()` with rem bounds as the plan specified. Reduced motion disables transitions.

## Interactions with other in-flight work
`related_work` is empty. Behavioural interactions:
- **SDLC-7 (delivered):** D1 removes its Welcome block and rewrites its tests (F1).
- **SDLC-13 (delivered):** the Search field has no label, its placeholder contrast is styled, and the flex/grid layout keeps the controls as siblings. No conflict found.
- Any future ticket that adds controls to `.controls` inherits both the flex row and the ≤30rem two-column grid. A control without a preceding label would break the label/control column pairing on narrow screens.

File-path separation does not prove independence.
