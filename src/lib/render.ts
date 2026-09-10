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

export function buildRenderPrompt(plan: SidingPlan, palette: Palette): string {
  const { spec } = plan;
  const body = palette.body.color;
  const trim = palette.trim.color;
  const accent = palette.accent.color;

  return [
    "Architectural exterior redesign of this specific home.",
    `Replace the existing siding material with James Hardie ${spec.primary.productLine} in`,
    `${body.name} (${body.hex}) with authentic ${spec.primary.texture} woodgrain texture.`,
    "Keep all architectural elements, roofline, roof shingles, window positions, window frames,",
    "and landscaping exactly as shown.",
    `Apply ${trim.name} (${trim.hex}) to all corner boards, fascia, and window trims.`,
    `Paint the front door ${accent.name} (${accent.hex}).`,
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
