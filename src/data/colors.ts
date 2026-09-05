import type { HardieColor } from "@/types/quiz";

/**
 * ColorPlus® Technology reference set. Hex values are screen approximations for
 * layout purposes only — always confirm against a physical sample board before
 * ordering, since finish sheen and daylight shift perceived color noticeably.
 */
export const HARDIE_COLORS: readonly HardieColor[] = [
  { name: "Arctic White", hex: "#F3F2EE", collection: "Statement", undertone: "neutral", lightness: 95 },
  { name: "Sail Cloth", hex: "#E5E2D7", collection: "Statement", undertone: "warm", lightness: 89 },
  { name: "Light Mist", hex: "#DCDFDD", collection: "Statement", undertone: "cool", lightness: 87 },
  { name: "Pearl Gray", hex: "#C9CBC5", collection: "Statement", undertone: "cool", lightness: 79 },
  { name: "Cobble Stone", hex: "#C8BEA8", collection: "Statement", undertone: "warm", lightness: 76 },
  { name: "Sandstone Beige", hex: "#D6C7A7", collection: "Statement", undertone: "warm", lightness: 79 },
  { name: "Navajo Beige", hex: "#C4B394", collection: "Statement", undertone: "warm", lightness: 72 },
  { name: "Autumn Tan", hex: "#C2A780", collection: "Statement", undertone: "warm", lightness: 68 },
  { name: "Monterey Taupe", hex: "#9A8D7A", collection: "Statement", undertone: "warm", lightness: 57 },
  { name: "Gray Slate", hex: "#8D9195", collection: "Statement", undertone: "cool", lightness: 57 },
  { name: "Heathered Moss", hex: "#8B9078", collection: "Statement", undertone: "warm", lightness: 55 },
  { name: "Mountain Sage", hex: "#7D8B7B", collection: "Dream", undertone: "cool", lightness: 53 },
  { name: "Boothbay Blue", hex: "#7E93A2", collection: "Statement", undertone: "cool", lightness: 58 },
  { name: "Aged Pewter", hex: "#7B8284", collection: "Statement", undertone: "cool", lightness: 51 },
  { name: "Khaki Brown", hex: "#897961", collection: "Statement", undertone: "warm", lightness: 48 },
  { name: "Timber Bark", hex: "#6D6254", collection: "Statement", undertone: "warm", lightness: 40 },
  { name: "Woodstock Brown", hex: "#6A5A44", collection: "Statement", undertone: "warm", lightness: 36 },
  { name: "Evening Blue", hex: "#49596A", collection: "Statement", undertone: "cool", lightness: 35 },
  { name: "Iron Gray", hex: "#55575A", collection: "Statement", undertone: "cool", lightness: 35 },
  { name: "Chestnut Brown", hex: "#594533", collection: "Statement", undertone: "warm", lightness: 29 },
  { name: "Countrylane Red", hex: "#792B29", collection: "Statement", undertone: "warm", lightness: 26 },
  { name: "Rich Espresso", hex: "#493A31", collection: "Statement", undertone: "warm", lightness: 24 },
  { name: "Night Gray", hex: "#3B3E40", collection: "Statement", undertone: "cool", lightness: 24 },
  { name: "Deep Ocean", hex: "#2B3A48", collection: "Statement", undertone: "cool", lightness: 23 },
  { name: "Midnight Black", hex: "#212429", collection: "Statement", undertone: "neutral", lightness: 14 },
];

const COLOR_INDEX: ReadonlyMap<string, HardieColor> = new Map(
  HARDIE_COLORS.map((color) => [color.name, color]),
);

/**
 * Looks up a ColorPlus color by name. The color table is the single source of
 * truth, so an unknown name is a programming error rather than user input —
 * we fall back to Arctic White so rendering can never crash.
 */
export function color(name: string): HardieColor {
  const found = COLOR_INDEX.get(name);
  if (found) return found;
  const fallback = HARDIE_COLORS[0];
  if (!fallback) throw new Error("Color table is empty");
  return fallback;
}

/** HardieTrim® boards ship in a narrower ColorPlus range than the body boards. */
export const TRIM_COLOR_NAMES: readonly string[] = [
  "Arctic White",
  "Sail Cloth",
  "Cobble Stone",
  "Monterey Taupe",
  "Iron Gray",
  "Timber Bark",
  "Night Gray",
  "Midnight Black",
];

/**
 * Relative luminance per WCAG, used to decide whether a swatch needs light or
 * dark label text and to keep body/trim pairs from washing into each other.
 */
export function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const toLinear = (channel: number): number => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(Number.parseInt(clean.slice(0, 2), 16));
  const g = toLinear(Number.parseInt(clean.slice(2, 4), 16));
  const b = toLinear(Number.parseInt(clean.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = luminance(hexA);
  const b = luminance(hexB);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.45 ? "#1E293B" : "#FFFFFF";
}
