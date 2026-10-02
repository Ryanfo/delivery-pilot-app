import type { Task, TaskStatus } from "./task";

export type StatusFilter = TaskStatus | "all";

export interface TaskQuery {
  readonly status: StatusFilter;
  readonly starredOnly: boolean;
  readonly starredIds: ReadonlySet<string>;
  /** Title substring, matched case-insensitively after trimming. Empty or blank matches every task. */
  readonly search?: string;
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

/** Pure filtering: never mutates the input. */
export function filterTasks(tasks: readonly Task[], query: TaskQuery): Task[] {
  const needle = (query.search ?? "").trim().toLowerCase();
  return tasks.filter(
    (task) =>
      (query.status === "all" || task.status === query.status) &&
      (!query.starredOnly || query.starredIds.has(task.id)) &&
      (needle === "" || task.title.toLowerCase().includes(needle)),
  );
}

/** Highest priority first, then title, with a stable ID tiebreak. */
export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id),
  );
}
