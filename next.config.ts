import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["swisseph", "swisseph-v2"],
  experimental: {
    outputFileTracingIncludes: {
      "/*": [
        "./node_modules/swisseph/ephe/**/*",
        "./node_modules/swisseph/**/*.node"
      ],
      "/api/**/*": [
        "./node_modules/swisseph/ephe/**/*",
        "./node_modules/swisseph/**/*.node"
      ]
    }
  }
};

export default nextConfig;
