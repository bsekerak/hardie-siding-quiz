import OpenAI, { toFile } from "openai";
import type { Palette, SidingPlan } from "@/types/quiz";

/**
 * End-to-end image-to-image, no masks.
 *
 * Every masking approach produced visible artefacts, because any error in the
 * mask lands on screen as a green roof or a missing gable.
 *
 * flux-dev img2img held geometry beautifully but would not follow the colour
 * instruction at any strength: at 0.4 the siding stayed its original colour, and
 * by 0.7 the walls had degenerated into block patterns while STILL not reaching
 * the specified hue.
 *
 * gpt-image-1 is what ChatGPT uses, and it applies ColorPlus colours correctly.
 * It re-renders rather than edits, so the result is an interpretation of the
 * house rather than a survey of it — which is the trade the reference workflow
 * already makes.
 */

export class RenderNotConfiguredError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not set on this deployment.");
    this.name = "RenderNotConfiguredError";
  }
}

export class RenderBillingError extends Error {
  constructor() {
    super(
      "The image account has no credit, so the render could not run. Check billing on the provider account.",
    );
    this.name = "RenderBillingError";
  }
}

/**
 * Optional elevation edits. These are cheap now: the render is a text-prompted
 * generation from the original photo, so each one is a clause rather than a
 * mask. Because every render starts from the untouched photo, options compose
 * without drift compounding across selections.
 */
export interface ElevationOption {
  id: string;
  label: string;
  hint: string;
  clause: (palette: Palette) => string;
}

/**
 * Painting the door is now OPT-IN. Instructing it by default made the model
 * render a door on elevations that have none — a rear or side wall would come
 * back with an entry the homeowner does not own. The tool's job is siding, so
 * the door is left alone unless it is asked for.
 */
export const PAINT_DOOR_ID = "paint-door";

export const ELEVATION_OPTIONS: readonly ElevationOption[] = [
  {
    id: PAINT_DOOR_ID,
    label: "Paint the front door",
    hint: "Only if this elevation has one",
    clause: (palette) =>
      `If — and only if — a front door is already visible in this photograph, paint that existing door ${palette.accent.color.name} (${palette.accent.color.hex}). Do not add a door, and do not change its size, position, panel style or hardware.`,
  },
  {
    id: "remove-shutters",
    label: "Remove shutters",
    hint: "Clean wall around every window",
    clause: () =>
      "Remove all window shutters entirely, leaving clean uninterrupted siding around each window.",
  },
  {
    id: "remove-gable-vents",
    label: "Remove gable vents",
    hint: "Continuous siding across the gable",
    clause: () =>
      "Remove the louvered gable vents and any attic vents, leaving continuous unbroken siding across the gable faces.",
  },
  {
    id: "batten-gables",
    label: "Board & batten gables",
    hint: "Vertical boards in the trim colour",
    clause: (palette) =>
      `Clad the gable faces above the main roofline in vertical board-and-batten siding finished in ${palette.trim.color.name} (${palette.trim.color.hex}), meeting the horizontal lap siding below at a crisp horizontal break.`,
  },
  {
    id: "shingle-gables",
    label: "Shingle gables",
    hint: "Staggered shake in the body colour",
    clause: (palette) =>
      `Clad the gable faces above the main roofline in staggered-edge shingle siding finished in ${palette.body.color.name} (${palette.body.color.hex}).`,
  },
  {
    id: "black-windows",
    label: "Black window frames",
    hint: "Matte black sashes and frames",
    clause: () => "Change all window frames and sashes to a matte black finish.",
  },
  {
    id: "accent-shutters",
    label: "Add accent shutters",
    hint: "Shutters in your accent colour",
    clause: (palette) =>
      `Add shutters flanking the front-facing windows finished in ${palette.accent.color.name} (${palette.accent.color.hex}), sized to roughly half the window width.`,
  },
];

export function buildRenderPrompt(
  plan: SidingPlan,
  palette: Palette,
  optionIds: readonly string[] = [],
): string {
  const { spec } = plan;
  const body = palette.body.color;
  const trim = palette.trim.color;

  const extras = ELEVATION_OPTIONS.filter((option) => optionIds.includes(option.id)).map((option) =>
    option.clause(palette),
  );

  // No door instruction at all unless it was asked for. Naming the door in any
  // form — even conditionally — is enough to make the model produce one.
  const doorClause = optionIds.includes(PAINT_DOOR_ID)
    ? ""
    : "Leave every door exactly as photographed, in its existing colour and style.";

  return [
    "Architectural exterior redesign of this specific home.",
    `Replace the existing siding material with James Hardie ${spec.primary.productLine} in`,
    `${body.name} (${body.hex}) with authentic ${spec.primary.texture} woodgrain texture.`,
    "Keep all architectural elements, roofline, roof shingles, window positions, window frames,",
    "and landscaping exactly as shown.",
    `Apply ${trim.name} (${trim.hex}) to all corner boards, fascia, and window trims.`,
    ...(doorClause ? [doorClause] : []),
    ...extras,
    // Guard against invention generally, not just doors: rear elevations lose
    // entries, side elevations lose windows, and the model will helpfully
    // supply whatever it thinks a house ought to have.
    "CRITICAL: Do not add, remove, move, resize or restyle any door or window. If this elevation has no door, render an unbroken wall — do not place a door anywhere. Apart from the changes described above, invent no architectural element that is not already visible in this photograph: no dormers, gables, porches, decks, columns, chimneys, vents or light fixtures. Match the existing elevation exactly, including blank walls.",
    "Photorealistic architectural photography, sharp daylight.",
  ].join(" ");
}

export async function renderSiding(
  imagePng: Buffer,
  prompt: string,
  size: "1024x1024" | "1536x1024" | "1024x1536",
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new RenderNotConfiguredError();

  const openai = new OpenAI({ apiKey });

  try {
    const imageFile = await toFile(
      new Blob([new Uint8Array(imagePng)], { type: "image/png" }),
      "house.png",
      { type: "image/png" },
    );

    // No mask: the whole photo is the reference, exactly as it is when the same
    // image is handed to a chat model directly.
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      n: 1,
      size,
      quality: "high",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("The model returned no image.");
    return Buffer.from(b64, "base64");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("402") || message.toLowerCase().includes("insufficient credit")) {
      throw new RenderBillingError();
    }
    throw error;
  }
}
