export interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const RGB_PATTERN = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/;

function parseAlpha(value: string | undefined): number {
  if (value === undefined) return 1;
  return value.endsWith("%") ? Number(value.slice(0, -1)) / 100 : Number(value);
}

/** Parses a computed CSS colour in `rgb()` or `rgba()` form. */
export function parseRgb(css: string): Rgba {
  const match = RGB_PATTERN.exec(css.trim());
  if (!match) throw new Error(`Unsupported colour: ${css}`);
  const [, r, g, b, a] = match;
  return { r: Number(r), g: Number(g), b: Number(b), a: parseAlpha(a) };
}

function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ r, g, b }: Rgba): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** WCAG 2.1 contrast ratio between two opaque computed colours. */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(parseRgb(fg));
  const l2 = relativeLuminance(parseRgb(bg));
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}
