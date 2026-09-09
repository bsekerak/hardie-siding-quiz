/**
 * Text-prompted segmentation on Replicate.
 *
 * Replaces asking a language model to draw a polygon — which returns bounding
 * boxes however it is phrased — with a model built to produce pixel masks.
 *
 * Community model slugs need a pinned version, so the version is resolved from
 * the API at call time rather than hard-coded and left to rot.
 */
export interface SegmentAttempt {
  model: string;
  ok: boolean;
  detail: string;
  maskBase64?: string;
}

const CANDIDATES: ReadonlyArray<{
  owner: string;
  name: string;
  build: (imageDataUri: string) => Record<string, unknown>;
}> = [
  {
    owner: "schananas",
    name: "grounded_sam",
    build: (image) => ({
      image,
      mask_prompt: "house siding, exterior wall cladding",
      negative_mask_prompt: "window, door, roof, sky, tree, grass, driveway, shrub",
      adjustment_factor: 0,
    }),
  },
  {
    owner: "lucataco",
    name: "segment-anything-2",
    build: (image) => ({ image, mask_prompt: "house siding walls" }),
  },
];

async function resolveVersion(owner: string, name: string, token: string): Promise<string | null> {
  const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const data: unknown = await response.json();
  const version = (data as { latest_version?: { id?: string } }).latest_version?.id;
  return typeof version === "string" ? version : null;
}

async function toBase64(value: unknown): Promise<string | null> {
  const first = Array.isArray(value) ? value[value.length - 1] : value;
  if (typeof first === "string" && first.startsWith("http")) {
    const response = await fetch(first);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer()).toString("base64");
  }
  if (first && typeof first === "object") {
    const candidate = first as { url?: (() => URL | string) | string; blob?: () => Promise<Blob> };
    if (typeof candidate.blob === "function") {
      const blob = await candidate.blob();
      return Buffer.from(await blob.arrayBuffer()).toString("base64");
    }
    if (typeof candidate.url === "function") {
      const url = candidate.url();
      return toBase64(typeof url === "string" ? url : url.toString());
    }
  }
  return null;
}

/** Probes each candidate and reports what happened, for diagnosis. */
export async function probeSegmentation(imagePng: Buffer): Promise<SegmentAttempt[]> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return [{ model: "-", ok: false, detail: "REPLICATE_API_TOKEN not set" }];

  const { default: Replicate } = await import("replicate");
  const replicate = new Replicate({ auth: token });
  const imageDataUri = `data:image/png;base64,${imagePng.toString("base64")}`;
  const attempts: SegmentAttempt[] = [];

  for (const candidate of CANDIDATES) {
    const slug = `${candidate.owner}/${candidate.name}`;
    try {
      const version = await resolveVersion(candidate.owner, candidate.name, token);
      if (!version) {
        attempts.push({ model: slug, ok: false, detail: "model not found or no version" });
        continue;
      }
      const output = await replicate.run(`${slug}:${version}` as `${string}/${string}:${string}`, {
        input: candidate.build(imageDataUri),
      });
      const maskBase64 = await toBase64(output);
      attempts.push(
        maskBase64
          ? { model: slug, ok: true, detail: `version ${version.slice(0, 8)}`, maskBase64 }
          : { model: slug, ok: false, detail: "ran but returned no readable mask" },
      );
      if (maskBase64) break;
    } catch (error) {
      attempts.push({
        model: slug,
        ok: false,
        detail: (error instanceof Error ? error.message : String(error)).slice(0, 160),
      });
    }
  }

  return attempts;
}
