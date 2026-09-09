import Replicate from "replicate";

/**
 * Flux Fill is a true inpainting model: it repaints only the white region of
 * the mask and leaves black regions alone. That is the property gpt-image-1
 * lacks — it regenerates the whole scene, so a homeowner's windows, roofline
 * and landscaping drift on every render.
 *
 * Mask convention here is WHITE = repaint, BLACK = preserve.
 */
const MODEL = (process.env.REPLICATE_INPAINT_MODEL ??
  "black-forest-labs/flux-fill-dev") as `${string}/${string}`;

export class InpaintNotConfiguredError extends Error {
  constructor() {
    super("REPLICATE_API_TOKEN is not set on this deployment.");
    this.name = "InpaintNotConfiguredError";
  }
}

function toDataUri(png: Buffer): string {
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Replicate's SDK returns a URL string, an array of them, or a FileOutput. */
async function readOutput(output: unknown): Promise<Buffer> {
  const first = Array.isArray(output) ? output[0] : output;

  if (typeof first === "string") {
    const response = await fetch(first);
    if (!response.ok) throw new Error(`Could not download the render (${response.status}).`);
    return Buffer.from(await response.arrayBuffer());
  }

  if (first && typeof first === "object") {
    const candidate = first as { url?: () => URL | string; blob?: () => Promise<Blob> };
    if (typeof candidate.blob === "function") {
      const blob = await candidate.blob();
      return Buffer.from(await blob.arrayBuffer());
    }
    if (typeof candidate.url === "function") {
      const url = candidate.url();
      const response = await fetch(typeof url === "string" ? url : url.toString());
      if (!response.ok) throw new Error(`Could not download the render (${response.status}).`);
      return Buffer.from(await response.arrayBuffer());
    }
  }

  throw new Error("The inpainting model returned no image.");
}

export async function inpaintSiding(
  imagePng: Buffer,
  maskPng: Buffer,
  prompt: string,
): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new InpaintNotConfiguredError();

  const replicate = new Replicate({ auth: token });

  const output = await replicate.run(MODEL, {
    input: {
      image: toDataUri(imagePng),
      mask: toDataUri(maskPng),
      prompt,
      output_format: "png",
      // Fill models want markedly higher guidance than text-to-image.
      guidance: 32,
      num_inference_steps: 32,
      // Keep the untouched region bit-exact rather than re-encoded.
      output_quality: 100,
    },
  });

  return readOutput(output);
}
