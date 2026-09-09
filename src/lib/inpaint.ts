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

export class InpaintBillingError extends Error {
  constructor() {
    super(
      "Your Replicate account has no credit, so the render could not run. Add credit at replicate.com/account/billing — Flux Fill costs roughly $0.04 per image.",
    );
    this.name = "InpaintBillingError";
  }
}

export class InpaintNotConfiguredError extends Error {
  constructor() {
    super("REPLICATE_API_TOKEN is not set on this deployment.");
    this.name = "InpaintNotConfiguredError";
  }
}

function toDataUri(png: Buffer): string {
  return `data:image/png;base64,${png.toString("base64")}`;
}

/**
 * Replicate's SDK has returned several shapes across versions: a URL string, an
 * array of them, a FileOutput (a ReadableStream carrying .url()/.blob()), or an
 * object wrapping one of those. Handle them all, and if something new turns up,
 * say what it was rather than "no image".
 */
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download the render (${response.status}).`);
  return Buffer.from(await response.arrayBuffer());
}

async function readOutput(output: unknown, depth = 0): Promise<Buffer> {
  if (depth > 3) throw new Error("The inpainting model returned an unreadable result.");

  if (typeof output === "string") {
    if (output.startsWith("data:")) {
      return Buffer.from(output.slice(output.indexOf(",") + 1), "base64");
    }
    return download(output);
  }

  if (Array.isArray(output)) {
    if (output.length === 0) throw new Error("The inpainting model returned an empty result.");
    return readOutput(output[0], depth + 1);
  }

  if (output && typeof output === "object") {
    const candidate = output as {
      blob?: () => Promise<Blob>;
      url?: (() => URL | string) | string;
      getReader?: unknown;
      output?: unknown;
      image?: unknown;
      mask?: unknown;
    };

    if (typeof candidate.blob === "function") {
      const blob = await candidate.blob();
      return Buffer.from(await blob.arrayBuffer());
    }
    if (typeof candidate.url === "function") {
      const url = candidate.url();
      return download(typeof url === "string" ? url : url.toString());
    }
    if (typeof candidate.url === "string") {
      return download(candidate.url);
    }
    if (typeof candidate.getReader === "function") {
      return streamToBuffer(output as ReadableStream<Uint8Array>);
    }
    if (candidate.output !== undefined) return readOutput(candidate.output, depth + 1);
    if (candidate.image !== undefined) return readOutput(candidate.image, depth + 1);

    const keys = Object.keys(candidate).slice(0, 8).join(", ");
    throw new Error(`The inpainting model returned an unexpected shape (keys: ${keys || "none"}).`);
  }

  throw new Error(`The inpainting model returned ${typeof output}.`);
}

export async function inpaintSiding(
  imagePng: Buffer,
  maskPng: Buffer,
  prompt: string,
): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new InpaintNotConfiguredError();

  const replicate = new Replicate({ auth: token });

  let output: unknown;
  try {
    output = await replicate.run(MODEL, {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Replicate surfaces billing problems as a 402 with a long JSON body; the
    // homeowner needs the one actionable sentence, not the payload.
    if (message.includes("402") || message.toLowerCase().includes("insufficient credit")) {
      throw new InpaintBillingError();
    }
    throw error;
  }

  return readOutput(output);
}
