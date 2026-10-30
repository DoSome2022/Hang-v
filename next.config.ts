import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 部署用：輸出獨立 bundle（.next/standalone），Docker 內直接 node server.js
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["ioredis"],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
