import { STATUS_LABELS, type Task } from "../domain/task";
import { useRevealOnScroll } from "./useRevealOnScroll";

interface Props {
  readonly tasks: readonly Task[];
  readonly starred: ReadonlySet<string>;
  readonly onToggleStar: (id: string) => void;
}

interface TaskCardProps {
  readonly task: Task;
  readonly isStarred: boolean;
  readonly onToggleStar: (id: string) => void;
}

function TaskCard({ task, isStarred, onToggleStar }: TaskCardProps) {
  const { ref, isVisible } = useRevealOnScroll<HTMLLIElement>();
  const cardClassName = `task-card${isVisible ? " task-card--visible" : ""}`;

  return (
    <li ref={ref} className={cardClassName} data-testid={`task-${task.id}`}>
      <h2 className="task-card__title">{task.title}</h2>
      <p className="task-card__description">{task.description}</p>
      <p className="task-card__meta">
        <span className={`badge badge--${task.status}`}>{STATUS_LABELS[task.status]}</span> ·{" "}
        <span>Priority: {task.priority}</span>
        {task.due ? <span> · Due {task.due}</span> : null}
      </p>
      <button
        type="button"
        className={`star-button${isStarred ? " star-button--active" : ""}`}
        aria-pressed={isStarred}
        aria-label={`${isStarred ? "Unstar" : "Star"} ${task.title}`}
        onClick={() => onToggleStar(task.id)}
      >
        {isStarred ? "★ Starred" : "☆ Star"}
      </button>
    </li>
  );
}

export function TaskList({ tasks, starred, onToggleStar }: Props) {
  if (tasks.length === 0) {
    return <p role="status">No tasks match the current filter.</p>;
  }
  return (
    <ul aria-label="Tasks" className="task-list">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} isStarred={starred.has(task.id)} onToggleStar={onToggleStar} />
      ))}
    </ul>
  );
}
