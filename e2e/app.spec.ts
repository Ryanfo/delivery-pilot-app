import { expect, test } from "@playwright/test";

test("filters tasks and persists a starred task across reloads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Task list" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Welcome" })).toHaveCount(0);
  await page.getByLabel("Status", { exact: true }).selectOption("done");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(3);
  await page.getByLabel("Status", { exact: true }).selectOption("all");
  await page.getByRole("button", { name: "Star Draft onboarding checklist" }).press("Enter");
  await page.reload();
  await expect(page.getByRole("button", { name: "Unstar Draft onboarding checklist" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "Star Review quarterly roadmap" }).click();
  await page.getByLabel("Starred only").check();
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(2);

  await page.getByLabel("Status", { exact: true }).selectOption("in_progress");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByRole("list", { name: "Tasks" })).toContainText("Review quarterly roadmap");

  await page.getByLabel("Starred only").uncheck();
  await page.getByLabel("Status", { exact: true }).selectOption("all");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(12);
});

test("searches tasks by title combined with other filters", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search" });
  const items = page.getByRole("list", { name: "Tasks" }).getByRole("listitem");
  await expect(search).toBeVisible();
  await expect(search).toHaveValue("");
  await expect(search).toHaveAttribute("placeholder", "Search");
  await expect(page.locator('label[for="search-filter"]')).toHaveCount(0);

  await search.fill("REVIEW");
  await expect(items).toHaveCount(1);
  await expect(page.getByText("Showing 1 of 12 tasks")).toBeVisible();

  await search.fill("zzz");
  await expect(page.getByRole("status")).toHaveText("No tasks match the current filter.");
  await expect(page.getByText("Showing 0 of 12 tasks")).toBeVisible();

  await page.getByLabel("Status", { exact: true }).selectOption("in_progress");
  await search.fill("re");
  await expect(items).toHaveCount(2);

  await search.fill("");
  await expect(items).toHaveCount(3);
  await expect(search).toHaveValue("");

  await page.getByLabel("Status", { exact: true }).selectOption("all");
  await expect(items).toHaveCount(12);
});

test("changes a task's status and keeps it after a reload", async ({ page }) => {
  await page.goto("/");
  const items = page.getByRole("list", { name: "Tasks" }).getByRole("listitem");
  const control = page.getByRole("combobox", { name: "Status for Draft onboarding checklist" });
  const task = page.getByTestId("task-t-001");
  await expect(control).toHaveValue("todo");

  await page.getByRole("button", { name: "Star Draft onboarding checklist" }).focus();
  await page.keyboard.press("Tab");
  await expect(control).toBeFocused();
  await page.keyboard.type("Done");
  await expect(control).toHaveValue("done");
  await expect(task.locator(".task-meta")).toContainText("Done");
  await expect(page.getByText("Showing 12 of 12 tasks")).toBeVisible();

  await page.getByLabel("Status", { exact: true }).selectOption("todo");
  await expect(task).toHaveCount(0);
  await expect(items).toHaveCount(5);
  await page.getByLabel("Status", { exact: true }).selectOption("all");

  await page.reload();
  await expect(control).toHaveValue("done");
  await expect(task.locator(".task-meta")).toContainText("Done");
  await expect(page.getByRole("combobox", { name: "Status for Review quarterly roadmap" })).toHaveValue("in_progress");
  await page.getByLabel("Status", { exact: true }).selectOption("done");
  await expect(items).toHaveCount(4);
  await expect(task).toBeVisible();
  await expect(page.getByText("Showing 4 of 12 tasks")).toBeVisible();
});
