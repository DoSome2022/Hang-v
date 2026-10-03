# HARNESS — 給 Claude Code 的驗證迴圈

## 用途
改完程式後，用固定指令自我驗證，確認沒改壞。
Claude 只需記住兩個指令：`make check`、`make test`。

## 何時跑什麼

| 情況 | 指令 |
|---|---|
| 改任何 .ts / .tsx | `make check` |
| 改 prisma schema | `make check` 然後 `make test` |
| 改 DB 相關邏輯 | `make test` |
| 不確定 | `make check` 先跑，錯了再看 |

## Targets

### `make check`（快，秒級）
- `tsc --noEmit`：型別檢查
- `prisma validate`：schema 語法檢查
- 失敗即非零退出

### `make test`（中，需 docker）
- 起 test DB（port 5433）
- 對 test DB 跑 `prisma migrate deploy`
- 驗證 schema 能套用、DB 連得上
- 跑 vitest 整合測試（`tests/*.test.ts`，需 DATABASE_URL 指向測試 DB）

### `make setup`（慢，首次用）
- npm install
- 起 dev DB（port 5432）
- prisma generate + migrate

### `make dev`
- 起 next dev

### `make db-reset`
- 重置 dev DB（會清資料）

### `make clean`
- 清 .next 與快取

## 失敗排查
- `make check` 失敗 → 看 tsc 錯誤行號，修型別
- `make test` 失敗 → 先確認 docker 有跑：`docker compose ps`
- DB 連不上 → `docker compose logs db` 或 `db-test`

## 原則
- 不改 harness 本身來讓 check 過關
- 修程式，不是修檢查
- 若真的要改 harness，先說明原因