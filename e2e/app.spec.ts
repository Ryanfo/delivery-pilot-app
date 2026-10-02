import { expect, test } from "@playwright/test";

test("filters tasks and persists a starred task across reloads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Task list" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Welcome" })).toHaveText("HELLO WORLD");
  await page.getByLabel("Status").selectOption("done");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(3);
  await page.getByLabel("Status").selectOption("all");
  await page.getByRole("button", { name: "Star Draft onboarding checklist" }).press("Enter");
  await page.reload();
  await expect(page.getByRole("button", { name: "Unstar Draft onboarding checklist" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "Star Review quarterly roadmap" }).click();
  await page.getByLabel("Starred only").check();
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(2);

  await page.getByLabel("Status").selectOption("in_progress");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByRole("list", { name: "Tasks" })).toContainText("Review quarterly roadmap");

  await page.getByLabel("Starred only").uncheck();
  await page.getByLabel("Status").selectOption("all");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(12);
});

test("searches tasks by title alongside the other filters", async ({ page }) => {
  await page.goto("/");
  const items = page.getByRole("list", { name: "Tasks" }).getByRole("listitem");
  const search = page.getByRole("textbox", { name: "Search" });

  await search.fill("  ROTA ");
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("Update support rota");
  await expect(page.getByText("Showing 1 of 12 tasks")).toBeVisible();

  await page.getByLabel("Status").selectOption("todo");
  await expect(page.getByRole("status")).toHaveText("No tasks match the current filter.");
  await expect(page.getByText("Showing 0 of 12 tasks")).toBeVisible();

  await page.getByLabel("Status").selectOption("all");
  await search.clear();
  await expect(items).toHaveCount(12);
});
