import Replicate from "replicate";
import type { Palette, SidingPlan } from "@/types/quiz";

/**
 * End-to-end image-to-image, no masks.
 *
 * Every masking approach tried before this — polygons, grid occupancy,
 * segmentation, local compositing — produced visible artefacts, because any
 * error in the mask lands directly on screen as a green roof or a missing
 * gable. A low prompt_strength img2img pass preserves geometry through the
 * diffusion process itself rather than by cutting the image up.
 */
const MODEL = "black-forest-labs/flux-dev" as `${string}/${string}`;

/** Low enough to hold windows, roofline and massing; high enough to re-clad. */
const PROMPT_STRENGTH = 0.4;

export class RenderNotConfiguredError extends Error {
  constructor() {
    super("REPLICATE_API_TOKEN is not set on this deployment.");
    this.name = "RenderNotConfiguredError";
  }
}

export class RenderBillingError extends Error {
  constructor() {
    super(
      "Your Replicate account has no credit, so the render could not run. Add credit at replicate.com/account/billing.",
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

async function readOutput(output: unknown, depth = 0): Promise<Buffer> {
  if (depth > 3) throw new Error("The render came back in a form we could not read.");

  if (typeof output === "string") {
    if (output.startsWith("data:")) {
      return Buffer.from(output.slice(output.indexOf(",") + 1), "base64");
    }
    const response = await fetch(output);
    if (!response.ok) throw new Error(`Could not download the render (${response.status}).`);
    return Buffer.from(await response.arrayBuffer());
  }

  if (Array.isArray(output)) {
    if (output.length === 0) throw new Error("The model returned no image.");
    return readOutput(output[0], depth + 1);
  }

  if (output && typeof output === "object") {
    const candidate = output as {
      blob?: () => Promise<Blob>;
      url?: (() => URL | string) | string;
      getReader?: unknown;
      output?: unknown;
    };
    if (typeof candidate.blob === "function") {
      const blob = await candidate.blob();
      return Buffer.from(await blob.arrayBuffer());
    }
    if (typeof candidate.url === "function") {
      const url = candidate.url();
      return readOutput(typeof url === "string" ? url : url.toString(), depth + 1);
    }
    if (typeof candidate.url === "string") return readOutput(candidate.url, depth + 1);
    if (typeof candidate.getReader === "function") {
      const reader = (output as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      return Buffer.concat(chunks);
    }
    if (candidate.output !== undefined) return readOutput(candidate.output, depth + 1);
  }

  throw new Error(`The model returned ${typeof output}.`);
}

export async function renderSiding(
  imagePng: Buffer,
  prompt: string,
  strength: number = PROMPT_STRENGTH,
): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new RenderNotConfiguredError();

  const replicate = new Replicate({ auth: token });

  try {
    const output = await replicate.run(MODEL, {
      input: {
        prompt,
        image: `data:image/png;base64,${imagePng.toString("base64")}`,
        // The whole point: low denoising keeps geometry, windows and roof.
        prompt_strength: strength,
        guidance: 3.5,
        num_inference_steps: 40,
        output_format: "png",
        output_quality: 100,
        megapixels: "1",
        disable_safety_checker: false,
      },
    });
    return readOutput(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("402") || message.toLowerCase().includes("insufficient credit")) {
      throw new RenderBillingError();
    }
    throw error;
  }
}
