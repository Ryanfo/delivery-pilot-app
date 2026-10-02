import { expect, test } from "@playwright/test";

function relativeLuminance(hex: string): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match) throw new Error(`unexpected colour format: ${rgb}`);
  const [r, g, b] = match.map(Number);
  return `#${[r, g, b].map((c) => (c ?? 0).toString(16).padStart(2, "0")).join("")}`;
}

test("badge and body text meet 4.5:1 contrast", async ({ page }) => {
  await page.goto("/");
  const badge = page.locator(".badge").first();
  const badgeColours = await badge.evaluate((el) => {
    const style = getComputedStyle(el);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(contrastRatio(rgbToHex(badgeColours.color), rgbToHex(badgeColours.background))).toBeGreaterThanOrEqual(
    4.5,
  );

  const heading = page.getByRole("heading", { name: "Task list" });
  const headingColours = await heading.evaluate((el) => {
    const style = getComputedStyle(el);
    return { color: style.color, background: getComputedStyle(document.body).backgroundColor };
  });
  expect(
    contrastRatio(rgbToHex(headingColours.color), rgbToHex(headingColours.background)),
  ).toBeGreaterThanOrEqual(4.5);
});

test("status filter and star buttons show a focus outline on keyboard focus", async ({ page }) => {
  await page.goto("/");

  const select = page.getByLabel("Status");
  await select.focus();
  const selectOutline = await select.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(selectOutline).not.toBe("none");

  const starButton = page.getByRole("button", { name: "Star Draft onboarding checklist" });
  await starButton.focus();
  const buttonOutline = await starButton.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(buttonOutline).not.toBe("none");
});

test("page has no horizontal scroll at a 375px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Task list" })).toBeVisible();

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("a below-the-fold card reveals on scroll while every card stays present and reachable", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator(".task-card");
  await expect(cards).toHaveCount(12);

  const lastCard = cards.last();
  await expect(lastCard).toHaveCount(1);
  expect(await lastCard.isVisible()).toBe(true);

  await lastCard.scrollIntoViewIfNeeded();
  await expect(lastCard).toHaveClass(/task-card--visible/);
  await expect(cards).toHaveCount(12);
});

test("reveal is suppressed under prefers-reduced-motion: reduce", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const lastCard = page.locator(".task-card").last();
  const transition = await lastCard.evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(transition).toMatch(/^0s(,\s*0s)*$/);

  const opacity = await lastCard.evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe("1");
});
