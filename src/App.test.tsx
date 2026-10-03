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
