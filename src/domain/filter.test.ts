import { TASKS } from "../data/tasks";
import { filterTasks, matchesSearch, sortTasks } from "./filter";

describe("filterTasks", () => {
  it("returns every task for 'all'", () => {
    expect(
      filterTasks(TASKS, { status: "all", starredOnly: false, starredIds: new Set(), search: "" }),
    ).toHaveLength(TASKS.length);
  });

  it("filters by status without mutating input", () => {
    const before = [...TASKS];
    const done = filterTasks(TASKS, { status: "done", starredOnly: false, starredIds: new Set(), search: "" });
    expect(done.every((t) => t.status === "done")).toBe(true);
    expect(TASKS).toEqual(before);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTasks([], { status: "todo", starredOnly: false, starredIds: new Set(), search: "" })).toEqual([]);
  });

  it("filters to starred tasks only when starredOnly is true", () => {
    const before = [...TASKS];
    const starred = filterTasks(TASKS, {
      status: "all",
      starredOnly: true,
      starredIds: new Set(["t-002", "t-006"]),
      search: "",
    });
    expect(starred.map((t) => t.id).sort()).toEqual(["t-002", "t-006"]);
    expect(TASKS).toEqual(before);
  });

  it("combines status and starredOnly filters", () => {
    const result = filterTasks(TASKS, {
      status: "in_progress",
      starredOnly: true,
      starredIds: new Set(["t-002", "t-010"]),
      search: "",
    });
    expect(result.map((t) => t.id)).toEqual(["t-002", "t-010"]);
  });

  it("returns an empty list when starredOnly is true and starredIds is empty", () => {
    expect(
      filterTasks(TASKS, { status: "all", starredOnly: true, starredIds: new Set(), search: "" }),
    ).toEqual([]);
  });

  it("filters by title search ignoring case", () => {
    const base = { status: "all", starredOnly: false, starredIds: new Set<string>() } as const;
    expect(filterTasks(TASKS, { ...base, search: "review" }).map((t) => t.id)).toEqual(["t-002"]);
    expect(filterTasks(TASKS, { ...base, search: "REVIEW" }).map((t) => t.id)).toEqual(["t-002"]);
  });

  it("returns every title containing the search", () => {
    const result = filterTasks(TASKS, { status: "all", starredOnly: false, starredIds: new Set(), search: "re" });
    expect(result.map((t) => t.id).sort()).toEqual(["t-002", "t-003", "t-006", "t-007", "t-009", "t-011"]);
  });

  it("combines search with status and starredOnly", () => {
    const todo = filterTasks(TASKS, { status: "todo", starredOnly: false, starredIds: new Set(), search: "re" });
    expect(todo.map((t) => t.id).sort()).toEqual(["t-003", "t-007", "t-009", "t-011"]);
    const starredTodo = filterTasks(TASKS, {
      status: "todo",
      starredOnly: true,
      starredIds: new Set(["t-003", "t-001"]),
      search: "re",
    });
    expect(starredTodo.map((t) => t.id)).toEqual(["t-003"]);
  });
});

describe("matchesSearch", () => {
  it("matches every title when the search is empty", () => {
    expect(TASKS.every((t) => matchesSearch(t.title, ""))).toBe(true);
  });

  it("treats a whitespace-only search as empty", () => {
    expect(TASKS.every((t) => matchesSearch(t.title, "   "))).toBe(true);
  });

  it("ignores case", () => {
    expect(matchesSearch("Review quarterly roadmap", "REVIEW")).toBe(true);
    expect(matchesSearch("Review quarterly roadmap", "rEvIeW")).toBe(true);
  });

  it("ignores leading and trailing spaces", () => {
    expect(matchesSearch("Review quarterly roadmap", "  review  ")).toBe(true);
  });

  it("matches internal spaces literally", () => {
    expect(matchesSearch("Write release notes", "release notes")).toBe(true);
    expect(matchesSearch("Write release notes", "releasenotes")).toBe(false);
  });

  it("returns false when the title does not contain the search", () => {
    expect(matchesSearch("Review quarterly roadmap", "zzz")).toBe(false);
  });

  it("treats regex characters as plain text", () => {
    expect(TASKS.some((t) => matchesSearch(t.title, "("))).toBe(false);
    expect(TASKS.some((t) => matchesSearch(t.title, ".*"))).toBe(false);
    expect(matchesSearch("Fix (urgent) bug", "(urgent)")).toBe(true);
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
