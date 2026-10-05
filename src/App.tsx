import { useMemo, useState } from "react";
import { TaskList } from "./components/TaskList";
import { TASKS } from "./data/tasks";
import { filterTasks, sortTasks, type StatusFilter } from "./domain/filter";
import type { Task } from "./domain/task";
import { type KeyValueStore, browserStore, loadStarred, saveStarred } from "./storage/starred";

interface Props {
  readonly tasks?: readonly Task[];
  readonly store?: KeyValueStore;
}

const STATUS_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

function isStatusFilter(value: string): value is StatusFilter {
  return STATUS_OPTIONS.some((o) => o.value === value);
}

export function App({ tasks = TASKS, store = browserStore() }: Props) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [starred, setStarred] = useState<Set<string>>(() => loadStarred(store));
  const [search, setSearch] = useState("");

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, { status, starredOnly, starredIds: starred, search })),
    [tasks, status, starredOnly, starred, search],
  );

  function toggleStar(id: string) {
    setStarred((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveStarred(store, next);
      return next;
    });
  }

  return (
    <main>
      <h1>Task list</h1>
      <section aria-label="Welcome">HELLO WORLD</section>
      <div className="controls">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => {
            if (isStatusFilter(e.target.value)) setStatus(e.target.value);
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label htmlFor="starred-only-filter">Starred only</label>
        <input
          id="starred-only-filter"
          type="checkbox"
          checked={starredOnly}
          onChange={(e) => setStarredOnly(e.target.checked)}
        />
        <input
          id="search-filter"
          type="search"
          aria-label="Search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <p aria-live="polite">
        Showing {visible.length} of {tasks.length} tasks · {starred.size} starred
      </p>
      <TaskList tasks={visible} starred={starred} onToggleStar={toggleStar} />
    </main>
  );
}
