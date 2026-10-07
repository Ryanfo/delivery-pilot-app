<!-- delivery provenance (written by the coordinator) -->
<!-- ticket: SDLC-18 | kind: acceptance_guide | revision: SDLC-18-verification-20261007T023134Z-65e9e6 | run: SDLC-18-verification-20261007T023134Z-65e9e6 -->
<!-- input_revision: bffd30684c3cbde8e3ba2fe60710cdf572fde521609f2edbef47177b2ff03ce6 | worker: ryan-mac -->
<!-- candidate_sha: 2a04e49986448304a3dbc9bf09c4733ea6140948 -->

# Acceptance guide

How to check each acceptance criterion by hand in the running app. For the person deciding
whether to accept the delivery; no knowledge of the code needed.

## Before you start
Nothing to set up: the app ships with 12 sample tasks (6 "To do", 3 "In progress", 3 "Done").
To start from a clean slate, open the browser's developer tools, go to Application → Local
storage and delete the entry `task-list:status:v1` (or use a private window). Each task now
has a small "STATUS" drop-down next to its star button. The "Status" drop-down at the top of
the page is the existing filter.

## AC1: Every task has its own status control
1. Open the app.
2. Look at the first task, "Draft onboarding checklist", and open its STATUS drop-down.
3. **You should see**: exactly "To do", "In progress" and "Done", with "To do" selected. Every
   other task has the same drop-down with its own status selected. (With a screen reader, the
   control is announced as "Status for Draft onboarding checklist".)

## AC2: Changing a status updates that task only
1. With the top filter on "All", set "Draft onboarding checklist" to "In progress".
2. **You should see**: its grey meta line now reads "In progress" straight away, with no page
   reload, and no other task's status changes.

## AC3: Under "All", the task stays put
1. Note the order of tasks and the line "Showing 12 of 12 tasks · N starred".
2. Change any task's status.
3. **You should see**: the task stays in the same place and the "Showing…" line is unchanged.

## AC4: Under a status filter, the task leaves the list
1. Set the top Status filter to "To do" ("Showing 6 of 12 tasks").
2. Change one of the listed tasks to "Done".
3. **You should see**: the task disappears at once and the line reads "Showing 5 of 12 tasks",
   with the starred count unchanged.
4. Keep changing the remaining "To do" tasks to another status until none are left.
5. **You should see**: "No tasks match the current filter."
6. Set the top filter to "Done".
7. **You should see**: the tasks you changed to "Done" listed there.

## AC5: Works with the keyboard alone
1. Press Tab until a task's "Star" button is focused, then press Tab once more.
2. **You should see**: a clear coloured outline around that task's status drop-down.
3. Use the arrow keys (or type the first letter, such as "D" for Done) to change the value.
4. **You should see**: the task's status changes as in AC2.

## AC6: Changes survive a reload
1. Change "Draft onboarding checklist" to "Done" and leave other tasks alone.
2. Reload the page.
3. **You should see**: that task still shows "Done" in its meta line and its drop-down; a task
   you didn't touch, such as "Review quarterly roadmap", still shows "In progress"; setting the
   top filter to "Done" lists 4 tasks with "Showing 4 of 12 tasks".

## AC7: Broken saved data does not break the page
1. In developer tools → Application → Local storage, set `task-list:status:v1` to `not json`
   (or to `{"t-001":"banana","nope":"done"}`).
2. Reload the page.
3. **You should see**: the page loads normally, every task shows its original status, and no
   error message appears. Changing a status still works.

Storage that is unavailable or full cannot easily be reproduced by hand; automated tests
simulate storage that throws on reading and on saving and confirm the page still works.

## AC8: Existing features still work alongside status changes
1. Star a task, then change its status.
2. Tick "Starred only", type part of its title into Search, and switch the top Status filter
   between "All" and the task's new status.
3. **You should see**: the filters combine as before using the new status, the starred count is
   right, and after a reload the star is still there.

## Not visible in the app
AC8's requirement that every criterion maps to a named test was checked by running the unit
and component tests (each criterion has a test named "SDLC-18 ACn") and by the coordinator's
browser test "changes a task's status and keeps it after a reload".
