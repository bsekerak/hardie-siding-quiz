import type { Palette, SidingPlan } from "@/types/quiz";

export const QUICK_ADJUSTMENTS: ReadonlyArray<{ label: string; instruction: string }> = [
  {
    label: "Darker body color",
    instruction:
      "Darken the siding body color by roughly two shades, keeping the same hue family, and keep the trim and accent colors exactly as they are",
  },
  {
    label: "Lighter body color",
    instruction:
      "Lighten the siding body color by roughly two shades, keeping the same hue family, and keep the trim and accent colors exactly as they are",
  },
  {
    label: "Black windows",
    instruction:
      "Change the window frames and sashes to a matte black finish, keeping the siding, trim and every other element exactly as shown",
  },
  {
    label: "Board & batten gables",
    instruction:
      "Change only the gable ends above the main roofline to vertical board-and-batten siding in the same body color, leaving the main wall field as horizontal lap siding",
  },
  {
    label: "Evening light",
    instruction:
      "Change the lighting to early evening with warm exterior lighting on the facade and soft light in the windows, keeping every material, color and architectural detail exactly as shown",
  },
  {
    label: "Add shutters",
    instruction:
      "Add shutters flanking the front-facing windows in the accent color, sized correctly to half the window width, keeping everything else exactly as shown",
  },
];

/** Landscaping is a single on/off decision in the UI. */
export type LandscapingMode = "keep" | "clear";

function landscapingClause(mode: LandscapingMode): string {
  return mode === "keep"
    ? "LANDSCAPING: Preserve all existing landscaping exactly as it appears — every shrub, tree, planting bed, mulch, lawn, walkway, driveway and hardscape element must stay in place, unchanged in size, shape and position. "
    : "LANDSCAPING: Remove the shrubs and foundation plantings directly against the house so the siding is fully visible from the roofline down to grade. Replace them with clean, level mulch beds and tidy lawn. Keep trees, walkways, driveway and all hardscape exactly as they are. ";
}

/**
 * Builds the initial edit prompt from the quiz specification and the palette
 * tier the homeowner selected on the results page.
 */
export function buildSidingPrompt(
  plan: SidingPlan,
  palette: Palette,
  landscaping: LandscapingMode,
): string {
  const { spec } = plan;
  const body = palette.body.color;
  const trim = palette.trim.color;
  const accent = palette.accent.color;

  let prompt =
    `This is a photo of a house. Replace ALL of the existing exterior siding on every visible wall — ` +
    `remove the old cladding completely, including any damaged, mismatched or dated material — and install ` +
    `new James Hardie fiber cement siding in its place. `;

  prompt +=
    `SIDING: Install ${spec.primary.productLine} with a ${spec.primary.texture} texture, ` +
    `${spec.primary.exposure}, in James Hardie ColorPlus "${body.name}" — a ${body.hex} tone. ` +
    `The courses must be straight, evenly spaced and consistent across the whole facade. `;

  if (spec.accent && spec.accentPlacement) {
    prompt +=
      `ACCENT FIELD: Use ${spec.accent.productLine} on ${spec.accentPlacement.toLowerCase()}, ` +
      `in the same "${body.name}" body color so the change reads as texture rather than a second color. `;
  }

  prompt +=
    `TRIM: All corner boards, window and door casing, fascia and frieze boards in ` +
    `"${trim.name}" (${trim.hex}). Corner boards read approximately 5.5 inches wide and window casing ` +
    `approximately 3.5 inches wide. Trim must be crisp, straight and consistent. `;

  prompt +=
    `ACCENT: Paint the front door in "${accent.name}" (${accent.hex}). ` +
    `Use this accent color sparingly — the front door only, no more than about 10 percent of the visible facade. `;

  prompt += landscapingClause(landscaping);

  prompt +=
    `CRITICAL — DO NOT CHANGE: the roof and its color, the roofline and every gable shape, the window ` +
    `positions, sizes, shapes and glass, the door positions, the porch and columns, the chimney, the ` +
    `gutters and downspouts, the foundation, the camera angle, the perspective, the time of day and the ` +
    `lighting. The house must remain unmistakably THE SAME HOUSE — only the siding, trim and front door ` +
    `color may change. Do not add, remove, resize or move any window, door or architectural feature. ` +
    `Photorealistic, professionally finished, sharp focus, natural daylight, high quality.`;

  return prompt;
}

export function buildRefinementPrompt(
  plan: SidingPlan,
  palette: Palette,
  instruction: string,
): string {
  return (
    `This image shows a house re-clad in James Hardie ${plan.spec.primary.productLine} in ColorPlus ` +
    `"${palette.body.color.name}". Apply ONLY this one change: ${instruction}. ` +
    `CRITICAL — the output MUST be THE EXACT SAME HOUSE from the same camera angle and perspective, ` +
    `with the same roof, windows, doors, porch, landscaping and lighting. Change nothing except what ` +
    `the instruction asks for. Photorealistic, sharp focus, high quality.`
  );
}
