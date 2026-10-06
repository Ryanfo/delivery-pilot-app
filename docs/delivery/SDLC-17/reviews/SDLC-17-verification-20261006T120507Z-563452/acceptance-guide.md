<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-17 | kind: acceptance_guide | revision: SDLC-17-verification-20261006T120507Z-563452 | run: SDLC-17-verification-20261006T120507Z-563452 -->
<!-- input_revision: d79c987309cd341eab7b48686ae8e54584326ef9f36ab2042a6a4f3f67f9fe7b | worker: ryan-mac -->
<!-- candidate_sha: e438a6b15e0ef8a7a102bcd25b0a8c79a493163b -->

# Acceptance guide

How to check each acceptance criterion by hand in the running app. This is for the person deciding
whether to accept the delivery; no knowledge of the code needed.

## Before you start
- Start the app (`npm ci`, then `npm run dev`) and open the address it prints in a desktop browser.
- No setup data is needed: the app comes with 12 sample tasks. To start from a clean state
  (nothing starred), clear the site's local storage or use a private window.
- For the narrow-screen checks, open the browser's developer tools and use responsive or
  device mode to set a width.

## AC1: Paper background and ink text
1. Open the page.
2. **You should see**: a warm off-white background (not stark white) and very dark, slightly
   warm text (not pure black). Everything loads without an internet connection.

## AC2: Masthead
1. Look at the "Task list" heading at the top.
2. **You should see**: a large serif heading, the biggest text on the page, centred, with a
   double rule underneath.

## AC3: Task titles and descriptions
1. Look at any task.
2. **You should see**: the task title in the same serif style as the masthead (smaller), and
   the description in comfortably sized, well-spaced serif body text.

## AC4: Kicker labels and metadata
1. Look at the "Status" and "Starred only" labels and the line under each description
   (for example "To do · Priority: high · Due …").
2. **You should see**: small, spaced-out, UPPERCASE grey text.

## AC5: Single centred column
1. Make the browser window wide (about 1280px or more).
2. **You should see**: everything in one centred column about 768px wide, with equal empty
   space on both sides.

## AC6: Rules between tasks, no cards
1. Scroll through the task list.
2. **You should see**: no bullet points, a thin line between consecutive tasks, even spacing,
   and no boxes, shadows or rounded panels.

## AC7: Controls bar layout
1. At a width of 768px or more, look at the bar with Status, Starred only and Search.
2. **You should see**: all of them on one row, in the page's fonts and colours.
3. Narrow the window to about 480px.
4. **You should see**: the Search box moves to its own row, and there is no sideways scrolling.

## AC8: Starred button
1. Click "☆ Star" on any task.
2. **You should see**: it changes to "★ Starred" with a solid deep-red fill and light text,
   while unstarred buttons stay outlined with red text.

## AC9: Keyboard focus
1. Click on empty page space, then press Tab repeatedly.
2. **You should see**: a clear deep-red outline around each control in turn: the Status
   select, the Starred only checkbox, the Search box, then each Star button.

## AC10: Readable contrast
1. Look over all the text, including the grey labels, the results line, the "Search"
   placeholder and a starred button.
2. **You should see**: all of it easy to read. Verification also measured every colour pair
   (lowest about 6.5:1, against a required 4.5:1).

## AC11: Small phones (320px)
1. Set the width to 320px.
2. **You should see**: no sideways scrolling. Labels sit beside their controls, Search spans
   the full width, and all buttons are visible and work (type "review" and one task remains).

## AC12: Empty state
1. Type "zzz" in Search.
2. **You should see**: "No tasks match the current filter." in centred, italic grey text.

## AC13: Nothing else changed, except the welcome text
1. Use the filters, search and star buttons as before.
2. **You should see**: the same behaviour and wording as before.
3. **Decision needed (D1)**: the "HELLO WORLD" welcome line under the heading has been
   **removed** at the developer's request. The specification said it would stay. Accept this
   only if you want that line gone. This retires the behaviour delivered in SDLC-7.

## Not visible in the app
- Reduced motion: when the operating system's "reduce motion" setting is on, the star
  button's colour transition is disabled. An automated browser test checked this.
- No external fonts or files: an automated browser test confirmed the page loads only from
  the app itself.
