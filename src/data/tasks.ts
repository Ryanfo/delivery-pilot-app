import type { Task } from "../domain/task";

/** Synthetic fixture data. No real people, customers or external services. */
export const TASKS: readonly Task[] = [
  { id: "t-001", title: "Draft onboarding checklist", description: "Collect the steps a new starter needs in week one.", status: "todo", priority: "high", due: "2026-10-09" },
  { id: "t-002", title: "Review quarterly roadmap", description: "Read the draft roadmap and leave comments.", status: "in_progress", priority: "medium" },
  { id: "t-003", title: "Book team retrospective", description: "Find a slot that works for everyone.", status: "todo", priority: "low" },
  { id: "t-004", title: "Update support rota", description: "Swap the October cover between the two teams.", status: "done", priority: "medium" },
  { id: "t-005", title: "Archive old design files", description: "Move superseded mock-ups into the archive folder.", status: "todo", priority: "low" },
  { id: "t-006", title: "Prepare demo environment", description: "Reset sample data before the stakeholder demo.", status: "in_progress", priority: "high", due: "2026-10-05" },
  { id: "t-007", title: "Write release notes", description: "Summarise user-facing changes for the next release.", status: "todo", priority: "medium" },
  { id: "t-008", title: "Fix flaky login test", description: "Investigate the intermittent timeout in the login suite.", status: "done", priority: "high" },
  { id: "t-009", title: "Order replacement keyboards", description: "Two keyboards on the second floor need replacing.", status: "todo", priority: "low" },
  { id: "t-010", title: "Plan accessibility audit", description: "Agree scope and dates with the accessibility specialist.", status: "in_progress", priority: "medium" },
  { id: "t-011", title: "Tidy shared drive permissions", description: "Remove access for people who have left the project.", status: "todo", priority: "high" },
  { id: "t-012", title: "Collect feedback on prototype", description: "Run five short sessions and record findings.", status: "done", priority: "low" },
];
