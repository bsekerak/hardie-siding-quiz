import { NextResponse, type NextRequest } from "next/server";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { type LandscapingMode } from "@/lib/visualizerPrompt";

import { BUILD_ID } from "@/lib/buildId";
import { buildMask, detectFacadeGrid } from "@/lib/facadeMask";
import { buildSidingPrompt } from "@/lib/visualizerPrompt";
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

export async function PUT(request: NextRequest) {
  // Diagnostic only: probes segmentation models against a real photo so the
  // mask source can be validated before anything is rebuilt around it.
  const { probeSegmentation } = await import("@/lib/segment");
  const formData = await request.formData();
  const upload = formData.get("image");
  if (!(upload instanceof File)) {
    return NextResponse.json({ error: "No photo provided." }, { status: 400 });
  }
  const prepared = await prepareImage(Buffer.from(await upload.arrayBuffer()));
  const attempts = await probeSegmentation(prepared.png);
  return NextResponse.json({
    attempts: attempts.map(({ maskBase64, ...rest }) => ({ ...rest, hasMask: Boolean(maskBase64) })),
    maskUrl: attempts.find((a) => a.maskBase64)
      ? `data:image/png;base64,${attempts.find((a) => a.maskBase64)?.maskBase64}`
      : undefined,
  });
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

    const grid = await detectFacadeGrid(openai, prepared.png.toString("base64"));
    if (!grid) {
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
    const mask = await buildMask(grid, prepared.width, prepared.height, growDown);

    // Generation runs on gpt-image-1. It does not preserve geometry — see the
    // note in facadeMask — but it is the only path here that produces a
    // presentable render. The mask still steers it toward the walls.
    let prompt = buildSidingPrompt(plan, palette, landscaping);
    if (instruction) prompt = `${prompt} Also apply this change: ${instruction}`;

    const imageFile = await toFile(
      new Blob([new Uint8Array(prepared.png)], { type: "image/png" }),
      "house.png",
      { type: "image/png" },
    );
    const maskFile = await toFile(
      new Blob([new Uint8Array(mask.apiMask)], { type: "image/png" }),
      "mask.png",
      { type: "image/png" },
    );

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      mask: maskFile,
      prompt,
      n: 1,
      size: OUTPUT_SIZES[prepared.shape].api,
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image came back. Try again." }, { status: 502 });
    }
    const finalPng = Buffer.from(b64, "base64");

    // ?debug=1 returns the intermediate artefacts so a bad mask or a no-op
    // generation can be told apart without guessing.
    const debug = request.nextUrl.searchParams.get("debug") === "1";

    return NextResponse.json({
      ...(debug
        ? {
            maskUrl: `data:image/png;base64,${mask.replicateMask.toString("base64")}`,
            preparedUrl: `data:image/png;base64,${prepared.png.toString("base64")}`,
            wallCells: grid.cells.filter(Boolean).length,
            gridTotal: grid.cells.length,
            prompt,
          }
        : {}),
      imageUrl: `data:image/png;base64,${finalPng.toString("base64")}`,
      shape: prepared.shape,
      masked: true,
      openingCount: grid.openings.length,
      buildId: BUILD_ID,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The visualizer failed. Try again.";
    console.error("[/api/visualize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
