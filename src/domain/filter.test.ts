import { TASKS } from "../data/tasks";
import { filterTasks, sortTasks } from "./filter";

describe("filterTasks", () => {
  it("returns every task for 'all'", () => {
    expect(filterTasks(TASKS, { status: "all", starredOnly: false, starredIds: new Set() })).toHaveLength(
      TASKS.length,
    );
  });

  it("filters by status without mutating input", () => {
    const before = [...TASKS];
    const done = filterTasks(TASKS, { status: "done", starredOnly: false, starredIds: new Set() });
    expect(done.every((t) => t.status === "done")).toBe(true);
    expect(TASKS).toEqual(before);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTasks([], { status: "todo", starredOnly: false, starredIds: new Set() })).toEqual([]);
  });

  it("filters to starred tasks only when starredOnly is true", () => {
    const before = [...TASKS];
    const starred = filterTasks(TASKS, {
      status: "all",
      starredOnly: true,
      starredIds: new Set(["t-002", "t-006"]),
    });
    expect(starred.map((t) => t.id).sort()).toEqual(["t-002", "t-006"]);
    expect(TASKS).toEqual(before);
  });

  it("combines status and starredOnly filters", () => {
    const result = filterTasks(TASKS, {
      status: "in_progress",
      starredOnly: true,
      starredIds: new Set(["t-002", "t-010"]),
    });
    expect(result.map((t) => t.id)).toEqual(["t-002", "t-010"]);
  });

  it("returns an empty list when starredOnly is true and starredIds is empty", () => {
    expect(filterTasks(TASKS, { status: "all", starredOnly: true, starredIds: new Set() })).toEqual([]);
  });
});

describe("sortTasks", () => {
  it("orders by priority then title with a stable tiebreak", () => {
    const sorted = sortTasks(TASKS);
    expect(sorted[0]?.priority).toBe("high");
    expect(sorted.at(-1)?.priority).toBe("low");
    const highs = sorted.filter((t) => t.priority === "high").map((t) => t.title);
    expect(highs).toEqual([...highs].sort((a, b) => a.localeCompare(b)));
  });
});
