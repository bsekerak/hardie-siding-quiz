import OpenAI from "openai";
import sharp from "sharp";

export interface PolygonPoint {
  /** Percentage of image width, 0-100. */
  x: number;
  /** Percentage of image height, 0-100. */
  y: number;
}

/**
 * gpt-image-1 only regenerates the TRANSPARENT region of a mask and copies the
 * opaque region through untouched. Masking the house means the lawn, walkway,
 * driveway, planting beds and sky survive byte-for-byte instead of being
 * re-imagined on every render.
 */
export async function detectFacadePolygon(
  openai: OpenAI,
  imageBase64: string,
): Promise<PolygonPoint[] | null> {
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
                "Trace the outline of the HOUSE STRUCTURE in this photo — all exterior walls, " +
                "siding, gables and the roof, from the roof peak down to where the walls meet the " +
                "ground. EXCLUDE the lawn, planting beds, shrubs, trees, walkway, driveway, sky " +
                "and any detached structure. Return ONLY a JSON object of the form " +
                '{"points":[{"x":12.5,"y":40.1}, ...]} with 8 to 20 points, ordered clockwise, ' +
                "where x and y are percentages of image width and height between 0 and 100. " +
                "Follow the roofline accurately. No prose, no code fences.",
            },
          ],
        },
      ],
      max_tokens: 900,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed: unknown = JSON.parse(match[0]);
    if (typeof parsed !== "object" || parsed === null) return null;
    const points = (parsed as { points?: unknown }).points;
    if (!Array.isArray(points) || points.length < 3) return null;

    const clean: PolygonPoint[] = [];
    for (const point of points) {
      if (typeof point !== "object" || point === null) continue;
      const { x, y } = point as { x?: unknown; y?: unknown };
      if (typeof x !== "number" || typeof y !== "number") continue;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      clean.push({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
    }
    return clean.length >= 3 ? clean : null;
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
  polygon: PolygonPoint[],
  width: number,
  height: number,
  growDownPercent: number,
): Promise<Buffer> {
  const grow = (growDownPercent / 100) * height;
  const centroidY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

  const coords = polygon
    .map((point) => {
      const px = (point.x / 100) * width;
      // Push only the lower half of the outline downward, so the roofline is
      // untouched while the base of the wall extends over the beds.
      const isLower = point.y > centroidY;
      const py = Math.min(height, (point.y / 100) * height + (isLower ? grow : 0));
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="black"/>
    <polygon points="${coords}" fill="white"/>
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
