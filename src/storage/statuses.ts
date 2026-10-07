import { type TaskStatus, isTaskStatus } from "../domain/task";
import type { KeyValueStore } from "./starred";

/** Persistence boundary for user-changed task statuses. Corrupt or unavailable storage never breaks the UI. */
export const STATUS_KEY = "task-list:status:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadStatuses(store: KeyValueStore | undefined): Map<string, TaskStatus> {
  const statuses = new Map<string, TaskStatus>();
  if (!store) return statuses;
  try {
    const raw = store.getItem(STATUS_KEY);
    if (raw === null) return statuses;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return statuses;
    for (const [id, status] of Object.entries(parsed)) {
      if (isTaskStatus(status)) statuses.set(id, status);
    }
    return statuses;
  } catch {
    return new Map();
  }
}

export function saveStatuses(store: KeyValueStore | undefined, statuses: ReadonlyMap<string, TaskStatus>): boolean {
  if (!store) return false;
  try {
    const sorted = [...statuses].sort(([a], [b]) => a.localeCompare(b));
    store.setItem(STATUS_KEY, JSON.stringify(Object.fromEntries(sorted)));
    return true;
  } catch {
    return false;
  }
}
