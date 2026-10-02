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

  const ALL = { status: "all", starredOnly: false, starredIds: new Set<string>() } as const;
  const ids = (tasks: readonly { id: string }[]) => tasks.map((t) => t.id);

  it("matches the title case-insensitively and ignores surrounding spaces", () => {
    expect(ids(filterTasks(TASKS, { ...ALL, search: "  ROTA " }))).toEqual(["t-004"]);
  });

  it("does not filter when the search is empty or only spaces", () => {
    expect(filterTasks(TASKS, { ...ALL, search: "" })).toHaveLength(TASKS.length);
    expect(filterTasks(TASKS, { ...ALL, search: "   " })).toHaveLength(TASKS.length);
  });

  it("matches the title only, not the description", () => {
    expect(ids(filterTasks(TASKS, { ...ALL, search: "draft" }))).toEqual(["t-001"]);
  });

  it("keeps inner spaces in the search text", () => {
    expect(ids(filterTasks(TASKS, { ...ALL, search: "support rota" }))).toEqual(["t-004"]);
    expect(filterTasks(TASKS, { ...ALL, search: "supportrota" })).toEqual([]);
    expect(filterTasks(TASKS, { ...ALL, search: "support  rota" })).toEqual([]);
  });

  it("combines search with status and starredOnly", () => {
    const before = [...TASKS];
    const result = filterTasks(TASKS, {
      status: "in_progress",
      starredOnly: true,
      starredIds: new Set(["t-002", "t-006", "t-010"]),
      search: "re",
    });
    expect(ids(result)).toEqual(["t-002", "t-006"]);
    expect(TASKS).toEqual(before);
  });

  it("returns an empty list for an empty input with a search", () => {
    expect(filterTasks([], { ...ALL, search: "rota" })).toEqual([]);
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
