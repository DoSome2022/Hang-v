# 實瀚科技 HANGS — 品牌官網 + 內容與申請管理後台

單一 Next.js 專案：白色為主的行銷官網（品牌綠 `#009c6f`、青檸綠 `#a9ce47`、深藍 `#162144`）+ 接上真實資料庫的管理後台。

## 技術

- Next.js 16（App Router、Turbopack）、React 19、TypeScript
- 前端：原生 Tailwind CSS v4 響應式設計；Lucide 圖示
- 後端：Prisma 6 + PostgreSQL、tRPC 11 + Zod、NextAuth v5（單一 admin）
- Redis 8：公開頁快取、登入限流、諮詢提交限流與排隊（未設定時優雅降級）
- 行銷頁 DB 驅動（admin 可編輯）：`/services` 全部分類與服務頁、`/choose-service`、`/cases`、`/r/[slug]`、`/apply`、後台；首頁與 `/solutions` 仍靜態預渲染
- Vitest（後端整合測試）+ Playwright（瀏覽器 e2e）
- Docker（standalone 輸出、non-root）+ 生產 compose（app + migrate + redis，經 NPM 反向代理）

## 啟動

需要 Node.js 20.9+，建議 Node.js 22 LTS。

```bash
cd /Users/user/Desktop/code/Hang/test_done/claude_hangs
nvm use                    # Node 22（.nvmrc）
cp .env.example .env       # 改 AUTH_SECRET 與 admin 帳密
make setup                 # npm install + dev DB(5432) + prisma migrate
make db-seed               # 種子資料（3 篇案例、標籤、痛點、方案、news、devs、accounts）
make dev                   # http://localhost:3000
```

此電腦的非互動 shell 未預設載入 Node。如出現 `node: command not found`，先執行：

```bash
export PATH="/Users/user/.nvm/versions/node/v22.20.0/bin:$PATH"
```

## 指令

```bash
make check      # tsc --noEmit + prisma validate（每次 Claude 回覆後由 Stop hook 自動執行）
make lint       # eslint .
make test       # 起 test DB(5433) + migrate deploy + vitest
make test-e2e   # test DB + migrate + seed + build + playwright
make dev / make db-reset / make db-seed / make clean
```

首次在另一台電腦執行瀏覽器測試前，可執行 `npx playwright install chromium`。e2e 使用 production build 在 3107 埠測試，不共用 3000 埠。

## 頁面架構

| 路由 | 內容 |
| --- | --- |
| `/` | 行銷首頁（Hero、五大服務、主打方案、FAQ…） |
| `/solutions/{solo,sme,enterprise}` | 三類客群解決方案頁 |
| `/services`、`/services/[category]`、`/services/[category]/[service]` | **服務目錄（DB 驅動，admin `/admin/services` 可編輯，seed 匯入）** |
| `/choose-service` | 選擇服務互動頁 |
| `/cases`、`/cases/[slug]` | **真實案例（讀資料庫，admin 建立即公開）** |
| `/r/[slug]` | **區域公開頁（DB 驅動；區域名稱、公司介紹、區內案例＋申請、痛點／方案、諮詢 CTA）** |
| `/apply` | **案例申請（痛點勾選 → 寫入 Application）** |
| `/admin/login` | 後台登入（NextAuth，帳密在 `.env`） |
| `/admin/**` | 後台：dashboard、申請（5 狀態）、案例/痛點/方案/區域/介紹/最新資訊/標籤/開發清單/帳目 |

## 兩種提交機制

1. **預約諮詢**：`POST /api/consult` → Redis 限流（per-IP 5 次/10 分鐘、全域 100 次/小時）→ 排入 `hangs:consult:queue`（上限 1000）。Redis 不可用回 503，前端保留可複製摘要。目前未有 queue consumer（email/CRM worker 待接）。
2. **案例申請**：`/apply`（痛點勾選 + 快照）→ tRPC → PostgreSQL Application。後台 `/admin/apply/*` 以 5 狀態管理：申請中 → 報左價 → 開發中 → 已完成／取消。

## Redis 降級行為

- 公開頁快取與登入限流：Redis 不可用 → fail-open（直查 DB／不限流）
- 諮詢提交：Redis 不可用 → 503；`/api/health` → 200 `degraded`
- DB 是必要依賴：`/api/health` 在 DB down 時回 503（容器會被標記 unhealthy）
- 本機未裝 Redis：`docker compose --profile redis up -d redis`

## Docker 與部署

```bash
# dev
docker compose up -d db          # 5432
docker compose --profile redis up -d redis   # 6379（本機已有 Redis 可跳過）
# prod（NPM 反向代理 + shared-db，見 DEPLOY.md）
NEXT_PUBLIC_SITE_URL=https://你的正式網域 docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
curl http://localhost:3000/api/health
```

- app 只綁 `127.0.0.1`，對外一律經 NPM（覆寫 `X-Forwarded-For`）；redis 不對外開 port（AOF 持久化）
- 鏡像內以非 root `node` user 執行；`NEXT_PUBLIC_SITE_URL` 是 build argument
- migrate 服務每次 `compose up` 跑 `prisma migrate deploy`；**seed 唔會自動跑**（首次內容手動 `npx prisma db seed`）

## SEO / AEO

- 每頁 metadata（title/description/canonical/OG/Twitter）、動態品牌分享圖 `/opengraph-image`
- Organization / WebSite / Service / FAQPage / Article / CollectionPage / BreadcrumbList JSON-LD
- sitemap 含 DB 案例與區域頁；robots 依 `NEXT_PUBLIC_SITE_URL`（未設定時全站 noindex）
- 案例詳情頁 Article schema（datePublished/keywords）

## 上線前需要確認

- 將目前臨時 H 字形標誌替換成正式公司 logo
- 提供正式網域、公司電郵、電話／WhatsApp 及地址；設定 `NEXT_PUBLIC_SITE_URL` 後重新 build
- 接入諮詢佇列的 consumer（email／WhatsApp／CRM）及私隱政策
- 核實「15 年以上」、「200+ 企業服務經驗」等對外文案口徑
- 生產環境放在可信反向代理／CDN 後面（覆寫 `X-Forwarded-For`）；Redis 視需要加認證
- 後台 admin 密碼請改用強密碼並定期輪換

## 主要檔案

```text
prisma/schema.prisma           資料模型（Region/Intro/PainPoint/Case/Solution/Application/Tag/News/DevProject/Account）
prisma/seed.ts + seed-data/    種子資料（3 篇案例長文、標籤、痛點、方案、news、devs、accounts）
src/app/(public)/              行銷官網（57 頁 + /cases、/apply 動態頁）
src/app/(admin)/               後台（tRPC 接線）
src/app/(login)/               後台登入（NextAuth）
src/app/api/                   auth / trpc / consult / health
src/components/                前台共用元件（site-shell、shared-ui、home、page-blocks…）
src/lib/                       內容資料（service-catalog、solutions、site）、constants、format、redis client
src/server/                    db、auth、redis、cache、case-content、api/routers/*
tests/                         vitest（app/routers/cache）+ tests/e2e/（Playwright）
Dockerfile / docker-compose*.yml / DEPLOY.md
```

詳細架構見 `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/HARNESS.md`。
