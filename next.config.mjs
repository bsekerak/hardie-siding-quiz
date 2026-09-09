/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Vercel exposes the commit SHA at build time; fall back to a timestamp so
    // local builds still get a distinct identity.
    NEXT_PUBLIC_BUILD_ID:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? `local-${Date.now()}`,
  },
};

export default nextConfig;
