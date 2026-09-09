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
                "1. \"wall\": the outline of the SIDED WALL SURFACES only — the flat cladding " +
                "including gable triangles — following the underside of the roof edge and soffit. " +
                "EXCLUDE the roof planes and shingles themselves, the lawn, planting beds, shrubs, " +
                "trees, walkway, driveway and sky. 8 to 20 points, ordered clockwise.\n\n" +
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
export async function buildMask(
  regions: FacadeRegions,
  width: number,
  height: number,
  growDownPercent: number,
): Promise<Buffer> {
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

  // White polygon -> negated -> alpha 0 inside the polygon, 255 outside.
  const alpha = await sharp(Buffer.from(svg))
    .greyscale()
    .negate()
    .raw()
    .toBuffer();

  const base = await sharp({
    create: { width, height, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .raw()
    .toBuffer();

  return sharp(base, { raw: { width, height, channels: 3 } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
}
