import { defineConfig } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

// 自動載入 .env（只填未設定的 key；make test-e2e 已 export 的測試環境變數優先）
loadEnvConfig(process.cwd());

// 一律偏好測試 DB（直接跑 npx playwright test 亦唔會碰到 dev DB）
const dbUrl = process.env.DATABASE_URL?.includes('claude_hangs_test')
  ? process.env.DATABASE_URL
  : process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? '';

// e2e 前置：scripts/test-e2e.sh 會起 db-test + migrate + seed + build，
// 再由本檔 webServer 啟動 standalone server。
// env 會取代整個環境，需手動透傳 DATABASE_URL / AUTH_* / REDIS_URL / SITE_URL。
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3107',
    browserName: 'chromium',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    // output: 'standalone' 下 `next start` 不適用，改用 standalone server。
    // 需先執行 `npm run build`；public（logo）與 static 先複製進 standalone 目錄。
    command: 'sh -c "rm -rf .next/standalone/public .next/standalone/.next/static && cp -r public .next/standalone/public && mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/ && PORT=3107 HOSTNAME=127.0.0.1 node .next/standalone/server.js"',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: dbUrl,
      AUTH_SECRET: process.env.AUTH_SECRET ?? '',
      AUTH_TRUST_HOST: 'true',
      AUTH_ADMIN_USERNAME: process.env.AUTH_ADMIN_USERNAME ?? '',
      AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD ?? '',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? '',
      ...(process.env.REDIS_URL ? { REDIS_URL: process.env.REDIS_URL } : {}),
    },
    url: 'http://127.0.0.1:3107',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
