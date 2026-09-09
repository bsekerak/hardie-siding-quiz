/**
 * Normalizes any user photo into a modest JPEG before upload.
 *
 * Two problems this solves:
 *  1. Vercel rejects serverless request bodies over ~4.5MB at the edge, and a
 *     modern phone photo is routinely 8-12MB.
 *  2. iPhones shoot HEIC by default. Re-encoding through a canvas hands the
 *     server a plain JPEG regardless of what the camera produced, so the
 *     server-side decoder never has to deal with an exotic format.
 *
 * Re-encoding costs nothing in quality: the API renders at 1024px square.
 */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

export class ImageDecodeError extends Error {
  constructor() {
    super(
      "Your browser couldn't read that image. iPhone photos are often HEIC — either export it as JPEG, or set Settings → Camera → Formats → Most Compatible and retake it.",
    );
    this.name = "ImageDecodeError";
  }
}

/** Preferred path: fast, and honours EXIF orientation explicitly. */
async function decodeViaBitmap(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }
}

/**
 * Fallback path: an <img> element uses the browser's full image decoder, which
 * on Safari includes system HEIC support that createImageBitmap may refuse.
 */
async function decodeViaImgElement(file: File): Promise<HTMLImageElement | null> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    const loaded = await new Promise<boolean>((resolve) => {
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
    });
    return loaded ? image : null;
  } finally {
    // Revoke after the bitmap has been drawn by the caller on the next tick.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

function drawToJpeg(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
): Promise<Blob | null> {
  const scale = Math.min(1, MAX_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);

  // A white ground avoids black edges if the source carries transparency.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
}

export async function downscaleImage(file: File): Promise<File> {
  const bitmap = await decodeViaBitmap(file);
  if (bitmap) {
    const blob = await drawToJpeg(bitmap, bitmap.width, bitmap.height);
    bitmap.close();
    if (blob) return new File([blob], "house.jpg", { type: "image/jpeg" });
  }

  const image = await decodeViaImgElement(file);
  if (image) {
    const blob = await drawToJpeg(image, image.naturalWidth, image.naturalHeight);
    if (blob) return new File([blob], "house.jpg", { type: "image/jpeg" });
  }

  throw new ImageDecodeError();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
