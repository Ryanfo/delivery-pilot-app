import type { TaskStatus } from "../domain/task";
import { type KeyValueStore, STARRED_KEY } from "./starred";
import { STATUS_KEY, loadStatuses, saveStatuses } from "./statuses";

function memory(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe("status storage", () => {
  it("round-trips statuses with sorted keys", () => {
    const store = memory();
    const statuses = new Map<string, TaskStatus>([
      ["t-004", "todo"],
      ["t-001", "in_progress"],
    ]);
    expect(saveStatuses(store, statuses)).toBe(true);
    expect(store.data[STATUS_KEY]).toBe('{"t-001":"in_progress","t-004":"todo"}');
    expect(loadStatuses(store)).toEqual(statuses);
  });

  it("loads an empty map when nothing is stored", () => {
    expect(loadStatuses(memory())).toEqual(new Map());
  });

  it("treats corrupt storage as empty", () => {
    for (const raw of ["{not json", "[]", '["t-001"]', "null", '"done"', "3"]) {
      expect(loadStatuses(memory({ [STATUS_KEY]: raw }))).toEqual(new Map());
    }
  });

  it("drops entries with an invalid status", () => {
    const raw = '{"t-001":"done","t-002":"blocked","t-003":1,"t-004":null,"t-005":"in_progress"}';
    expect(loadStatuses(memory({ [STATUS_KEY]: raw }))).toEqual(
      new Map([
        ["t-001", "done"],
        ["t-005", "in_progress"],
      ]),
    );
  });

  it("survives unavailable or throwing storage", () => {
    const throwing: KeyValueStore = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(loadStatuses(throwing)).toEqual(new Map());
    expect(saveStatuses(throwing, new Map([["t-001", "done"]]))).toBe(false);
    expect(loadStatuses(undefined)).toEqual(new Map());
    expect(saveStatuses(undefined, new Map([["t-001", "done"]]))).toBe(false);
  });

  it("does not touch stored stars", () => {
    const store = memory({ [STARRED_KEY]: '["t-001","t-002"]' });
    saveStatuses(store, new Map([["t-001", "done"]]));
    expect(store.data[STARRED_KEY]).toBe('["t-001","t-002"]');
    expect(Object.keys(store.data).sort()).toEqual([STARRED_KEY, STATUS_KEY].sort());
  });
});
