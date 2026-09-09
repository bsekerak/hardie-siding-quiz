/**
 * Vercel rejects serverless request bodies over ~4.5MB at the edge, before the
 * function runs — and a modern phone photo is routinely 8-12MB. Downscaling in
 * the browser keeps the upload well under that, and costs nothing in quality:
 * the API renders at 1024px square regardless.
 */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

export async function downscaleImage(file: File): Promise<File> {
  // Small enough already, and not a format we need to re-encode.
  if (file.size < 1_500_000) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) return file;

    return new File([blob], "house.jpg", { type: "image/jpeg" });
  } catch {
    // Older browser or a decode failure — let the server-side guard handle it.
    return file;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
