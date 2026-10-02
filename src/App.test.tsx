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

  describe("search", () => {
    const listItems = () => within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
    const searchBox = () => screen.getByRole("textbox", { name: "Search" });

    it("shows an empty, labelled Search input in the filter controls row (search AC1)", () => {
      render(<App store={memory()} />);
      const search = searchBox();
      expect(search).toHaveValue("");
      expect(search.closest(".controls")).not.toBeNull();
      expect(search.closest(".controls")).toBe(screen.getByLabelText("Status").closest(".controls"));
      expect(listItems()).toHaveLength(TASKS.length);
    });

    it("reaches the Search input by keyboard after the other controls (search AC1)", async () => {
      const user = userEvent.setup();
      render(<App store={memory()} />);
      screen.getByRole("checkbox", { name: "Starred only" }).focus();
      await user.tab();
      expect(searchBox()).toHaveFocus();
      await user.keyboard("rota");
      expect(listItems()).toHaveLength(1);
      expect(listItems()[0]).toHaveTextContent("Update support rota");
    });

    it("filters by title as the user types, ignoring case and surrounding spaces (search AC2)", async () => {
      const user = userEvent.setup();
      render(<App store={memory()} />);
      await user.type(searchBox(), "  ROTA ");
      expect(listItems()).toHaveLength(1);
      expect(listItems()[0]).toHaveTextContent("Update support rota");
    });

    it("combines Search with Status and Starred only (search AC3)", async () => {
      const user = userEvent.setup();
      render(<App store={memory()} />);
      await user.type(searchBox(), "re");
      await user.selectOptions(screen.getByLabelText("Status"), "in_progress");
      expect(listItems().map((li) => within(li).getByRole("heading").textContent)).toEqual([
        "Prepare demo environment",
        "Review quarterly roadmap",
      ]);
      await user.click(screen.getByRole("button", { name: "Star Review quarterly roadmap" }));
      await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
      expect(listItems()).toHaveLength(1);
      await user.selectOptions(screen.getByLabelText("Status"), "all");
      expect(listItems()).toHaveLength(1);
      expect(listItems()[0]).toHaveTextContent("Review quarterly roadmap");
    });

    it("counts only tasks the search leaves visible, keeping total and starred counts (search AC4)", async () => {
      const user = userEvent.setup();
      const { container } = render(<App store={memory()} />);
      await user.click(screen.getByRole("button", { name: "Star Draft onboarding checklist" }));
      await user.type(searchBox(), "rota");
      expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
        `Showing 1 of ${TASKS.length} tasks · 1 starred`,
      );
    });

    it("shows the existing empty message and a zero count when the search matches nothing (search AC5)", async () => {
      const user = userEvent.setup();
      render(<App store={memory()} />);
      await user.type(searchBox(), "zzz");
      expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
      expect(screen.getByText(`Showing 0 of ${TASKS.length} tasks`, { exact: false })).toBeInTheDocument();
      await user.clear(searchBox());
      await user.type(searchBox(), "rota");
      await user.selectOptions(screen.getByLabelText("Status"), "todo");
      expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
    });

    it("restores the tasks allowed by the other filters when Search is cleared or blank (search AC6)", async () => {
      const user = userEvent.setup();
      render(<App store={memory()} />);
      await user.selectOptions(screen.getByLabelText("Status"), "done");
      await user.type(searchBox(), "rota");
      expect(listItems()).toHaveLength(1);
      await user.clear(searchBox());
      expect(listItems()).toHaveLength(3);
      expect(screen.getByText(`Showing 3 of ${TASKS.length} tasks`, { exact: false })).toBeInTheDocument();
      await user.type(searchBox(), "   ");
      expect(listItems()).toHaveLength(3);
    });
  });
});
