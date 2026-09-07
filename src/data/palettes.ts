import { HARDIE_COLORS, TRIM_COLOR_NAMES, color, contrastRatio } from "@/data/colors";
import type {
  ColorFamily,
  HardieColor,
  Palette,
  PaletteRole,
  QuizAnswers,
} from "@/types/quiz";

/**
 * Colour NAMES here are the authentic James Hardie Statement Collection names —
 * they are what you actually order by, and what belongs on a contract.
 *
 * The hex values are screen approximations. James Hardie publishes its swatches
 * as photographs rather than CSS values, so no authoritative hex exists to cite;
 * these are matched by eye for layout only and the UI says so. Likewise there is
 * no public ColorPlus SKU to print, so `orderAs` gives the string that actually
 * identifies a colour to a dealer instead of inventing a code.
 */

export interface ColorFamilyDefinition {
  id: ColorFamily;
  label: string;
  /** Anchors are the family's signature colours, tried first as the body. */
  anchors: readonly string[];
  /** Additional members used to build three distinct palettes. */
  members: readonly string[];
  undertone: "warm" | "cool" | "mixed";
  note: string;
}

export const COLOR_FAMILIES: Readonly<Record<ColorFamily, ColorFamilyDefinition>> = {
  "classic-neutrals": {
    id: "classic-neutrals",
    label: "Classic Whites & Warm Neutrals",
    anchors: ["Arctic White", "Cobble Stone"],
    members: ["Sail Cloth", "Sandstone Beige", "Navajo Beige", "Autumn Tan", "Monterey Taupe"],
    undertone: "warm",
    note: "The lowest-regret family. It flatters almost every roof, and it is what a future buyer is least likely to want to change.",
  },
  "architectural-grays": {
    id: "architectural-grays",
    label: "Architectural Grays",
    anchors: ["Pearl Gray", "Iron Gray"],
    members: ["Light Mist", "Gray Slate", "Aged Pewter", "Night Gray"],
    undertone: "cool",
    note: "Crisp and current. Grays are at their best with black or bronze windows and a cool-toned roof; against warm brick they need careful handling.",
  },
  "earth-tones": {
    id: "earth-tones",
    label: "Nature-Inspired Earth Tones",
    anchors: ["Mountain Sage", "Timber Bark"],
    members: ["Heathered Moss", "Khaki Brown", "Woodstock Brown", "Chestnut Brown"],
    undertone: "warm",
    note: "Settles a house into a wooded or rural lot rather than announcing it. Reads quieter in person than it does on a screen.",
  },
  "coastal-blues": {
    id: "coastal-blues",
    label: "Coastal Blues",
    anchors: ["Boothbay Blue", "Evening Blue", "Deep Ocean"],
    members: ["Light Mist", "Pearl Gray"],
    undertone: "cool",
    note: "Cottage character without the kitsch. Blue is the one body colour where getting the depth right matters more than getting the hue right.",
  },
  "bold-dramatic": {
    id: "bold-dramatic",
    label: "Bold & Dramatic",
    anchors: ["Night Gray", "Iron Gray", "Countrylane Red"],
    members: ["Midnight Black", "Rich Espresso", "Deep Ocean"],
    undertone: "mixed",
    note: "High commitment, high reward. A dark body needs disciplined trim and good massing — it shows every wavy corner a cheap install leaves behind.",
  },
};

/* ------------------------- Fixed-element validation ------------------------- */

export interface FixedElements {
  temperature: "warm" | "cool" | "mixed" | "open";
  description: string;
}

/** Q13: the roof, masonry and windows the homeowner is keeping. */
export function readFixedElements(answers: QuizAnswers): FixedElements {
  const warm =
    (answers.roofTone === "warm-red-brown" ? 1 : 0) + (answers.masonry === "warm-brick" ? 1 : 0);
  const cool =
    (answers.roofTone === "cool-charcoal" ? 1 : 0) + (answers.masonry === "cool-gray-stone" ? 1 : 0);

  if (warm > 0 && cool === 0) {
    return {
      temperature: "warm",
      description: "a warm red-brown roof or warm brick that isn't changing",
    };
  }
  if (cool > 0 && warm === 0) {
    return { temperature: "cool", description: "cool-toned roof or masonry that isn't changing" };
  }
  if (warm > 0 && cool > 0) {
    return { temperature: "mixed", description: "both warm and cool fixed elements" };
  }
  return {
    temperature: "open",
    description:
      answers.roofTone === "replacing"
        ? "a roof you're replacing, so the siding leads"
        : "nothing fixed forcing your hand",
  };
}

/**
 * The family is the homeowner's active choice, so it is never overridden. The
 * fixed elements act as a filter WITHIN the family — choosing its warmest or
 * coolest members — and raise a warning only when the conflict is real.
 */
export function undertoneClashMessage(
  family: ColorFamilyDefinition,
  fixed: FixedElements,
): string | null {
  if (fixed.temperature === "warm" && family.undertone === "cool") {
    return `You chose ${family.label}, and you have ${fixed.description}. Cool grays and blues next to warm brick can read dirty rather than deliberate. We've selected the warmest members of this family to bridge that, but this is the one pairing to check against physical samples on the actual wall before you commit.`;
  }
  if (fixed.temperature === "cool" && family.undertone === "warm") {
    return `You chose ${family.label}, and you have ${fixed.description}. Warm beiges against a cool charcoal roof can read muddy. We've leaned toward the cooler, greiger members of this family — confirm on the wall in daylight.`;
  }
  return null;
}

/** Ranks family members by how well their undertone sits with what's staying. */
function harmonyScore(candidate: HardieColor, fixed: FixedElements): number {
  if (fixed.temperature === "warm") return candidate.undertone === "cool" ? 2 : 0;
  if (fixed.temperature === "cool") return candidate.undertone === "warm" ? 2 : 0;
  return 0;
}

/* --------------------------------- Trim ------------------------------------ */

function chooseTrim(body: HardieColor, answers: QuizAnswers): HardieColor {
  const candidates = TRIM_COLOR_NAMES.map((name) => color(name)).filter(
    (candidate) => candidate.name !== body.name,
  );

  if (answers.trimPreference === "tonal") {
    // Tonal trim sits close to the body — target roughly 1.6:1, same family feel.
    const tonal = [...candidates].sort(
      (a, b) =>
        Math.abs(contrastRatio(a.hex, body.hex) - 1.6) -
        Math.abs(contrastRatio(b.hex, body.hex) - 1.6),
    );
    return tonal[0] ?? color("Cobble Stone");
  }

  // High contrast: white trim on a mid-to-dark body, near-black on a light body.
  const preferred = body.lightness > 55 ? "Midnight Black" : "Arctic White";
  const candidate = color(preferred);
  if (contrastRatio(candidate.hex, body.hex) >= 3) return candidate;

  const ranked = [...candidates].sort(
    (a, b) => contrastRatio(b.hex, body.hex) - contrastRatio(a.hex, body.hex),
  );
  return ranked[0] ?? color("Arctic White");
}

function chooseAccent(body: HardieColor, trim: HardieColor, answers: QuizAnswers): HardieColor {
  const wantsDark = body.lightness > 50;
  const pool = HARDIE_COLORS.filter((candidate) => {
    if (candidate.name === body.name || candidate.name === trim.name) return false;
    if (answers.hoa === "hoa-historic" && candidate.collection !== "Statement") return false;
    return wantsDark ? candidate.lightness <= 36 : candidate.lightness >= 62;
  });
  const ranked = pool
    .map((candidate) => ({ candidate, score: contrastRatio(candidate.hex, body.hex) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.candidate ?? color("Midnight Black");
}

/* ------------------------------ Palette build ------------------------------- */

function role(
  swatch: HardieColor,
  sharePercent: number,
  roleLabel: string,
  placement: string,
): PaletteRole {
  return { color: swatch, sharePercent, roleLabel, placement };
}

/** The string a dealer can actually order from. Not a fabricated SKU. */
export function orderAs(swatch: HardieColor): string {
  return `ColorPlus® Technology · ${swatch.collection} Collection · "${swatch.name}"`;
}

const PALETTE_NAMES = ["The Safe Bet", "The Elevated Choice", "The Designer Move"] as const;
const PALETTE_TAGLINES = [
  "The most broadly approvable version of your family. Lowest regret, strongest resale.",
  "One step more considered — enough depth to look designed without becoming the house people describe by its colour.",
  "The confident end of your family. Best when your massing and trim can carry it.",
] as const;

export function buildPalettes(answers: QuizAnswers): Palette[] {
  const familyId = answers.colorFamily ?? "classic-neutrals";
  const family = COLOR_FAMILIES[familyId];
  const fixed = readFixedElements(answers);
  const warning = undertoneClashMessage(family, fixed);
  const hoaLocked = answers.hoa === "hoa-historic";

  const pool = [...family.anchors, ...family.members]
    .map((name) => color(name))
    .filter((candidate) => (hoaLocked ? candidate.collection === "Statement" : true));

  // Anchors first, then by harmony with what's staying, then light-to-dark so
  // the three palettes read as a deliberate progression.
  const ranked = [...pool].sort((a, b) => {
    const anchorDelta =
      (family.anchors.includes(a.name) ? 0 : 1) - (family.anchors.includes(b.name) ? 0 : 1);
    if (anchorDelta !== 0) return anchorDelta;
    const harmonyDelta = harmonyScore(a, fixed) - harmonyScore(b, fixed);
    if (harmonyDelta !== 0) return harmonyDelta;
    return b.lightness - a.lightness;
  });

  // The family's named anchors are its signature colours and always surface,
  // even when two of them sit close in lightness — Countrylane Red would
  // otherwise be filtered out behind Night Gray and never be offered at all.
  const bodies: HardieColor[] = [];
  for (const name of family.anchors) {
    if (bodies.length >= 3) break;
    const anchor = ranked.find((candidate) => candidate.name === name);
    if (anchor) bodies.push(anchor);
  }
  // Remaining slots prefer members that read as a distinct step from what's chosen.
  for (const candidate of ranked) {
    if (bodies.length >= 3) break;
    if (bodies.some((chosen) => chosen.name === candidate.name)) continue;
    if (bodies.every((chosen) => Math.abs(chosen.lightness - candidate.lightness) >= 8)) {
      bodies.push(candidate);
    }
  }
  for (const candidate of ranked) {
    if (bodies.length >= 3) break;
    if (!bodies.some((chosen) => chosen.name === candidate.name)) bodies.push(candidate);
  }
  while (bodies.length < 3) bodies.push(color("Cobble Stone"));

  // Present light-to-dark so the three read as a deliberate progression.
  bodies.sort((a, b) => b.lightness - a.lightness);

  return bodies.slice(0, 3).map((body, index) => {
    const trim = chooseTrim(body, answers);
    const accent = chooseAccent(body, trim, answers);
    const contrast = contrastRatio(body.hex, trim.hex);

    const rationale = [
      family.note,
      answers.trimPreference === "tonal"
        ? `${trim.name} sits close to ${body.name} at ${contrast.toFixed(1)}:1 — the trim reads as a quiet edge rather than an outline, which keeps the massing calm.`
        : `${trim.name} against ${body.name} is ${contrast.toFixed(1)}:1 — ${
            contrast >= 3
              ? "strong enough to read as deliberate architectural outline from the street."
              : "the strongest contrast this family allows without leaving it."
          }`,
      hoaLocked
        ? "Locked to the Statement Collection, which review boards approve most consistently."
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      id: `palette-${index + 1}`,
      name: PALETTE_NAMES[index] ?? "Curated Palette",
      tagline: PALETTE_TAGLINES[index] ?? "",
      family: familyId,
      familyLabel: family.label,
      body: role(body, 70, "Body", "Siding field on every elevation"),
      trim: role(trim, 20, "Trim", "Corner boards, window and door casing, fascia, frieze"),
      accent: role(accent, 10, "Accent", "Front door, shutters, or a single gable"),
      rationale,
      undertoneWarning: warning,
      hoaSafe: body.collection === "Statement" && trim.collection === "Statement",
    };
  });
}
