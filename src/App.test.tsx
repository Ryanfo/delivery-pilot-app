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
  it("shows the welcome block with the exact text HELLO WORLD", () => {
    render(<App store={memory()} />);
    expect(screen.getByRole("region", { name: "Welcome" })).toHaveTextContent("HELLO WORLD");
  });

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

  it("shows a 'Starred only' checkbox, labelled and unticked by default (AC1)", () => {
    render(<App store={memory()} />);
    const checkbox = screen.getByRole("checkbox", { name: "Starred only" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("narrows the list to starred tasks only when ticked (AC2)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.click(screen.getByRole("button", { name: "Star Draft onboarding checklist" }));
    await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
    const items = within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Draft onboarding checklist");
  });

  it("combines 'Starred only' with the status filter (AC3)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.click(screen.getByRole("button", { name: "Star Review quarterly roadmap" }));
    await user.click(screen.getByRole("button", { name: "Star Draft onboarding checklist" }));
    await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
    await user.selectOptions(screen.getByLabelText("Status"), "in_progress");
    const items = within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Review quarterly roadmap");
  });

  it("removes an unstarred task immediately while 'Starred only' is ticked (AC4)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.click(screen.getByRole("button", { name: "Star Draft onboarding checklist" }));
    await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
    expect(screen.getByRole("list", { name: "Tasks" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Unstar Draft onboarding checklist" }));
    expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
  });

  it("shows the empty-state message when the combined filters match nothing (AC5)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
    expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
  });

  it("updates the 'Showing X of Y tasks' count for the combined filter (AC6)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.click(screen.getByRole("button", { name: "Star Draft onboarding checklist" }));
    await user.click(screen.getByRole("button", { name: "Star Review quarterly roadmap" }));
    await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
    expect(screen.getByText(`Showing 2 of ${TASKS.length} tasks`, { exact: false })).toBeInTheDocument();
  });

  it("toggles the 'Starred only' checkbox via keyboard focus and Space (AC7)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    const checkbox = screen.getByRole("checkbox", { name: "Starred only" });
    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
  });

  it("shows a single level-1 heading reading exactly 'My tasks' (SDLC-12 AC1)", () => {
    render(<App store={memory()} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "My tasks" })).toBeInTheDocument();
  });

  it("no longer shows 'Task list' as a page heading (SDLC-12 AC2)", () => {
    render(<App store={memory()} />);
    expect(screen.queryByRole("heading", { name: /task list/i })).not.toBeInTheDocument();
  });

  it("keeps the welcome block, filters, count line and task list unchanged (SDLC-12 AC3)", () => {
    render(<App store={memory()} />);
    expect(screen.getByRole("region", { name: "Welcome" })).toHaveTextContent("HELLO WORLD");
    expect(screen.getByRole("combobox", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Starred only" })).not.toBeChecked();
    expect(
      screen.getByText(`Showing ${TASKS.length} of ${TASKS.length} tasks · 0 starred`),
    ).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem")).toHaveLength(
      TASKS.length,
    );
  });
});
