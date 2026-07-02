import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    workerThreads: true,
  },
};

export default nextConfig;
