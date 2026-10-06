import { STATUS_LABELS, type Task } from "../domain/task";

interface Props {
  readonly tasks: readonly Task[];
  readonly starred: ReadonlySet<string>;
  readonly onToggleStar: (id: string) => void;
}

export function TaskList({ tasks, starred, onToggleStar }: Props) {
  if (tasks.length === 0) {
    return <p role="status" className="empty-state">No tasks match the current filter.</p>;
  }
  return (
    <ul aria-label="Tasks" className="task-list">
      {tasks.map((task) => {
        const isStarred = starred.has(task.id);
        return (
          <li key={task.id} data-testid={`task-${task.id}`} className="task">
            <h2 className="task-title">{task.title}</h2>
            <p className="task-description">{task.description}</p>
            <p className="task-meta">
              <span>{STATUS_LABELS[task.status]}</span> · <span>Priority: {task.priority}</span>
              {task.due ? <span> · Due {task.due}</span> : null}
            </p>
            <button
              type="button"
              className="star-button"
              aria-pressed={isStarred}
              aria-label={`${isStarred ? "Unstar" : "Star"} ${task.title}`}
              onClick={() => onToggleStar(task.id)}
            >
              {isStarred ? "★ Starred" : "☆ Star"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
