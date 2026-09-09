import { describeColor } from "@/data/colors";
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
    ? "LANDSCAPING — CRITICAL, THIS IS THE MOST COMMONLY GOT WRONG: Every living plant in the original photo MUST still be there in the output, in the same position and at the same size. Reproduce each shrub, bush, ornamental tree, flower, planter, window box and container exactly where it stands, along with the mulch beds, edging stones, decorative boulders, lawn, walkway and driveway. Do not tidy, thin, prune, simplify or clear the planting beds. Do not replace plants with bare mulch. A bed that is full of greenery in the input must be equally full of the same greenery in the output. Only add landscaping that is not already visible if the area is genuinely bare, in which case leave it bare. "
    : "LANDSCAPING: Remove EVERY shrub, bush, flower, planter, window box and foundation planting from against the house, so the wall is completely unobstructed and the siding is visible in one clean run from the roofline all the way down to grade. Replace all of it with flat, freshly-raked dark mulch. Also remove decorative boulders and edging stones along the bed. Keep the lawn, walkway, driveway, steps and mature background trees exactly as they are, and do not add any new plantings or features. ";
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
    `${spec.primary.exposure}, in James Hardie ColorPlus "${body.name}". ` +
    `That colour is ${describeColor(body)} — hex ${body.hex}. Match that description closely; ` +
    `do not render it more saturated or more vivid than described. ` +
    `The courses must be straight, evenly spaced and consistent across the whole facade. `;

  if (spec.accent && spec.accentPlacement) {
    const accentField = spec.accentColorRole === "trim" ? trim : body;
    prompt +=
      `ACCENT FIELD — THIS IS REQUIRED AND MUST BE CLEARLY VISIBLE: ` +
      `Clad ${spec.accentPlacement.toLowerCase()} in ${spec.accent.productLine} ` +
      `(${spec.accent.texture} texture), finished in "${accentField.name}" — ` +
      `${describeColor(accentField)}, hex ${accentField.hex}. ` +
      (spec.accentColorRole === "trim"
        ? `This is a deliberate two-tone treatment: the gable material and colour must contrast ` +
          `clearly against the "${body.name}" wall field below, with a crisp horizontal break at the ` +
          `roofline where the two meet. Do not render the gables in the body colour. `
        : `Keep it in the body colour so the change reads as a texture shift rather than a second colour. `);
  }

  prompt +=
    `TRIM: All corner boards, window and door casing, fascia and frieze boards in ` +
    `"${trim.name}" — ${describeColor(trim)}, hex ${trim.hex}. ` +
    `Corner boards read approximately 5.5 inches wide and window casing ` +
    `approximately 3.5 inches wide. Trim must be crisp, straight and consistent. `;

  prompt +=
    `ACCENT: Paint the front door in "${accent.name}" — ${describeColor(accent)}, hex ${accent.hex}. ` +
    `Use this accent color sparingly — the front door only, no more than about 10 percent of the visible facade. `;

  prompt += landscapingClause(landscaping);

  prompt +=
    `CRITICAL — DO NOT CHANGE: the roof (its exact colour, material and shingle texture must be identical ` +
    `to the input photo), the roofline and every gable shape, the window ` +
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
