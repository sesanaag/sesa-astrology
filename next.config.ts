import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 1. Tell Vercel NOT to bundle the native C++ binaries
  serverExternalPackages: ["swisseph", "swisseph-v2"],
  experimental: {
    // 2. Force Vercel to copy the ephemeris data files to the serverless functions
    outputFileTracingIncludes: {
      "/*": ["./node_modules/swisseph/ephe/**/*"],
      "/api/**/*": ["./node_modules/swisseph/ephe/**/*"]
    }
  }
};

export default nextConfig;
