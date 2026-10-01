import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { TASKS } from "./data/tasks";
import type { KeyValueStore } from "./storage/starred";

function memory(): KeyValueStore {
  const data: Record<string, string> = {};
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
}

describe("App", () => {
  it("lists every task with a labelled status filter", () => {
    render(<App store={memory()} />);
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem")).toHaveLength(
      TASKS.length,
    );
  });

  it("filters by status and shows an explicit empty state", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} tasks={TASKS.filter((t) => t.status !== "done")} />);
    await user.selectOptions(screen.getByLabelText("Status"), "done");
    expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
  });

  it("stars a task with the keyboard and persists it", async () => {
    const user = userEvent.setup();
    const store = memory();
    const { unmount } = render(<App store={store} />);
    const button = screen.getByRole("button", { name: "Star Draft onboarding checklist" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Unstar Draft onboarding checklist" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    unmount();
    render(<App store={store} />);
    expect(screen.getByRole("button", { name: "Unstar Draft onboarding checklist" })).toBeInTheDocument();
  });
});
