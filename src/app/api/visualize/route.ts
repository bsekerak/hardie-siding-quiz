import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { BUILD_ID } from "@/lib/buildId";
import {
  RenderBillingError,
  RenderNotConfiguredError,
  buildRenderPrompt,
  renderSiding,
} from "@/lib/render";
import type { Palette, SidingPlan } from "@/types/quiz";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Longest edge the model works at comfortably, with aspect ratio preserved. */
const MAX_EDGE = 1536;

/** gpt-image-1 renders at one of three shapes; pick the one matching the photo. */
function outputSizeFor(width: number, height: number): "1024x1024" | "1536x1024" | "1024x1536" {
  const ratio = width / height;
  if (ratio >= 1.2) return "1536x1024";
  if (ratio <= 0.83) return "1024x1536";
  return "1024x1024";
}

/** Lets the client detect that it is running a stale bundle. */
export async function GET() {
  return NextResponse.json(
    { buildId: BUILD_ID },
    { headers: { "cache-control": "no-store" } },
  );
}

/**
 * Normalizes the upload without cropping — the model receives the whole
 * elevation, at its own aspect ratio.
 */
async function prepareImage(
  buffer: Buffer,
): Promise<{ png: Buffer; size: "1024x1024" | "1536x1024" | "1024x1536" }> {
  const png = await sharp(buffer)
    .rotate() // honour EXIF orientation
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  const meta = await sharp(png).metadata();
  return { png, size: outputSizeFor(meta.width ?? 1024, meta.height ?? 1024) };
}

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "The visualizer is not configured on this deployment. A REPLICATE_API_TOKEN environment variable is required.",
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

  const upload = formData.get("image");
  if (!(upload instanceof File)) {
    return NextResponse.json({ error: "No photo provided." }, { status: 400 });
  }
  if (upload.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "That photo is too large to upload. Try a smaller one." },
      { status: 413 },
    );
  }

  try {
    const prepared = await prepareImage(Buffer.from(await upload.arrayBuffer()));
    const prompt = buildRenderPrompt(plan, palette);
    const rendered = await renderSiding(prepared.png, prompt, prepared.size);

    const debug = request.nextUrl.searchParams.get("debug") === "1";

    return NextResponse.json({
      ...(debug ? { prompt } : {}),
      imageUrl: `data:image/png;base64,${rendered.toString("base64")}`,
      buildId: BUILD_ID,
    });
  } catch (error) {
    if (error instanceof RenderBillingError) {
      return NextResponse.json({ error: error.message, code: "no_credit" }, { status: 402 });
    }
    if (error instanceof RenderNotConfiguredError) {
      return NextResponse.json({ error: error.message, code: "not_configured" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "The visualizer failed. Try again.";
    console.error("[/api/visualize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
