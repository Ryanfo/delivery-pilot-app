import { type KeyValueStore, STARRED_KEY, loadStarred, saveStarred } from "./starred";

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

describe("starred storage", () => {
  it("round-trips IDs", () => {
    const store = memory();
    expect(saveStarred(store, new Set(["t-2", "t-1"]))).toBe(true);
    expect(store.data[STARRED_KEY]).toBe('["t-1","t-2"]');
    expect(loadStarred(store)).toEqual(new Set(["t-1", "t-2"]));
  });

  it("treats corrupt storage as empty", () => {
    expect(loadStarred(memory({ [STARRED_KEY]: "{not json" }))).toEqual(new Set());
    expect(loadStarred(memory({ [STARRED_KEY]: '{"a":1}' }))).toEqual(new Set());
    expect(loadStarred(memory({ [STARRED_KEY]: '["ok", 3, null]' }))).toEqual(new Set(["ok"]));
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
    expect(loadStarred(throwing)).toEqual(new Set());
    expect(saveStarred(throwing, new Set(["x"]))).toBe(false);
    expect(loadStarred(undefined)).toEqual(new Set());
  });
});
