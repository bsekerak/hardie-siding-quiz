import OpenAI from "openai";
import sharp from "sharp";

export interface PolygonPoint {
  /** Percentage of image width, 0-100. */
  x: number;
  /** Percentage of image height, 0-100. */
  y: number;
}

/** A rectangle, in percentage space, that must be preserved untouched. */
export interface Opening {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FacadeRegions {
  wall: PolygonPoint[];
  openings: Opening[];
}

/**
 * gpt-image-1 only regenerates the TRANSPARENT region of a mask and copies the
 * opaque region through untouched. Masking the house means the lawn, walkway,
 * driveway, planting beds and sky survive byte-for-byte instead of being
 * re-imagined on every render.
 */
export async function detectFacadeRegions(
  openai: OpenAI,
  imageBase64: string,
): Promise<FacadeRegions | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } },
            {
              type: "text",
              text:
                "Analyse this house photo and return TWO things as JSON.\n\n" +
                "1. \"wall\": a TIGHT silhouette of the SIDED WALL SURFACES — the flat cladding " +
                "including gable triangles. Trace the actual outline step by step: up the left " +
                "corner of the house, along each roof edge and soffit (following every gable peak " +
                "and every change in roof height separately), down the right corner, and back " +
                "along the base of the wall where it meets the ground or foundation.\n" +
                "This must NOT be a bounding box. Sky must be OUTSIDE the shape. Roof shingles " +
                "must be OUTSIDE the shape. Lawn, beds, shrubs, trees, walkway and driveway must " +
                "be OUTSIDE the shape. If the roofline steps down over a garage wing, the outline " +
                "must step down with it.\n" +
                "Use 20 to 40 points ordered clockwise — more points along the roofline than " +
                "anywhere else, because that edge is where accuracy matters most.\n\n" +
                "2. \"openings\": a tight bounding rectangle around EVERY window (including its " +
                "shutters and grilles), every door, every garage door, every gable louver or vent, " +
                "and every exterior light fixture. Be generous rather than tight — it is better to " +
                "cover slightly too much than to clip an edge. Include every one you can see.\n\n" +
                'Return ONLY: {"wall":[{"x":12.5,"y":40.1},...],' +
                '"openings":[{"x":30.2,"y":45.0,"w":6.1,"h":9.4},...]} ' +
                "where all values are percentages of image width/height between 0 and 100, and " +
                "x,y is the top-left corner of each rectangle. No prose, no code fences.",
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed: unknown = JSON.parse(match[0]);
    if (typeof parsed !== "object" || parsed === null) return null;

    const wallRaw = (parsed as { wall?: unknown }).wall;
    if (!Array.isArray(wallRaw) || wallRaw.length < 3) return null;

    const clamp = (value: number): number => Math.min(100, Math.max(0, value));

    const wall: PolygonPoint[] = [];
    for (const point of wallRaw) {
      if (typeof point !== "object" || point === null) continue;
      const { x, y } = point as { x?: unknown; y?: unknown };
      if (typeof x !== "number" || typeof y !== "number") continue;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      wall.push({ x: clamp(x), y: clamp(y) });
    }
    if (wall.length < 3) return null;

    const openingsRaw = (parsed as { openings?: unknown }).openings;
    const openings: Opening[] = [];
    if (Array.isArray(openingsRaw)) {
      for (const rect of openingsRaw) {
        if (typeof rect !== "object" || rect === null) continue;
        const { x, y, w, h } = rect as { x?: unknown; y?: unknown; w?: unknown; h?: unknown };
        if ([x, y, w, h].some((v) => typeof v !== "number" || !Number.isFinite(v))) continue;
        const rx = clamp(x as number);
        const ry = clamp(y as number);
        const rw = Math.min(100 - rx, Math.max(0, w as number));
        const rh = Math.min(100 - ry, Math.max(0, h as number));
        if (rw <= 0 || rh <= 0) continue;
        openings.push({ x: rx, y: ry, w: rw, h: rh });
      }
    }

    return { wall, openings };
  } catch {
    return null;
  }
}

/**
 * Builds an RGBA mask: the polygon becomes transparent (editable), everything
 * else stays opaque (preserved). `growDownPercent` extends the editable region
 * below the wall line so foundation beds can be cleared when asked.
 */
export interface MaskAssets {
  /** RGBA PNG in OpenAI convention: transparent where editing is allowed. */
  apiMask: Buffer;
  /**
   * Greyscale PNG in Flux Fill convention: WHITE is inpainted, black is
   * preserved. Deliberately un-blurred — the model wants a crisp boundary.
   */
  replicateMask: Buffer;
  /**
   * Single-channel alpha used to composite locally: 255 where the model's
   * output should be kept, 0 where the original photo must win. Feathered so
   * the seam is invisible.
   */
  compositeAlpha: Buffer;
}

export async function buildMask(
  regions: FacadeRegions,
  width: number,
  height: number,
  growDownPercent: number,
): Promise<MaskAssets> {
  const { wall, openings } = regions;
  const grow = (growDownPercent / 100) * height;
  const centroidY = wall.reduce((sum, p) => sum + p.y, 0) / wall.length;

  const coords = wall
    .map((point) => {
      const px = (point.x / 100) * width;
      // Push only the lower half of the outline downward, so the roofline is
      // untouched while the base of the wall extends over the beds.
      const isLower = point.y > centroidY;
      const py = Math.min(height, (point.y / 100) * height + (isLower ? grow : 0));
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");

  // Windows, doors, vents and light fixtures are painted back to black so they
  // fall outside the editable region and survive the edit untouched. A small
  // outward pad absorbs imprecision in the detected rectangle.
  const pad = 0.6;
  const holes = openings
    .map((rect) => {
      const rx = Math.max(0, ((rect.x - pad) / 100) * width);
      const ry = Math.max(0, ((rect.y - pad) / 100) * height);
      const rw = Math.min(width - rx, ((rect.w + pad * 2) / 100) * width);
      const rh = Math.min(height - ry, ((rect.h + pad * 2) / 100) * height);
      return `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="black"/>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="black"/>
    <polygon points="${coords}" fill="white"/>
    ${holes}
  </svg>`;

  // 255 inside the editable region, 0 outside. Feathered so the composite seam
  // does not show as a hard edge along the wall line.
  const compositeAlpha = await sharp(Buffer.from(svg))
    .greyscale()
    .blur(1.5)
    .raw()
    .toBuffer();

  // Flux Fill takes the mask as a plain greyscale image: white = repaint.
  const replicateMask = await sharp(Buffer.from(svg)).greyscale().png().toBuffer();

  // OpenAI wants the inverse convention: transparent means "you may edit".
  const apiAlpha = await sharp(Buffer.from(svg)).greyscale().negate().raw().toBuffer();

  const base = await sharp({
    create: { width, height, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .raw()
    .toBuffer();

  const apiMask = await sharp(base, { raw: { width, height, channels: 3 } })
    .joinChannel(apiAlpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  return { apiMask, replicateMask, compositeAlpha };
}

/**
 * gpt-image-1 regenerates the whole frame even when given a mask — unlike
 * DALL-E 2 inpainting, the mask is guidance rather than a guarantee. So the
 * preservation is enforced here instead: the model's output is kept only inside
 * the siding region, and every other pixel comes straight from the homeowner's
 * photo. Windows, roof, trees and hardscape are then byte-identical by
 * construction rather than by request.
 */
export async function compositeOntoOriginal(
  originalPng: Buffer,
  generatedPng: Buffer,
  compositeAlpha: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  // removeAlpha() first: joinChannel APPENDS, so an existing alpha channel would
  // leave a 5-channel image and sharp would key transparency off the wrong one —
  // which silently rendered the generated layer invisible.
  const generated = await sharp(generatedPng)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .toBuffer();

  const generatedWithAlpha = await sharp(generated)
    .joinChannel(compositeAlpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  return sharp(originalPng)
    .composite([{ input: generatedWithAlpha, blend: "over" }])
    .png()
    .toBuffer();
}
