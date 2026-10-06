export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly due?: string;
}

export const STATUS_LABELS: Readonly<Record<TaskStatus, string>> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TASK_STATUSES: readonly TaskStatus[] = ["todo", "in_progress", "done"];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUSES.some((status) => status === value);
}

/** Applies status overrides by task ID; unknown IDs are ignored. Never mutates the input. */
export function withStatuses(tasks: readonly Task[], overrides: ReadonlyMap<string, TaskStatus>): Task[] {
  return tasks.map((task) => {
    const status = overrides.get(task.id);
    return status === undefined || status === task.status ? task : { ...task, status };
  });
}
