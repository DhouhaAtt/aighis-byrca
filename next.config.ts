import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so local builds and Vercel builds resolve modules
  // identically. Without this Next infers the root from the nearest lockfile,
  // which differs between machines.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
