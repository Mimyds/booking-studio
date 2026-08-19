import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      tailwindcss: `${process.cwd()}/node_modules/tailwindcss/index.css`,
    },
  },
};

export default nextConfig;
