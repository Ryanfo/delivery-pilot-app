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
  const [starred, setStarred] = useState<Set<string>>(() => loadStarred(store));

  const visible = useMemo(() => sortTasks(filterTasks(tasks, { status })), [tasks, status]);

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
    <main className="page">
      <h1 className="page-heading">Task list</h1>
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
      </div>
      <p className="live-status" aria-live="polite">
        Showing {visible.length} of {tasks.length} tasks · {starred.size} starred
      </p>
      <TaskList tasks={visible} starred={starred} onToggleStar={toggleStar} />
    </main>
  );
}
