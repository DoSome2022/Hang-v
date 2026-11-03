import type { NextConfig } from "next";

// STANDALONE_BUILD=1 時輸出 standalone bundle（Docker / Playwright e2e 用）。
// 冇設（預設）就係普通 build，配合 `next start`（寶塔 Node 項目管理器 + PM2 的傳統部署）。
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["ioredis"],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
