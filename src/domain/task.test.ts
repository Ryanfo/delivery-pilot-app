import { TASKS } from "../data/tasks";
import { TASK_STATUSES, type Task, type TaskStatus, isTaskStatus, withStatuses } from "./task";

const tasks: readonly Task[] = [
  { id: "a", title: "Alpha", description: "", status: "todo", priority: "high" },
  { id: "b", title: "Beta", description: "", status: "done", priority: "low" },
  { id: "c", title: "Gamma", description: "", status: "in_progress", priority: "medium" },
];

describe("isTaskStatus", () => {
  it("isTaskStatus accepts only todo, in_progress and done", () => {
    expect(TASK_STATUSES).toEqual(["todo", "in_progress", "done"]);
    for (const status of TASK_STATUSES) expect(isTaskStatus(status)).toBe(true);
    for (const value of ["blocked", "", "Done", null, undefined, 1, {}]) expect(isTaskStatus(value)).toBe(false);
  });
});

describe("withStatuses", () => {
  it("returns the tasks unchanged for empty overrides", () => {
    expect(withStatuses(tasks, new Map())).toEqual(tasks);
    expect(withStatuses([], new Map([["a", "done"]]))).toEqual([]);
  });

  it("withStatuses applies overrides by ID without mutating the input", () => {
    const before = structuredClone(tasks);
    const result = withStatuses(tasks, new Map<string, TaskStatus>([["a", "in_progress"]]));
    expect(result.find((t) => t.id === "a")?.status).toBe("in_progress");
    expect(result.find((t) => t.id === "b")).toBe(tasks[1]);
    expect(result.find((t) => t.id === "c")).toBe(tasks[2]);
    expect(tasks).toEqual(before);
  });

  it("withStatuses keeps the input order", () => {
    const result = withStatuses(TASKS, new Map<string, TaskStatus>([["t-005", "done"], ["t-001", "in_progress"]]));
    expect(result.map((t) => t.id)).toEqual(TASKS.map((t) => t.id));
  });

  it("withStatuses ignores overrides for unknown task IDs", () => {
    const result = withStatuses(tasks, new Map<string, TaskStatus>([["zzz", "done"]]));
    expect(result).toEqual(tasks);
    expect(result).toHaveLength(tasks.length);
  });
});
