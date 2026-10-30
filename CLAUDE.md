# CLAUDE.md — 項目總指南

## 項目性質
實瀚科技 HANGS：行銷官網（公開前台）+ 內容與申請管理後台（admin）。
只有 admin 一個角色，負責：管理區域/痛點/案例/方案/介紹/最新資訊/標籤/開發清單/帳目、處理所有申請。

## 技術棧
- Next.js 16（App Router、Turbopack、output: standalone）
- React 19 + Tailwind CSS v4（單一 globals.css，含前台品牌 + 後台 admin 兩套 @theme token）
- Prisma 6 + PostgreSQL（dev 5432 / test 5433，docker compose）
- tRPC 11 + Zod 4（所有資料進出；禁止 component 直接碰 Prisma）
- NextAuth v5（Credentials，僅 admin 一個角色，帳密在 .env）
- Redis 8（可選）：公開頁快取、登入限流、諮詢限流+排隊；統一入口 `src/server/redis.ts`
- 測試：vitest（整合，共享 test DB，fileParallelism 關閉）+ Playwright（tests/e2e）

## 路由架構（route groups）
- `(public)/` 行銷官網：57 頁靜態預渲染；`/cases`、`/cases/[slug]`、`/apply` 是 DB 驅動動態頁（force-dynamic，build 唔打 DB）
- `(admin)/` 後台：`(admin)/layout.tsx` 是 server 端 auth 守衛（redirect /admin/login）
- `(login)/` 登入頁（獨立 group 避免 redirect loop）
- root layout `src/app/layout.tsx` 只放 html/body/metadataBase，**不得**呼叫 auth()/cookies()/headers()（會令全站失去 SSG）

## 核心資料流
1. 公開站：靜態行銷內容（src/lib/service-catalog.ts / solutions.ts / site.ts）
2. 案例：admin 建立 Case（slug unique、content 為 JSON `{lead,sections,result}`，契約見 `src/server/case-content.ts`）→ 公開 `/cases` 讀 DB
3. 申請：案例詳情「申請」→ localStorage `consult_apply` {caseId,title} → `/apply` 勾痛點 → tRPC application.create（痛點快照入 DB）→ admin `/admin/apply/*` 處理
4. 諮詢：前台 modal → `/api/consult` → Redis 限流 + `hangs:consult:queue`
5. 申請狀態 5 值（見 `src/lib/constants.ts`）：pending 申請中 → quoted 報左價 → developing 開發中 → completed 已完成 / cancelled 取消

## 閱讀順序
1. `docs/ARCHITECTURE.md` — 資料模型與流程
2. `docs/CONVENTIONS.md` — 編程要求
3. `docs/HARNESS.md` — 驗證迴圈（改完程式跑 make check / make test）
4. `DEPLOY.md` — 生產部署

## 開發指令
- Node 22：先 `nvm use`（`.nvmrc`）
- `make setup` — 安裝依賴 + 起 dev DB + prisma generate/migrate
- `make db-seed` — 種子資料（可重複執行，idempotent）
- `make check` — tsc + prisma validate（每次 Claude 回覆後由 Stop hook 自動執行）
- `make lint` / `make test` / `make test-e2e` — eslint / vitest / playwright
- 本機 Redis：`docker compose --profile redis up -d redis`（本機已裝 Redis 可跳過）
- Next.js 16 有重大變更：寫 Next 相關碼前先查 `node_modules/next/dist/docs/`（見 `AGENTS.md`）

## 重要約束
- root 與 (public) layout 唔可以呼叫 auth()/cookies()/headers()
- tRPC 冇接 transformer：HTTP 回傳的 Date 實際是 ISO 字串，顯示一律經 `src/lib/format.ts`
- 刪除 Case/Region 會 cascade 刪除申請——admin 刪除按鈕已有確認警告，唔好移除
- 修改 prisma schema 後：`make check` 然後 `make test`（migrate deploy 到 test DB）
- Playwright webServer env 會取代整個環境，新環境變數要寫入 playwright.config.ts 與 scripts/test-e2e.sh
