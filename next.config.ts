import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ! TEMP: Remove in future
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false, // Prevents double rendering components by default while developing.
};

export default nextConfig;
