import { NextResponse, type NextRequest } from "next/server";

import sharp from "sharp";


import { BUILD_ID } from "@/lib/buildId";
import { recolorSiding } from "@/lib/facadeMask";
import { segmentWallMask } from "@/lib/segment";
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
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "The visualizer is not configured on this deployment. A REPLICATE_API_TOKEN environment variable is required for wall segmentation.",
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

  // plan is accepted for forward compatibility but the recolour needs only the palette.
  let palette: Palette;
  try {
    JSON.parse(planRaw) as SidingPlan;
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
    const buffer = Buffer.from(await upload.arrayBuffer());
    const prepared = await prepareImage(buffer);

    const wallAlpha = await segmentWallMask(prepared.png, prepared.width, prepared.height);
    if (!wallAlpha) {
      return NextResponse.json(
        {
          error:
            "Couldn't identify the walls in that photo. A straight-on shot of the front of the house, with the whole elevation in frame, works best.",
          code: "no_facade",
        },
        { status: 422 },
      );
    }

    // Deterministic recolour: the homeowner's own shadows, board lines, windows,
    // roof and landscaping are all preserved exactly; only the hue of the
    // cladding changes, and it lands on the exact ColorPlus value.
    const finalPng = (await recolorSiding(
      prepared.png,
      wallAlpha,
      palette.body.color.hex,
      prepared.width,
      prepared.height,
    )) as Buffer;

    // ?debug=1 returns the intermediate artefacts so a bad mask or a no-op
    // generation can be told apart without guessing.
    const debug = request.nextUrl.searchParams.get("debug") === "1";

    return NextResponse.json({
      ...(debug
        ? {
            maskUrl: `data:image/png;base64,${(await sharp(wallAlpha, { raw: { width: prepared.width, height: prepared.height, channels: 1 } }).png().toBuffer()).toString("base64")}`,
            preparedUrl: `data:image/png;base64,${prepared.png.toString("base64")}`,
          }
        : {}),
      imageUrl: `data:image/png;base64,${finalPng.toString("base64")}`,
      shape: prepared.shape,
      recolored: true,
      buildId: BUILD_ID,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The visualizer failed. Try again.";
    console.error("[/api/visualize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
