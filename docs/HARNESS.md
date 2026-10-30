# HARNESS — 給 Claude Code 的驗證迴圈

## 用途
改完程式後，用固定指令自我驗證，確認沒改壞。

## 何時跑什麼

| 情況 | 指令 |
|---|---|
| 改任何 .ts / .tsx | `make check` |
| 改 prisma schema | `make check` 然後 `make test` |
| 改 DB 相關邏輯 / router | `make test` |
| 改公開頁 / 後台 UI | `make check` + `make lint`，有需要 `make test-e2e` |
| 改 build / docker / redis | `make test-e2e` + 假 DB build |
| 不確定 | `make check` 先跑，錯了再看 |

## Targets

### `make check`（快，秒級）
- `tsc --noEmit`：型別檢查
- `prisma validate`：schema 語法檢查
- 失敗即非零退出（Stop hook 每次回覆後自動跑）

### `make lint`（快）
- `eslint .`（next core-web-vitals + typescript + react-hooks）
- 特別注意 `react-hooks/set-state-in-effect`：表單載入資料用「掛載式子元件」pattern

### `make test`（中，需 docker）
- 起 test DB（port 5433）
- `prisma migrate deploy`
- vitest（tests/*.test.ts；fileParallelism 關閉，共享 test DB）

### `make test-e2e`（慢，需 docker + chromium）
- 起 db-test → migrate deploy → seed → build → playwright（port 3107）
- e2e 用 Redis /1 隔離，唔會污染 dev 快取
- 首次要 `npx playwright install chromium`

### 其他
- `make setup`：npm install + dev DB + prisma generate/migrate
- `make db-seed`：種子資料（idempotent）
- `make dev` / `make db-reset` / `make clean`

## 假 DB build（驗證 build 不打 DB）

```bash
DATABASE_URL="postgresql://x:x@127.0.0.1:5999/x?schema=public" npm run build
```

build 必須成功；`/cases`、`/cases/[slug]`、`/apply`、sitemap 應為動態（ƒ）。

## 失敗排查
- `make check` 失敗 → 看 tsc 錯誤行號，修型別
- `make test` 失敗 → 先確認 docker 有跑：`docker compose ps`（db-test 5433）
- e2e 失敗 → `tail -50 /tmp/e2e_out.log` 或看 `test-results/*/error-context.md`；瀏覽器版本錯跑 `npx playwright install chromium`
- DB 連不上 → `docker compose logs db` 或 `db-test`
- 登入 MissingSecret → .env 的 AUTH_SECRET 未設定/未 export

## 原則
- 不改 harness 本身來讓 check 過關
- 修程式，不是修檢查
- 若真的要改 harness，先說明原因
