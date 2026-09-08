import { NextResponse, type NextRequest } from "next/server";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import {
  buildRefinementPrompt,
  buildSidingPrompt,
  type LandscapingMode,
} from "@/lib/visualizerPrompt";
import type { Palette, SidingPlan } from "@/types/quiz";

export const runtime = "nodejs";
// Image edits routinely take 30-60s; the default serverless timeout is too short.
export const maxDuration = 300;

const SIZE = 1024;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/** Normalizes any upload to a square 1024px PNG, which is what gpt-image-1 wants. */
async function toSquarePng(buffer: Buffer): Promise<Awaited<ReturnType<typeof toFile>>> {
  const png = await sharp(buffer)
    .rotate() // honour EXIF orientation before resizing
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  return toFile(new Blob([new Uint8Array(png)], { type: "image/png" }), "house.png", {
    type: "image/png",
  });
}

async function fileFromDataUrl(dataUrl: string): Promise<Awaited<ReturnType<typeof toFile>>> {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl;
  const binary = Buffer.from(base64, "base64");
  return toFile(new Blob([new Uint8Array(binary)], { type: "image/png" }), "current.png", {
    type: "image/png",
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The visualizer is not configured on this deployment. An OPENAI_API_KEY environment variable is required.",
        code: "not_configured",
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const mode = String(formData.get("mode") ?? "initial");
  const planRaw = formData.get("plan");
  const paletteRaw = formData.get("palette");

  if (typeof planRaw !== "string" || typeof paletteRaw !== "string") {
    return NextResponse.json({ error: "Missing plan or palette." }, { status: 400 });
  }

  let plan: SidingPlan;
  let palette: Palette;
  try {
    plan = JSON.parse(planRaw) as SidingPlan;
    palette = JSON.parse(paletteRaw) as Palette;
  } catch {
    return NextResponse.json({ error: "Could not read the plan." }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    let imageFile: Awaited<ReturnType<typeof toFile>>;
    let prompt: string;

    if (mode === "refine") {
      const current = formData.get("currentImage");
      const instruction = formData.get("instruction");
      if (typeof current !== "string" || typeof instruction !== "string" || !instruction.trim()) {
        return NextResponse.json(
          { error: "Refinement needs the current image and an instruction." },
          { status: 400 },
        );
      }
      imageFile = await fileFromDataUrl(current);
      prompt = buildRefinementPrompt(plan, palette, instruction.trim());
    } else {
      const upload = formData.get("image");
      if (!(upload instanceof File)) {
        return NextResponse.json({ error: "No photo provided." }, { status: 400 });
      }
      if (upload.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: "That photo is larger than 12MB. Try a smaller one." },
          { status: 413 },
        );
      }
      const buffer = Buffer.from(await upload.arrayBuffer());
      imageFile = await toSquarePng(buffer);
      const landscaping = (String(formData.get("landscaping") ?? "keep") === "clear"
        ? "clear"
        : "keep") as LandscapingMode;
      prompt = buildSidingPrompt(plan, palette, landscaping);
    }

    // No mask: siding covers most of the facade, and a bad mask damages the
    // result far more than a strong "change nothing else" instruction does.
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image came back. Try again." }, { status: 502 });
    }

    return NextResponse.json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The visualizer failed. Try again.";
    console.error("[/api/visualize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
