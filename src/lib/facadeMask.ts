import OpenAI from "openai";
import sharp from "sharp";

/** A rectangle, in percentage space, that must be preserved untouched. */
export interface Opening {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * gpt-image-1 only regenerates the TRANSPARENT region of a mask and copies the
 * opaque region through untouched. Masking the house means the lawn, walkway,
 * driveway, planting beds and sky survive byte-for-byte instead of being
 * re-imagined on every render.
 */
const GRID_COLS = 56;
const GRID_ROWS = 36;

export interface FacadeGrid {
  /** Row-major occupancy: true where the cell is siding to be repainted. */
  cells: boolean[];
  cols: number;
  rows: number;
  openings: Opening[];
}

/**
 * Asks for a grid occupancy map rather than a polygon.
 *
 * Vertex lists are where this falls down: asked for a 20-40 point silhouette,
 * GPT-4o returns 5-8 points — a bounding box that sweeps in sky, roof and lawn,
 * which then tells the inpainting model to repaint the whole photo. Classifying
 * a coarse grid is a task vision models are genuinely good at, and it degrades
 * gracefully: a few wrong cells cost a few pixels, not the whole frame.
 */
export async function detectFacadeGrid(
  openai: OpenAI,
  imageBase64: string,
): Promise<FacadeGrid | null> {
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
                `Overlay a ${GRID_COLS} x ${GRID_ROWS} grid on this house photo ` +
                `(${GRID_COLS} columns across, ${GRID_ROWS} rows down).\n\n` +
                `Output exactly ${GRID_ROWS} lines of exactly ${GRID_COLS} characters.\n` +
                "Use '#' when the MAJORITY of that cell is flat exterior wall cladding — " +
                "siding boards, shingle siding, board-and-batten, or a sided gable face.\n" +
                "Use '.' for everything else: sky, roof shingles, gutters, windows, doors, " +
                "garage doors, gable vents, light fixtures, porch columns, chimney, lawn, " +
                "planting beds, shrubs, trees, walkway, driveway, cars and people.\n\n" +
                "Be conservative: if a cell is ambiguous or sits on a boundary, use '.'.\n" +
                "Then output a line containing only ---\n" +
                "Then output a JSON array of bounding rectangles for every window (including " +
                "shutters), door, garage door, gable vent and light fixture, as " +
                '[{"x":30.2,"y":45.0,"w":6.1,"h":9.4},...] in percentages of width and height.\n' +
                "No prose, no code fences, no row numbers.",
            },
          ],
        },
      ],
      max_tokens: 4000,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const [gridPart, jsonPart] = raw.split("---");
    if (!gridPart) return null;

    const lines = gridPart
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && /^[#.\s]+$/.test(line));
    if (lines.length < GRID_ROWS * 0.6) return null;

    const cells: boolean[] = [];
    for (let row = 0; row < GRID_ROWS; row += 1) {
      const line = lines[Math.min(row, lines.length - 1)] ?? "";
      for (let col = 0; col < GRID_COLS; col += 1) {
        cells.push(line[col] === "#");
      }
    }
    if (!cells.some(Boolean)) return null;

    const clamp = (value: number): number => Math.min(100, Math.max(0, value));
    const openings: Opening[] = [];
    if (jsonPart) {
      const match = jsonPart.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed: unknown = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            for (const rect of parsed) {
              if (typeof rect !== "object" || rect === null) continue;
              const { x, y, w, h } = rect as Record<string, unknown>;
              if ([x, y, w, h].some((v) => typeof v !== "number" || !Number.isFinite(v))) continue;
              const rx = clamp(x as number);
              const ry = clamp(y as number);
              const rw = Math.min(100 - rx, Math.max(0, w as number));
              const rh = Math.min(100 - ry, Math.max(0, h as number));
              if (rw > 0 && rh > 0) openings.push({ x: rx, y: ry, w: rw, h: rh });
            }
          }
        } catch {
          // Openings are an optimisation; a grid without them still works.
        }
      }
    }

    return { cells, cols: GRID_COLS, rows: GRID_ROWS, openings };
  } catch {
    return null;
  }
}

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
  grid: FacadeGrid,
  width: number,
  height: number,
  growDownPercent: number,
): Promise<MaskAssets> {
  const cellW = width / grid.cols;
  const cellH = height / grid.rows;
  const grow = (growDownPercent / 100) * height;

  // Each occupied cell becomes a rectangle; adjacent cells merge visually into
  // one region once the whole thing is blurred.
  const cellRects: string[] = [];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      if (!grid.cells[row * grid.cols + col]) continue;
      const x = col * cellW;
      const y = row * cellH;
      // Overlap by a hair so neighbouring cells do not leave seams.
      cellRects.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellW + 1).toFixed(1)}" height="${(cellH + 1 + grow).toFixed(1)}" fill="white"/>`,
      );
    }
  }

  const pad = 0.6;
  const holes = grid.openings
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
    ${cellRects.join("")}
    ${holes}
  </svg>`;

  const replicateMask = await sharp(Buffer.from(svg)).greyscale().blur(2).png().toBuffer();

  const compositeAlpha = await sharp(Buffer.from(svg))
    .greyscale()
    .blur(2.5)
    .raw()
    .toBuffer();

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


/**
 * Recolours the wall deterministically instead of regenerating it.
 *
 * Inpainting discards the masked pixels and re-imagines them from surrounding
 * context, which is why no amount of prompting or pre-tinting produced the
 * specified ColorPlus colour — and why windows and rooflines kept drifting.
 *
 * Converting the wall to luminance and tinting it keeps the real shadows, board
 * lines, siding texture and every architectural detail of the homeowner's own
 * photo, and lands the exact hex from the palette. It is deterministic, free,
 * near-instant, and cannot hallucinate a window that is not there.
 */
export async function recolorSiding(
  imagePng: Buffer,
  compositeAlpha: Buffer,
  hex: string,
  width: number,
  height: number,
): Promise<Buffer> {
  const clean = hex.replace("#", "");
  const tr = Number.parseInt(clean.slice(0, 2), 16);
  const tg = Number.parseInt(clean.slice(2, 4), 16);
  const tb = Number.parseInt(clean.slice(4, 6), 16);

  const { data } = await sharp(imagePng)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const luminance = (r: number, g: number, b: number): number =>
    0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Mean brightness of the wall ONLY. Averaging the whole frame would drag the
  // exposure toward sky and lawn and leave the wall too dark or too light.
  let total = 0;
  let count = 0;
  for (let i = 0, p = 0; i < compositeAlpha.length; i += 1, p += 3) {
    if ((compositeAlpha[i] ?? 0) < 32) continue;
    total += luminance(data[p] ?? 0, data[p + 1] ?? 0, data[p + 2] ?? 0);
    count += 1;
  }
  const meanL = count > 0 ? total / count : 128;

  // Scale the target colour by each pixel's brightness relative to that mean.
  // The wall therefore averages EXACTLY the ColorPlus value while keeping the
  // real shading, board shadows and texture of the homeowner's own photo —
  // which a luminance-preserving tint could not do, because it kept the old
  // wall's brightness and washed a low-chroma colour out to grey.
  const out = Buffer.allocUnsafe(data.length);
  for (let i = 0, p = 0; i < compositeAlpha.length; i += 1, p += 3) {
    const l = luminance(data[p] ?? 0, data[p + 1] ?? 0, data[p + 2] ?? 0);
    // Compress the ratio a little so deep shadows do not crush to black.
    const ratio = Math.min(1.7, Math.max(0.35, 0.25 + 0.75 * (l / (meanL || 1))));
    out[p] = Math.min(255, Math.round(tr * ratio));
    out[p + 1] = Math.min(255, Math.round(tg * ratio));
    out[p + 2] = Math.min(255, Math.round(tb * ratio));
  }

  const wallWithAlpha = await sharp(out, { raw: { width, height, channels: 3 } })
    .joinChannel(compositeAlpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  return sharp(imagePng)
    .composite([{ input: wallWithAlpha, blend: "over" }])
    .png()
    .toBuffer();
}
