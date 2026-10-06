import { expect, test, type Locator, type Page } from "@playwright/test";
import { contrastRatio } from "./support/contrast";

const PAPER = "rgb(247, 244, 238)";
const INK = "rgb(28, 27, 25)";
const MUTED = "rgb(92, 87, 80)";
const ACCENT = "rgb(163, 34, 43)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

interface Colours {
  readonly fg: string;
  readonly bg: string;
}

function px(value: string): number {
  return Number.parseFloat(value);
}

async function style(locator: Locator, property: string, pseudo?: string): Promise<string> {
  return locator.evaluate(
    (el, [prop, pseudoElement]) => getComputedStyle(el, pseudoElement ?? null).getPropertyValue(prop),
    [property, pseudo] as const,
  );
}

/** Text colour and the first non-transparent background behind the element. */
async function colours(locator: Locator, pseudo?: string): Promise<Colours> {
  return locator.evaluate((el, pseudoElement) => {
    const fg = getComputedStyle(el, pseudoElement ?? null).color;
    for (let node: Element | null = el; node; node = node.parentElement) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return { fg, bg };
    }
    return { fg, bg: "rgb(255, 255, 255)" };
  }, pseudo);
}

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error("element has no bounding box");
  return result;
}

async function attachScreenshot(page: Page, name: string) {
  await test.info().attach(name, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
}

function controls(page: Page) {
  return {
    statusLabel: page.locator('label[for="status-filter"]'),
    status: page.getByLabel("Status"),
    starredLabel: page.locator('label[for="starred-only-filter"]'),
    starredOnly: page.getByLabel("Starred only"),
    search: page.getByRole("searchbox", { name: "Search" }),
  };
}

test.describe("editorial styling (SDLC-17)", () => {
  test("contrast helper returns known WCAG ratios", () => {
    expect(contrastRatio("rgb(0, 0, 0)", "rgb(255, 255, 255)")).toBeCloseTo(21, 5);
    expect(contrastRatio("rgb(255, 255, 255)", "rgb(255, 255, 255)")).toBeCloseTo(1, 5);
    expect(contrastRatio("rgb(118, 118, 118)", "rgba(255, 255, 255, 1)")).toBeCloseTo(4.54, 2);
  });

  test("AC1 applies the bundled stylesheet with a paper background and ink text, loading nothing external", async ({
    page,
    baseURL,
  }) => {
    const requested: string[] = [];
    page.on("request", (request) => requested.push(request.url()));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Task list" })).toBeVisible();

    const body = page.locator("body");
    const background = await style(body, "background-color");
    const colour = await style(body, "color");
    expect(background).not.toBe("rgb(255, 255, 255)");
    expect(background).toBe(PAPER);
    expect(colour).not.toBe("rgb(0, 0, 0)");
    expect(colour).toBe(INK);
    expect(await page.evaluate(() => document.styleSheets.length)).toBeGreaterThan(0);

    const appOrigin = new URL(baseURL ?? page.url()).origin;
    expect(requested.length).toBeGreaterThan(0);
    for (const url of requested) expect(new URL(url).origin).toBe(appOrigin);
  });

  test("AC2 sets the masthead in a serif stack, larger than all other text, with a rule beneath", async ({ page }) => {
    await page.goto("/");
    const masthead = page.getByRole("heading", { level: 1, name: "Task list" });

    expect((await style(masthead, "font-family")).trim()).toMatch(/,\s*serif$/);
    expect(await style(masthead, "text-align")).toBe("center");
    expect(px(await style(masthead, "border-bottom-width"))).toBeGreaterThanOrEqual(1);
    expect(await style(masthead, "border-bottom-style")).not.toBe("none");

    const mastheadBox = await box(masthead);
    const mainBox = await box(page.locator("main"));
    expect(mastheadBox.x).toBeGreaterThanOrEqual(mainBox.x);
    expect(mastheadBox.x + mastheadBox.width).toBeLessThanOrEqual(mainBox.x + mainBox.width + 1);

    const mastheadSize = px(await style(masthead, "font-size"));
    const otherSizes = await page.locator("main").evaluate((main) => {
      const sizes: number[] = [];
      for (const el of main.querySelectorAll("*")) {
        if (el.tagName === "H1") continue;
        const hasText = Array.from(el.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
        );
        if (hasText || el.matches("input, select, button")) {
          sizes.push(Number.parseFloat(getComputedStyle(el).fontSize));
        }
      }
      return sizes;
    });
    expect(otherSizes.length).toBeGreaterThan(0);
    for (const size of otherSizes) expect(mastheadSize).toBeGreaterThan(size);
  });

  test("AC3 sets task titles in the masthead serif and descriptions at a readable size and line-height", async ({
    page,
  }) => {
    await page.goto("/");
    const mastheadFont = await style(page.getByRole("heading", { level: 1 }), "font-family");
    const titles = page.getByRole("list", { name: "Tasks" }).getByRole("heading", { level: 2 });
    await expect(titles).toHaveCount(12);
    for (const title of await titles.all()) expect(await style(title, "font-family")).toBe(mastheadFont);

    const descriptions = page.locator(".task-description");
    await expect(descriptions).toHaveCount(12);
    for (const description of await descriptions.all()) {
      const size = px(await style(description, "font-size"));
      const ratio = px(await style(description, "line-height")) / size;
      expect(size).toBeGreaterThanOrEqual(16);
      expect(ratio).toBeGreaterThanOrEqual(1.4);
      expect(ratio).toBeLessThanOrEqual(1.7);
      expect((await style(description, "font-family")).trim()).toMatch(/,\s*(serif|sans-serif)$/);
    }
  });

  test("AC4 styles control labels and task metadata as uppercase, letter-spaced, muted kicker text", async ({
    page,
  }) => {
    await page.goto("/");
    const { statusLabel, starredLabel } = controls(page);
    await expect(statusLabel).toHaveText("Status");
    await expect(starredLabel).toHaveText("Starred only");
    expect(await statusLabel.evaluate((el) => el.textContent)).toBe("Status");
    expect(await starredLabel.evaluate((el) => el.textContent)).toBe("Starred only");

    const bodySize = px(await style(page.locator(".task-description").first(), "font-size"));
    const kickers = [statusLabel, starredLabel, ...(await page.locator(".task-meta").all())];
    expect(kickers.length).toBe(14);
    for (const kicker of kickers) {
      expect(await style(kicker, "text-transform")).toBe("uppercase");
      expect(px(await style(kicker, "letter-spacing"))).toBeGreaterThan(0);
      expect(px(await style(kicker, "font-size"))).toBeLessThan(bodySize);
      expect(await style(kicker, "color")).toBe(MUTED);
    }
  });

  test("AC5 centres the content in a single column no wider than 48rem at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const main = await box(page.locator("main"));
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const rightMargin = viewportWidth - (main.x + main.width);

    expect(main.width).toBeLessThanOrEqual(768);
    expect(main.x).toBeGreaterThan(0);
    expect(Math.abs(main.x - rightMargin)).toBeLessThanOrEqual(1);

    const sections = [
      page.getByRole("heading", { level: 1 }),
      page.locator(".controls"),
      page.getByText(/^Showing \d+ of \d+ tasks/),
      page.getByRole("list", { name: "Tasks" }),
    ];
    for (const section of sections) {
      const b = await box(section);
      expect(b.x).toBeGreaterThanOrEqual(main.x);
      expect(b.x + b.width).toBeLessThanOrEqual(main.x + main.width + 1);
    }
    await attachScreenshot(page, "page-1280.png");
  });

  test("AC6 separates unbulleted tasks with thin rules and no card styling", async ({ page }) => {
    await page.goto("/");
    const list = page.getByRole("list", { name: "Tasks" });
    expect(await style(list, "list-style-type")).toBe("none");

    const items = await list.getByRole("listitem").all();
    expect(items.length).toBe(12);
    const first = items[0];
    if (!first) throw new Error("no tasks rendered");
    const paddingTop = await style(first, "padding-top");
    const paddingBottom = await style(first, "padding-bottom");
    for (const [index, item] of items.entries()) {
      expect(await style(item, "padding-top")).toBe(paddingTop);
      expect(await style(item, "padding-bottom")).toBe(paddingBottom);
      expect(await style(item, "box-shadow")).toBe("none");
      expect(await style(item, "border-radius")).toBe("0px");
      expect(await style(item, "background-color")).toBe(TRANSPARENT);
      if (index > 0) {
        const width = px(await style(item, "border-top-width"));
        expect(width).toBeGreaterThanOrEqual(1);
        expect(width).toBeLessThanOrEqual(2);
        expect(await style(item, "border-top-style")).toBe("solid");
      }
    }
  });

  test("AC7 keeps the controls on one row at 768px and wraps them without scrolling when narrower", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto("/");
    const c = controls(page);
    const rowBoxes = await Promise.all(
      [c.statusLabel, c.status, c.starredLabel, c.starredOnly, c.search].map((l) => box(l)),
    );
    const lowestTop = Math.max(...rowBoxes.map((b) => b.y));
    const highestBottom = Math.min(...rowBoxes.map((b) => b.y + b.height));
    expect(lowestTop).toBeLessThan(highestBottom);

    const bodyFont = await style(page.locator("body"), "font-family");
    expect(await style(c.status, "font-family")).toBe(bodyFont);
    expect(await style(c.search, "font-family")).toBe(bodyFont);

    await page.setViewportSize({ width: 480, height: 800 });
    const select = await box(c.status);
    const search = await box(c.search);
    expect(search.y).toBeGreaterThanOrEqual(select.y + select.height);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("AC8 distinguishes a starred task's button by accent colour and fill as well as text", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Star Draft onboarding checklist" }).click();
    const starred = page.getByRole("button", { name: "Unstar Draft onboarding checklist" });
    const unstarred = page.getByRole("button", { name: "Star Review quarterly roadmap" });

    await expect(starred).toHaveText("★ Starred");
    await expect(unstarred).toHaveText("☆ Star");
    await expect(starred).toHaveCSS("background-color", ACCENT);
    expect(await style(unstarred, "background-color")).toBe(TRANSPARENT);
    expect(await style(starred, "color")).not.toBe(await style(unstarred, "color"));
  });

  test("AC9 shows a 2px accent focus ring on every control reached by keyboard", async ({ page }) => {
    await page.goto("/");
    const c = controls(page);
    const firstStar = page.getByRole("list", { name: "Tasks" }).getByRole("button").first();
    for (const control of [c.status, c.starredOnly, c.search, firstStar]) {
      await page.keyboard.press("Tab");
      await expect(control).toBeFocused();
      expect(await style(control, "outline-style")).not.toBe("none");
      expect(px(await style(control, "outline-width"))).toBeGreaterThanOrEqual(2);
      expect(await style(control, "outline-color")).toBe(ACCENT);
      expect(contrastRatio(await style(control, "outline-color"), PAPER)).toBeGreaterThanOrEqual(3);
    }
  });

  test("AC10 meets WCAG AA contrast for all text, including placeholder and starred button", async ({ page }) => {
    await page.goto("/");
    const c = controls(page);
    const list = page.getByRole("list", { name: "Tasks" });
    await page.getByRole("button", { name: "Star Draft onboarding checklist" }).click();

    const large: Locator[] = [page.getByRole("heading", { level: 1 }), ...(await list.getByRole("heading").all())];
    const normal: Locator[] = [
      c.statusLabel,
      c.starredLabel,
      c.status,
      c.search,
      page.getByText(/^Showing \d+ of \d+ tasks/),
      ...(await page.locator(".task-description").all()),
      ...(await page.locator(".task-meta").all()),
      ...(await list.getByRole("button").all()),
    ];

    const checks: { colours: Colours; minimum: number }[] = [];
    for (const l of large) checks.push({ colours: await colours(l), minimum: 3 });
    for (const l of normal) checks.push({ colours: await colours(l), minimum: 4.5 });
    checks.push({ colours: await colours(c.search, "::placeholder"), minimum: 4.5 });

    await c.search.fill("zzz");
    checks.push({ colours: await colours(page.getByRole("status")), minimum: 4.5 });

    expect(checks.some((check) => check.colours.bg === ACCENT)).toBe(true);
    for (const { colours: pair, minimum } of checks) {
      expect(contrastRatio(pair.fg, pair.bg), `${pair.fg} on ${pair.bg}`).toBeGreaterThanOrEqual(minimum);
    }
  });

  test("AC11 has no horizontal scrolling and keeps controls usable at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    const c = controls(page);
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    const stars = await page.getByRole("list", { name: "Tasks" }).getByRole("button").all();
    for (const control of [c.status, c.starredOnly, c.search, ...stars]) {
      const b = await box(control);
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(320);
    }
    expect(px(await style(page.locator(".task-description").first(), "font-size"))).toBeGreaterThanOrEqual(16);
    await attachScreenshot(page, "page-320.png");

    await c.search.fill("review");
    await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(1);
  });

  test("AC12 styles the empty-state message as italic body text and keeps role=status", async ({ page }) => {
    await page.goto("/");
    await controls(page).search.fill("zzz");
    const empty = page.getByRole("status");
    await expect(empty).toHaveText("No tasks match the current filter.");
    expect(await style(empty, "font-family")).toBe(await style(page.locator("body"), "font-family"));
    expect(await style(empty, "font-style")).toBe("italic");
    expect(await style(empty, "color")).toBe(MUTED);
  });

  test("disables transitions when reduced motion is preferred", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const star = page.getByRole("list", { name: "Tasks" }).getByRole("button").first();
    expect(await style(star, "transition-duration")).toBe("0s");
  });
});
