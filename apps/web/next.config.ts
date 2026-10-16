import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@betterbookmark/shared", "@betterbookmark/db"],
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
