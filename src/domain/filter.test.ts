import { TASKS } from "../data/tasks";
import { filterTasks, sortTasks } from "./filter";

describe("filterTasks", () => {
  it("returns every task for 'all'", () => {
    expect(filterTasks(TASKS, { status: "all" })).toHaveLength(TASKS.length);
  });

  it("filters by status without mutating input", () => {
    const before = [...TASKS];
    const done = filterTasks(TASKS, { status: "done" });
    expect(done.every((t) => t.status === "done")).toBe(true);
    expect(TASKS).toEqual(before);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTasks([], { status: "todo" })).toEqual([]);
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
