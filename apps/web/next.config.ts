import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@betterbookmark/shared"],
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
