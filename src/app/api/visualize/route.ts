import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";
import { buildInpaintPrompt, type LandscapingMode } from "@/lib/visualizerPrompt";
import { InpaintBillingError, InpaintNotConfiguredError, inpaintSiding } from "@/lib/inpaint";
import { BUILD_ID } from "@/lib/buildId";
import { buildMask, compositeOntoOriginal, detectFacadeRegions } from "@/lib/facadeMask";
import type { Palette, SidingPlan } from "@/types/quiz";

export const runtime = "nodejs";
// Image edits routinely take 30-60s; the default serverless timeout is too short.
export const maxDuration = 300;

/** gpt-image-1 accepts these three shapes. Picking the one that matches the
 *  photo is what stops a wide house being cropped into a square frame. */
const OUTPUT_SIZES = {
  square: { w: 1024, h: 1024, api: "1024x1024" },
  landscape: { w: 1536, h: 1024, api: "1536x1024" },
  portrait: { w: 1024, h: 1536, api: "1024x1536" },
} as const;

type OutputShape = keyof typeof OUTPUT_SIZES;
// Vercel rejects bodies over ~4.5MB at the edge, so this guard sits just under
// it. The client downscales before upload; this is the backstop.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function shapeFor(width: number, height: number): OutputShape {
  const ratio = width / height;
  if (ratio >= 1.2) return "landscape";
  if (ratio <= 0.83) return "portrait";
  return "square";
}

/**
 * Fits the photo into the closest supported frame WITHOUT cropping. The old
 * implementation used fit:"cover" against a fixed square, which silently cut
 * the ends off any wide elevation — exactly the part of a house you most want
 * to see re-clad.
 */
async function prepareImage(
  buffer: Buffer,
): Promise<{ shape: OutputShape; png: Buffer; width: number; height: number }> {
  const rotated = await sharp(buffer).rotate().toBuffer();
  const metadata = await sharp(rotated).metadata();
  const shape = shapeFor(metadata.width ?? 1024, metadata.height ?? 1024);
  const target = OUTPUT_SIZES[shape];

  const png = await sharp(rotated)
    .resize(target.w, target.h, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  return { shape, png, width: target.w, height: target.h };
}

/** Lets the client detect that it is running a stale bundle. */
export async function GET() {
  return NextResponse.json(
    { buildId: BUILD_ID },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      {
        error:
          "The visualizer is not configured on this deployment. An OPENAI_API_KEY environment variable is required for facade detection.",
        code: "not_configured",
      },
      { status: 503 },
    );
  }
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "The visualizer is not configured on this deployment. A REPLICATE_API_TOKEN environment variable is required for inpainting.",
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

  const landscaping = (String(formData.get("landscaping") ?? "keep") === "clear"
    ? "clear"
    : "keep") as LandscapingMode;
  // Refinements re-render from the ORIGINAL photo with an extra instruction,
  // rather than editing the previous render. Iterating on a generated frame
  // compounds drift; starting fresh each time cannot.
  const instruction = String(formData.get("instruction") ?? "").trim();

  const openai = new OpenAI({ apiKey: openaiKey });

  try {
    const buffer = Buffer.from(await upload.arrayBuffer());
    const prepared = await prepareImage(buffer);

    const regions = await detectFacadeRegions(openai, prepared.png.toString("base64"));
    if (!regions) {
      return NextResponse.json(
        {
          error:
            "Couldn't identify the walls in that photo. A straight-on shot of the front of the house, taken in daylight with the whole elevation in frame, works best.",
          code: "no_facade",
        },
        { status: 422 },
      );
    }

    const growDown = landscaping === "clear" ? 9 : 1.5;
    const mask = await buildMask(regions, prepared.width, prepared.height, growDown);

    let prompt = buildInpaintPrompt(plan, palette, landscaping);
    if (instruction) prompt = `${prompt}. ${instruction}`;

    const generated = await inpaintSiding(prepared.png, mask.replicateMask, prompt);

    // Flux Fill preserves geometry outside the mask, so compositing is now both
    // valid and belt-and-braces: every pixel outside the siding region is taken
    // straight from the homeowner's own photo.
    let finalPng: Buffer = generated as Buffer;
    let composited = false;
    try {
      finalPng = (await compositeOntoOriginal(
        prepared.png,
        generated,
        mask.compositeAlpha,
        prepared.width,
        prepared.height,
      )) as Buffer;
      composited = true;
    } catch (compositeError) {
      console.error("[/api/visualize] composite failed", compositeError);
    }

    // ?debug=1 returns the intermediate artefacts so a bad mask or a no-op
    // generation can be told apart without guessing.
    const debug = request.nextUrl.searchParams.get("debug") === "1";

    return NextResponse.json({
      ...(debug
        ? {
            maskUrl: `data:image/png;base64,${mask.replicateMask.toString("base64")}`,
            rawUrl: `data:image/png;base64,${generated.toString("base64")}`,
            preparedUrl: `data:image/png;base64,${prepared.png.toString("base64")}`,
            wallPoints: regions.wall.length,
            prompt,
          }
        : {}),
      imageUrl: `data:image/png;base64,${finalPng.toString("base64")}`,
      shape: prepared.shape,
      masked: true,
      composited,
      openingCount: regions.openings.length,
      buildId: BUILD_ID,
    });
  } catch (error) {
    if (error instanceof InpaintBillingError) {
      return NextResponse.json({ error: error.message, code: "no_credit" }, { status: 402 });
    }
    if (error instanceof InpaintNotConfiguredError) {
      return NextResponse.json({ error: error.message, code: "not_configured" }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "The visualizer failed. Try again.";
    console.error("[/api/visualize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
