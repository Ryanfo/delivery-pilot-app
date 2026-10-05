import type { Task, TaskStatus } from "./task";

export type StatusFilter = TaskStatus | "all";

export interface TaskQuery {
  readonly status: StatusFilter;
  readonly starredOnly: boolean;
  readonly starredIds: ReadonlySet<string>;
  readonly search: string;
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

/** Case-insensitive title substring match; surrounding whitespace in the search is ignored. */
export function matchesSearch(title: string, search: string): boolean {
  const needle = search.trim();
  if (needle === "") return true;
  return title.toLowerCase().includes(needle.toLowerCase());
}

/** Pure filtering: never mutates the input. */
export function filterTasks(tasks: readonly Task[], query: TaskQuery): Task[] {
  return tasks.filter(
    (task) =>
      (query.status === "all" || task.status === query.status) &&
      (!query.starredOnly || query.starredIds.has(task.id)) &&
      matchesSearch(task.title, query.search),
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
