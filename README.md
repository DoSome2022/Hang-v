# claude_hangs

平台型網站：admin 管理內容與申請，用戶在公開頁瀏覽案例並提交申請。

技術棧：Next.js 16（App Router）+ Prisma 6 + PostgreSQL + tRPC + Zod + NextAuth v5。

## 快速開始

```bash
nvm use          # Node 22（.nvmrc）
cp .env.example .env
make setup       # 安裝依賴 + 啟動 dev DB + prisma migrate
make dev         # http://localhost:3000
```

Admin 登入：`/login`，帳密在 `.env` 的 `AUTH_ADMIN_USERNAME` / `AUTH_ADMIN_PASSWORD`。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `make setup` | 安裝依賴、啟動 dev DB、prisma generate + migrate |
| `make check` | `tsc --noEmit` + `prisma validate` |
| `make test` | 啟動 test DB（5433）+ migrate deploy |
| `make dev` | 啟動 dev server |
| `make db-reset` | 重置 dev 資料庫 |

詳細架構與規範見 `CLAUDE.md` 與 `docs/`。
