/** Persistence boundary for starred task IDs. Corrupt or unavailable storage never breaks the UI. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const STARRED_KEY = "task-list:starred:v1";

export function loadStarred(store: KeyValueStore | undefined): Set<string> {
  if (!store) return new Set();
  try {
    const raw = store.getItem(STARRED_KEY);
    if (raw === null) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

export function saveStarred(store: KeyValueStore | undefined, ids: ReadonlySet<string>): boolean {
  if (!store) return false;
  try {
    store.setItem(STARRED_KEY, JSON.stringify([...ids].sort()));
    return true;
  } catch {
    return false;
  }
}

export function browserStore(): KeyValueStore | undefined {
  try {
    return typeof window !== "undefined" ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}
