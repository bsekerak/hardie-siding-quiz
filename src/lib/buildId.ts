/**
 * Identifies the build a bundle came from. The client compares its own
 * compiled-in value against what the server reports; a mismatch means the
 * browser is running a stale bundle from a previous deploy.
 */
export const BUILD_ID: string = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
