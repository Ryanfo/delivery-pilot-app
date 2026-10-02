import css from "./styles.css?raw";

describe("styles.css", () => {
  it("defines design tokens as CSS custom properties in a single stylesheet", () => {
    const root = css.match(/:root\s*{([^}]*)}/)?.[1] ?? "";
    expect(root).toMatch(/--color-bg:/);
    expect(root).toMatch(/--color-text:/);
    expect(root).toMatch(/--space-1:/);
    expect(root).toMatch(/--font-size-base:/);
  });

  it("defines a distinct colour for each status badge", () => {
    expect(css).toMatch(/\.badge--todo\s*{[^}]*background:\s*var\(--color-badge-todo-bg\)/);
    expect(css).toMatch(
      /\.badge--in_progress\s*{[^}]*background:\s*var\(--color-badge-in-progress-bg\)/,
    );
    expect(css).toMatch(/\.badge--done\s*{[^}]*background:\s*var\(--color-badge-done-bg\)/);
  });

  it("removes the card reveal transition under prefers-reduced-motion", () => {
    const reducedMotion = css.match(
      /@media \(prefers-reduced-motion: reduce\)\s*{([\s\S]*?)}\s*}/,
    )?.[1];
    expect(reducedMotion).toMatch(/transition:\s*none/);
  });
});
