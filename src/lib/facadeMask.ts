import sharp from "sharp";

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
    // Keep every pixel close to the target. The previous window (0.35-1.7) blew
    // out on a light-coloured house: most pixels sat above the mean, got scaled
    // up, and Mountain Sage arrived as pale mint. Deviation is now capped at
    // +/-30%, which is enough to read board shadows without losing the hue.
    const ratio = Math.min(1.3, Math.max(0.7, 0.35 + 0.65 * (l / (meanL || 1))));
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
