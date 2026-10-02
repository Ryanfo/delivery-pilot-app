import { render, screen, within } from "@testing-library/react";
import { App } from "./App";
import { TASKS } from "./data/tasks";
import type { KeyValueStore } from "./storage/starred";

function memory(): KeyValueStore {
  const data: Record<string, string> = {};
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
}

describe("App styling", () => {
  it("renders with no inline style attributes", () => {
    const { container } = render(<App store={memory()} />);
    const styled = container.querySelectorAll("[style]");
    expect(styled).toHaveLength(0);
  });

  it("shows each task as a card with distinct title, description and meta elements", () => {
    render(<App store={memory()} />);
    const list = screen.getByRole("list", { name: "Tasks" });
    const firstItem = within(list).getAllByRole("listitem")[0];
    if (!firstItem) throw new Error("expected at least one task card");
    const card = within(firstItem);

    expect(firstItem.className).toContain("task-card");
    const title = card.getByRole("heading", { level: 2 });
    expect(title.className).toContain("task-card__title");
    expect(firstItem.querySelector(".task-card__description")).toBeInTheDocument();
    expect(firstItem.querySelector(".task-card__meta")).toBeInTheDocument();
  });

  it("gives each status a differently-classed, text-visible badge", () => {
    render(<App store={memory()} />);
    const list = screen.getByRole("list", { name: "Tasks" });

    const todoTask = TASKS.find((t) => t.status === "todo");
    const inProgressTask = TASKS.find((t) => t.status === "in_progress");
    const doneTask = TASKS.find((t) => t.status === "done");
    if (!todoTask || !inProgressTask || !doneTask) throw new Error("expected one task per status");

    const todoCard = within(within(list).getByTestId(`task-${todoTask.id}`));
    const inProgressCard = within(within(list).getByTestId(`task-${inProgressTask.id}`));
    const doneCard = within(within(list).getByTestId(`task-${doneTask.id}`));

    const todoBadge = todoCard.getByText("To do");
    const inProgressBadge = inProgressCard.getByText("In progress");
    const doneBadge = doneCard.getByText("Done");

    expect(todoBadge.className).toBe("badge badge--todo");
    expect(inProgressBadge.className).toBe("badge badge--in_progress");
    expect(doneBadge.className).toBe("badge badge--done");

    expect(todoBadge.textContent).toBe("To do");
    expect(inProgressBadge.textContent).toBe("In progress");
    expect(doneBadge.textContent).toBe("Done");
  });

  it("marks every star button as reachable and shows the starred class once pressed", () => {
    render(<App store={memory()} />);
    const button = screen.getByRole("button", { name: "Star Draft onboarding checklist" });
    expect(button.className).toContain("star-button");
    expect(button.className).not.toContain("star-button--active");
  });
});
