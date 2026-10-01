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
