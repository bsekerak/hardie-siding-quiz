/**
 * Brand-colored confetti for the results reveal. Loaded dynamically so the
 * library never enters the server bundle, and skipped entirely for anyone who
 * has asked their OS to reduce motion.
 */
const BRAND_COLORS = ["#C8963E", "#16382C", "#E0B76A", "#F4F1EA", "#2F6350"];

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export async function celebratePlan(): Promise<void> {
  if (prefersReducedMotion()) return;

  try {
    const { default: confetti } = await import("canvas-confetti");

    // Two offset bursts read as a single celebratory sweep rather than a
    // cannon aimed at the middle of the reader's plan.
    confetti({
      particleCount: 70,
      spread: 62,
      startVelocity: 42,
      origin: { x: 0.2, y: 0.32 },
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
      scalar: 0.95,
    });

    window.setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 62,
        startVelocity: 42,
        origin: { x: 0.8, y: 0.32 },
        colors: BRAND_COLORS,
        disableForReducedMotion: true,
        scalar: 0.95,
      });
    }, 140);
  } catch {
    // A confetti failure must never take the results dashboard down with it.
  }
}
