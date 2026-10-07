import { STATUS_LABELS, TASK_STATUSES, type Task, type TaskStatus, isTaskStatus } from "../domain/task";

interface Props {
  readonly tasks: readonly Task[];
  readonly starred: ReadonlySet<string>;
  readonly onToggleStar: (id: string) => void;
  readonly onChangeStatus: (id: string, status: TaskStatus) => void;
}

export function TaskList({ tasks, starred, onToggleStar, onChangeStatus }: Props) {
  if (tasks.length === 0) {
    return <p role="status" className="empty-state">No tasks match the current filter.</p>;
  }
  return (
    <ul aria-label="Tasks" className="task-list">
      {tasks.map((task) => {
        const isStarred = starred.has(task.id);
        const statusId = `task-status-${task.id}`;
        return (
          <li key={task.id} data-testid={`task-${task.id}`} className="task">
            <h2 className="task-title">{task.title}</h2>
            <p className="task-description">{task.description}</p>
            <p className="task-meta">
              <span>{STATUS_LABELS[task.status]}</span> · <span>Priority: {task.priority}</span>
              {task.due ? <span> · Due {task.due}</span> : null}
            </p>
            <div className="task-actions">
              <button
                type="button"
                className="star-button"
                aria-pressed={isStarred}
                aria-label={`${isStarred ? "Unstar" : "Star"} ${task.title}`}
                onClick={() => onToggleStar(task.id)}
              >
                {isStarred ? "★ Starred" : "☆ Star"}
              </button>
              <label htmlFor={statusId} className="task-status-label">
                Status <span className="visually-hidden">for {task.title}</span>
              </label>
              <select
                id={statusId}
                value={task.status}
                onChange={(e) => {
                  if (isTaskStatus(e.target.value)) onChangeStatus(task.id, e.target.value);
                }}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
