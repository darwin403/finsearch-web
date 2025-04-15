import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ! TEMP: Remove in future
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
