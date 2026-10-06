<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-17 | kind: release_verification | revision: e451adbfd571-local-pilot | run: SDLC-17-release_verification-20261006T124354Z-661f9b -->
<!-- input_revision: 36efaa7a0d751e27dbfadf464dd209e667192710a8a5034c38bd24f6aac50299 | worker: ryan-mac -->
<!-- released_commit: e451adbfd571a4b60f35493eae8d93fc9a973db9 -->

# Release verification

> Provenance (ticket, release record, released commit, provenance chain) is added by the coordinator.

## Release record
- Released commit: `e451adbfd571a4b60f35493eae8d93fc9a973db9`. This is the merge commit of PR #9
  (`feature/SDLC-17` → `main`), merged by Ryanfo at 2026-10-06T12:40:49Z using the "merge commit"
  strategy.
- Environment: `local-pilot`.
- Provenance (from `release_record.json`, source `github`): PR head = accepted candidate
  `e438a6b15e0ef8a7a102bcd25b0a8c79a493163b`, `merged_tree_matches_candidate: true`, and
  `released_equals_merge: true`.
- Observed in the working copy: `git rev-parse HEAD` = `e451adb…`, and the working tree was
  clean. `git diff --stat e438a6b HEAD` is empty, so the released tree is identical to the
  accepted candidate.
- Coordinator checks (`coordinator_checks.json`) contain only `setup` (`npm ci`, passed, exit 0,
  247 packages added, 0 vulnerabilities; `check-logs/release-setup.log`). **No e2e (Playwright)
  result for the released commit was provided.**

## Smoke evidence
Steps are numbered as in release proposal v001. Run with `PORT=64625` (the run's app port).

| Step | Observation | Status |
|---|---|---|
| 1. Checkout and `npm ci` | HEAD is `e451adb`. The coordinator's `setup` check (npm ci) passed with exit 0 and 0 vulnerabilities. | Passed (coordinator) |
| 2. lint, typecheck, unit | `npm run lint` exit 0 (`--max-warnings 0`). `npm run typecheck` exit 0. `npm run test:unit`: 3 files, **44/44 passed**, matching the proposal's count. | Passed |
| 3. build and no external CSS refs | `npm run build` exit 0. `dist/assets/` holds one `index-DiuzvF4T.css` (3.09 kB). `grep -rE "url\(\|@import\|https?://" dist/assets/*.css` found 0 matches. `dist/` is git-ignored, so no tracked files changed. | Passed |
| 4. `npm run test:e2e` | Not run here, because Chromium cannot launch in the worker sandbox. The coordinator's checks for this release contain no e2e result, so there is no e2e evidence to cite. | **Unverified** |
| 5. Preview at ~1280px: paper background, serif masthead with double rule, centred column, no "HELLO WORLD" | `npm run preview` started and printed `Local: http://127.0.0.1:64625/`. Fetching the page over HTTP was denied by this session's permissions, and no browser is available. Static evidence in the built CSS: `html,body{background:#f7f4ee;color:#1c1b19}`, `.masthead{font-family:"Iowan Old Style",…,serif;border-bottom:3px double;text-align:center;font-size:clamp(2.5rem,…,4rem)}`, `main{max-width:48rem;margin:0 auto}`. "HELLO WORLD" does not appear in `dist/assets/*.js`, and the `App.test.tsx` absence test passes. | Unverified in browser (static checks consistent) |
| 6. List: no bullets, rules between tasks, no cards, serif titles, kicker metadata | CSS: `.task-list{list-style:none;padding:0}`, `.task+.task{border-top:1px solid var(--rule)}`, `.task{box-shadow:none;background:0 0;border-radius:0}`, `.task-title{font-family:var(--font-display)}`, `.task-meta{text-transform:uppercase;letter-spacing:.12em;font-size:.75rem;color:var(--muted)}` | Unverified in browser (static checks consistent) |
| 7. Star button fill and persistence across reload | CSS: `.star-button[aria-pressed=true]{background:var(--accent);color:var(--paper)}`. Unit tests (44 passing) cover starring and persistence behaviour. No real reload was observed. | Unverified in browser |
| 8. Tab focus rings | CSS: `select:focus-visible,input:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}`. Accent on paper contrast is 6.78:1. | Unverified in browser (static checks consistent) |
| 9. Search `zzz` gives the empty state, `review` gives one task | `.empty-state{font-style:italic;color:var(--muted)}`. Search and filter behaviour is covered by the passing unit tests. | Unverified in browser |
| 10. Status filter, Starred only, results count | Covered by the passing unit tests. Not observed in a browser. | Unverified in browser |
| 11. 320px: no horizontal scroll, controls wrap | CSS: `@media (width<=30rem){.controls{display:grid;grid-template-columns:auto 1fr}.controls input[type=search]{grid-column:1/-1}}`, plus `input[type=search]{min-width:0}`. Not rendered. | Unverified in browser |
| 12. No external network requests | The built CSS has no `url(`, `@import` or `http(s)://`. `index.html` loads only same-origin assets. The JS bundle's only `http(s)` strings are XML namespace URIs and React's error-message link, which are not requests. No network panel was observed. | Unverified in browser (static checks consistent) |

Contrast ratios computed from the built palette (WCAG 2.1 formula):

| Pair | Ratio |
|---|---|
| ink `#1c1b19` on paper `#f7f4ee` | 15.68:1 |
| muted `#5c5750` on paper | 6.52:1 |
| muted on field `#fffdf8` (placeholder) | 7.04:1 |
| ink on field | 16.93:1 |
| accent `#a3222b` on paper (focus ring, unstarred button text) | 6.78:1 |
| paper on accent (starred button text) | 6.78:1 |

All of these meet AC10 (4.5:1) and AC9 (3:1).

## Findings
| ID | Severity | Description |
|---|---|---|
| F1 | major | There is no end-to-end (Playwright) evidence for the released commit. `coordinator_checks.json` contains only `setup`, and the worker sandbox cannot launch Chromium. Smoke step 4, and the e2e half of AC13, are unverified on `e451adb`. Because the released tree is identical to the accepted candidate (`e438a6b`), the candidate's earlier e2e results carry over by tree identity, but they were not re-observed here. |
| F2 | info | The manual browser smoke steps 5–12 could not be performed. HTTP access to the local preview was denied in this session, and there is no browser. The built CSS matches every visual expectation in those steps. A human should do a quick browser pass at 1280px and 320px. |
| F3 | info | The `npm run preview` process started for step 5 (port 64625) could not be stopped from inside the sandbox (`pkill` cannot read the process list). It may need to be stopped by the coordinator or the developer. |

No smoke step failed.
