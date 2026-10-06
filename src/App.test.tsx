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
  it("does not show the HELLO WORLD welcome block", () => {
    render(<App store={memory()} />);
    expect(screen.queryByRole("region", { name: "Welcome" })).not.toBeInTheDocument();
    expect(screen.queryByText("HELLO WORLD")).not.toBeInTheDocument();
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

  it("shows an empty Search input with a 'Search' placeholder and no visible label, alongside the other filters (SDLC-13 AC1)", () => {
    const { container } = render(<App store={memory()} />);
    const search = screen.getByRole("searchbox", { name: "Search" });
    expect(search).toHaveValue("");
    expect(search).toHaveAttribute("placeholder", "Search");
    expect(search).toHaveAttribute("aria-label", "Search");
    expect(container.querySelector('label[for="search-filter"]')).toBeNull();
    expect(screen.queryByText("Search", { selector: "label" })).toBeNull();
    expect(search.parentElement).toBe(screen.getByLabelText("Status").parentElement);
    expect(search.parentElement).toBe(screen.getByRole("checkbox", { name: "Starred only" }).parentElement);
    expect(within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem")).toHaveLength(
      TASKS.length,
    );
  });

  it("reaches the Search input with Tab and types into it (SDLC-13 AC1)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    const search = screen.getByRole("searchbox", { name: "Search" });
    expect(search).not.toHaveFocus();
    screen.getByRole("checkbox", { name: "Starred only" }).focus();
    await user.tab();
    expect(search).toHaveFocus();
    await user.keyboard("review");
    expect(search).toHaveValue("review");
  });

  it("filters the list by title as the user types, ignoring case and surrounding spaces (SDLC-13 AC2)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    const search = screen.getByRole("searchbox", { name: "Search" });
    const items = () => within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");

    await user.type(search, "REVIEW");
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Review quarterly roadmap");

    await user.clear(search);
    await user.type(search, "  review  ");
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Review quarterly roadmap");

    await user.clear(search);
    await user.type(search, "re");
    expect(items()).toHaveLength(6);
  });

  it("combines Search with Status and Starred only, keeping each filter's value (SDLC-13 AC3)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    const items = () => within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
    await user.click(screen.getByRole("button", { name: "Star Review quarterly roadmap" }));
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "re");
    await user.selectOptions(screen.getByLabelText("Status"), "in_progress");
    expect(items()).toHaveLength(2);
    await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Review quarterly roadmap");
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("re");
    expect(screen.getByLabelText("Status")).toHaveValue("in_progress");
  });

  it("counts only the tasks the search leaves visible (SDLC-13 AC4)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.click(screen.getByRole("button", { name: "Star Draft onboarding checklist" }));
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "review");
    const count = screen.getByText(`Showing 1 of ${TASKS.length} tasks`, { exact: false });
    expect(count).toHaveTextContent(`Showing 1 of ${TASKS.length} tasks · 1 starred`);
    expect(count).toHaveAttribute("aria-live", "polite");
  });

  it("shows the existing empty-state message when the search matches nothing (SDLC-13 AC5)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "releasenotes");
    expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
    expect(screen.getByText(`Showing 0 of ${TASKS.length} tasks`, { exact: false })).toBeInTheDocument();
  });

  it("shows the tasks again when the search is cleared or left with only spaces (SDLC-13 AC6)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    const search = screen.getByRole("searchbox", { name: "Search" });
    const items = () => within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
    await user.selectOptions(screen.getByLabelText("Status"), "done");
    await user.type(search, "fix");
    expect(items()).toHaveLength(1);
    await user.clear(search);
    expect(items()).toHaveLength(3);
    expect(screen.getByText(`Showing 3 of ${TASKS.length} tasks`, { exact: false })).toBeInTheDocument();
    expect(search).toHaveValue("");
    expect(search).toHaveAttribute("placeholder", "Search");
    await user.type(search, "   ");
    expect(items()).toHaveLength(3);
  });
});

describe("App task status (SDLC-18)", () => {
  const items = () => within(screen.getByRole("list", { name: "Tasks" })).getAllByRole("listitem");
  const taskItem = (title: string) => {
    const item = items().find((li) => within(li).queryByRole("heading", { name: title }));
    if (!item) throw new Error(`task not listed: ${title}`);
    return item;
  };
  const statusControl = (title: string) => screen.getByRole("combobox", { name: `Status for ${title}` });
  const displayedStatus = (title: string) => taskItem(title).querySelector(".task-meta span")?.textContent;
  const results = () => screen.getByText(/^Showing \d+ of \d+ tasks/);

  it("gives every task a status control named for the task, offering the three statuses with the current one selected (SDLC-18 AC1)", () => {
    render(<App store={memory()} />);
    for (const task of TASKS) {
      const control = statusControl(task.title);
      expect(within(control).getAllByRole("option").map((o) => o.textContent)).toEqual([
        "To do",
        "In progress",
        "Done",
      ]);
      expect(control).toHaveValue(task.status);
      expect(within(taskItem(task.title)).getByRole("combobox")).toBe(control);
    }
    const label = document.querySelector(`label[for="${statusControl("Draft onboarding checklist").id}"]`);
    expect(label?.textContent).toBe("Status for Draft onboarding checklist");
    expect(label?.querySelector(".visually-hidden")?.textContent).toBe("for Draft onboarding checklist");
  });

  it("changes one task's displayed status without affecting other tasks (SDLC-18 AC2)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.selectOptions(statusControl("Draft onboarding checklist"), "in_progress");
    expect(displayedStatus("Draft onboarding checklist")).toBe("In progress");
    expect(statusControl("Draft onboarding checklist")).toHaveValue("in_progress");
    for (const task of TASKS.filter((t) => t.id !== "t-001")) {
      expect(statusControl(task.title)).toHaveValue(task.status);
    }
  });

  it("keeps the task in place and the results line unchanged under 'All' (SDLC-18 AC3)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    await user.click(screen.getByRole("button", { name: "Star Review quarterly roadmap" }));
    const order = items().map((li) => li.getAttribute("data-testid"));
    const line = results().textContent;
    expect(line).toBe(`Showing ${TASKS.length} of ${TASKS.length} tasks · 1 starred`);
    await user.selectOptions(statusControl("Draft onboarding checklist"), "done");
    expect(items().map((li) => li.getAttribute("data-testid"))).toEqual(order);
    expect(results().textContent).toBe(line);
  });

  it("removes a re-statused task from a filtered list and updates the count (SDLC-18 AC4)", async () => {
    const user = userEvent.setup();
    const tasks = TASKS.filter((t) => t.id === "t-001" || t.id === "t-004");
    render(<App store={memory()} tasks={tasks} />);
    await user.click(screen.getByRole("button", { name: "Star Update support rota" }));
    await user.selectOptions(screen.getByLabelText("Status"), "todo");
    expect(items()).toHaveLength(1);
    expect(results()).toHaveTextContent("Showing 1 of 2 tasks · 1 starred");

    await user.selectOptions(statusControl("Draft onboarding checklist"), "done");
    expect(screen.queryByRole("list", { name: "Tasks" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
    expect(results()).toHaveTextContent("Showing 0 of 2 tasks · 1 starred");
    expect(results()).toHaveAttribute("aria-live", "polite");

    await user.selectOptions(screen.getByLabelText("Status"), "done");
    expect(items().map((li) => within(li).getByRole("heading").textContent)).toEqual([
      "Draft onboarding checklist",
      "Update support rota",
    ]);
    expect(results()).toHaveTextContent("Showing 2 of 2 tasks · 1 starred");
  });

  it("changes a task's status with the keyboard (SDLC-18 AC5)", async () => {
    const user = userEvent.setup();
    render(<App store={memory()} />);
    screen.getByRole("button", { name: "Star Draft onboarding checklist" }).focus();
    await user.tab();
    const control = statusControl("Draft onboarding checklist");
    expect(control).toHaveFocus();
    // jsdom does not emulate arrow keys on a native select; e2e/app.spec.ts covers real keystrokes.
    await user.selectOptions(control, "in_progress");
    expect(control).toHaveFocus();
    expect(control).toHaveValue("in_progress");
    expect(displayedStatus("Draft onboarding checklist")).toBe("In progress");
  });

  it("restores changed statuses after remount, leaving other tasks at their fixture status (SDLC-18 AC6)", async () => {
    const user = userEvent.setup();
    const store = memory();
    const { unmount } = render(<App store={store} />);
    await user.selectOptions(statusControl("Draft onboarding checklist"), "done");
    await user.selectOptions(statusControl("Update support rota"), "todo");
    unmount();

    render(<App store={store} />);
    expect(displayedStatus("Draft onboarding checklist")).toBe("Done");
    expect(statusControl("Draft onboarding checklist")).toHaveValue("done");
    expect(displayedStatus("Update support rota")).toBe("To do");
    expect(statusControl("Update support rota")).toHaveValue("todo");
    for (const task of TASKS.filter((t) => t.id !== "t-001" && t.id !== "t-004")) {
      expect(statusControl(task.title)).toHaveValue(task.status);
    }
    await user.selectOptions(screen.getByLabelText("Status"), "done");
    const doneCount = TASKS.filter((t) => t.status === "done").length;
    expect(items()).toHaveLength(doneCount);
    expect(within(screen.getByRole("list", { name: "Tasks" })).getByRole("heading", { name: "Draft onboarding checklist" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Tasks" })).queryByRole("heading", { name: "Update support rota" })).toBeNull();
    expect(results()).toHaveTextContent(`Showing ${doneCount} of ${TASKS.length} tasks`);
  });

  it("falls back to fixture statuses when stored statuses are corrupt or storage throws (SDLC-18 AC7)", async () => {
    const user = userEvent.setup();
    const corrupt = memory();
    corrupt.setItem("task-list:status:v1", "{not json");
    const { unmount } = render(<App store={corrupt} />);
    for (const task of TASKS) expect(statusControl(task.title)).toHaveValue(task.status);
    unmount();

    const mixed = memory();
    mixed.setItem("task-list:status:v1", '{"t-001":"blocked","zzz":"done","t-002":"done"}');
    const second = render(<App store={mixed} />);
    expect(statusControl("Draft onboarding checklist")).toHaveValue("todo");
    expect(statusControl("Review quarterly roadmap")).toHaveValue("done");
    expect(items()).toHaveLength(TASKS.length);
    second.unmount();

    const throwing: KeyValueStore = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    render(<App store={throwing} />);
    for (const task of TASKS) expect(statusControl(task.title)).toHaveValue(task.status);
    await user.selectOptions(statusControl("Draft onboarding checklist"), "done");
    expect(displayedStatus("Draft onboarding checklist")).toBe("Done");
    expect(screen.getByRole("heading", { name: "Task list" })).toBeInTheDocument();
  });

  it("combines changed statuses with Starred only, search and the status filter (SDLC-18 AC8)", async () => {
    const user = userEvent.setup();
    const store = memory();
    render(<App store={store} />);
    await user.click(screen.getByRole("button", { name: "Star Review quarterly roadmap" }));
    await user.click(screen.getByRole("button", { name: "Star Draft onboarding checklist" }));
    const storedStars = store.getItem("task-list:starred:v1");
    await user.selectOptions(statusControl("Review quarterly roadmap"), "done");
    expect(store.getItem("task-list:starred:v1")).toBe(storedStars);

    await user.click(screen.getByRole("checkbox", { name: "Starred only" }));
    await user.selectOptions(screen.getByLabelText("Status"), "done");
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Review quarterly roadmap");
    expect(results()).toHaveTextContent(`Showing 1 of ${TASKS.length} tasks · 2 starred`);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "draft");
    expect(screen.getByRole("status")).toHaveTextContent("No tasks match the current filter.");
    await user.selectOptions(screen.getByLabelText("Status"), "todo");
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent("Draft onboarding checklist");
    expect(screen.getByRole("button", { name: "Unstar Draft onboarding checklist" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
