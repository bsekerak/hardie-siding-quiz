import { NextResponse, type NextRequest } from "next/server";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import {
  buildRefinementPrompt,
  buildSidingPrompt,
  type LandscapingMode,
} from "@/lib/visualizerPrompt";
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
): Promise<{
  file: Awaited<ReturnType<typeof toFile>>;
  shape: OutputShape;
  png: Buffer;
  width: number;
  height: number;
}> {
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

  const file = await toFile(new Blob([new Uint8Array(png)], { type: "image/png" }), "house.png", {
    type: "image/png",
  });
  return { file, shape, png, width: target.w, height: target.h };
}

async function fileFromDataUrl(dataUrl: string): Promise<Awaited<ReturnType<typeof toFile>>> {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl;
  const binary = Buffer.from(base64, "base64");
  return toFile(new Blob([new Uint8Array(binary)], { type: "image/png" }), "current.png", {
    type: "image/png",
  });
}

/** Lets the client detect that it is running a stale bundle. */
export async function GET() {
  return NextResponse.json(
    { buildId: BUILD_ID },
    { headers: { "cache-control": "no-store" } },
  );
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
    let maskFile: Awaited<ReturnType<typeof toFile>> | undefined;
    let prompt: string;
    let shape: OutputShape = "square";
    let masked = false;
    let openingCount = 0;
    // Retained so the generated frame can be composited back over the photo.
    let originalPng: Buffer | null = null;
    let compositeAlpha: Buffer | null = null;
    let frameWidth = 0;
    let frameHeight = 0;

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
      const previous = String(formData.get("shape") ?? "square");
      shape = previous === "landscape" || previous === "portrait" ? previous : "square";
    } else {
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
      const buffer = Buffer.from(await upload.arrayBuffer());
      const prepared = await prepareImage(buffer);
      imageFile = prepared.file;
      shape = prepared.shape;
      originalPng = prepared.png;
      frameWidth = prepared.width;
      frameHeight = prepared.height;
      const landscaping = (String(formData.get("landscaping") ?? "keep") === "clear"
        ? "clear"
        : "keep") as LandscapingMode;
      prompt = buildSidingPrompt(plan, palette, landscaping);

      // Confine the edit to the house itself. Without this the model regenerates
      // the whole frame and quietly redraws the walkway, beds and massing.
      const regions = await detectFacadeRegions(openai, prepared.png.toString("base64"));
      if (regions) {
        // Clearing the beds needs a little room below the wall line; keeping
        // them means touching nothing outside the structure at all.
        const growDown = landscaping === "clear" ? 9 : 1.5;
        const mask = await buildMask(regions, prepared.width, prepared.height, growDown);
        openingCount = regions.openings.length;
        compositeAlpha = mask.compositeAlpha;
        maskFile = await toFile(
          new Blob([new Uint8Array(mask.apiMask)], { type: "image/png" }),
          "mask.png",
          { type: "image/png" },
        );
        masked = true;
      }
    }

    // No mask: siding covers most of the facade, and a bad mask damages the
    // result far more than a strong "change nothing else" instruction does.
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      ...(maskFile ? { mask: maskFile } : {}),
      prompt,
      n: 1,
      size: OUTPUT_SIZES[shape].api,
      // Medium keeps renders near 25-35s and well inside the function timeout,
      // at a fraction of the cost of "high". Plenty for design exploration.
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image came back. Try again." }, { status: 502 });
    }

    let finalPng: Buffer = Buffer.from(b64, "base64") as Buffer;
    let composited = false;

    // Enforce preservation locally rather than trusting the model to honour the
    // mask. Everything outside the siding region reverts to the original photo.
    if (originalPng && compositeAlpha) {
      try {
        finalPng = (await compositeOntoOriginal(
          originalPng,
          finalPng,
          compositeAlpha,
          frameWidth,
          frameHeight,
        )) as Buffer;
        composited = true;
      } catch (compositeError) {
        console.error("[/api/visualize] composite failed", compositeError);
      }
    }

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${finalPng.toString("base64")}`,
      shape,
      masked,
      composited,
      openingCount,
      buildId: BUILD_ID,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The visualizer failed. Try again.";
    console.error("[/api/visualize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
