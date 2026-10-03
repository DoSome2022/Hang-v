# CLAUDE.md — 項目總指南

## 項目性質
平台型網站。只有 admin 一個角色，負責：管理內容、處理所有申請、建立各區域內容。
每個「區域」本質上是一個可做申請動作的網頁（暫定）。

## 技術棧
- Next.js 16（App Router）
- Prisma 6 + PostgreSQL
- tRPC
- Zod
- NextAuth（admin 驗證，僅 admin 一個角色）
- 前端極簡：能顯示 JSON 數據即可

## 當前區域：顧問內容
幫人解決問題（痛點）。內容含：
- 顧問公司自我介紹
- 痛點（核心，admin 後台建立）
- 案例（公開，card 列表）
- 方案（admin 後台，案例 post 內顯示所用方案）

## 核心流程
1. 用戶看案例 card 列表
2. 點 card → 數據存 localStorage
3. 填申請表 → 提交
4. 後台看到：card 數據 + 該 card 的痛點（可多個）

## 案例 Post（公開）
- 顯示案例內容 + 所用方案
- 顯示其他相關案例（關聯依據：共用痛點 或 共用方案）

## 閱讀順序
1. `docs/ARCHITECTURE.md` — 數據模型與流程
2. `docs/TASKS.md` — 開發任務
3. `docs/CONVENTIONS.md` — 編程要求
4. `docs/HARNESS.md` — 驗證迴圈（改完程式跑 `make check` / `make test`）

## 開發指令
- 需要 Node ≥ 20：先 `nvm use`（`.nvmrc` 已指定 22）
- `make setup` — 安裝依賴 + 啟動 dev DB（docker）+ prisma generate/migrate
- `make check` — `tsc --noEmit` + `prisma validate`（每次 Claude 回覆後由 Stop hook 自動執行）
- `make test` — 啟動 test DB（5433）+ prisma migrate deploy（vitest 尚未配置）
- `make dev` / `make db-reset` / `make clean` — 啟動 dev server / 重置 dev DB / 清理建置產物
- 資料庫：docker compose（db=5432 dev、db-test=5433 test）；Postgres.app 須停用（5432 埠衝突）
- 環境變數：`cp .env.example .env`；admin 帳密在 `.env` 的 `AUTH_ADMIN_USERNAME` / `AUTH_ADMIN_PASSWORD`
- Next.js 16 有重大變更：寫 Next 相關碼前先查 `node_modules/next/dist/docs/`（見 `AGENTS.md`）
