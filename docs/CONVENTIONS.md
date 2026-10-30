# CONVENTIONS — 編程要求

## 語言與框架
- TypeScript strict；Next.js 16 App Router（Turbopack）
- tRPC 負責所有資料進出，禁止在 component 直接碰 Prisma
- Zod 為唯一驗證來源，input/output 都要 validate
- Admin 驗證：NextAuth（僅 admin 一個角色），所有後台操作走 protectedProcedure

## 前端
- 前台（(public)）：Tailwind v4 inline utilities + 共用 class 常數（`src/lib/ui.ts`）；
  關鍵寫不到的 CSS（keyframes、focus-visible、reset）在 globals.css `@layer base`
- 後台（(admin)）：admin 色票 token + 共用 UI 在 `admin/_components/admin-ui.tsx`
- client component 保持最小；server component 讀 DB 一律經 `createCaller()`
- 表單載入遠端資料：等資料到齊先掛載表單子元件、用 useState 初始值載入，
  唔好喺 useEffect 度 setState（react-hooks/set-state-in-effect 規則）
- 讀 localStorage：用 `src/lib/stored-apply.ts` 的 useSyncExternalStore pattern（避免 hydration mismatch）

## 資料層
- Prisma schema 為單一真相；DB snake_case（@map）、TS camelCase
- 多對多用顯式關聯表，方便加欄位
- Case.content 為 JSON 契約（`src/server/case-content.ts`），parse/serialize 必須經呢個模組
- Application 存痛點快照，不依賴即時關聯
- Tag 名稱 unique；新 tag 預設入 key='pain' 的 group（`src/server/tags.ts` 的 ensureTagIds）

## 命名
- tRPC router：`xxxRouter`，procedure 用 `get/list/create/update/delete`（外加特定動作名）
- localStorage key 統一前綴：`consult_`（`src/lib/storage-keys.ts`）
- Redis key：`case:*`、`region:*`、`hangs:consult:*`、`hangs:login:fail:*`

## 日期
- tRPC 冇接 transformer：HTTP 回傳的 Date 實際是 ISO 字串
- 顯示一律經 `src/lib/format.ts`（formatDate/formatDateTime/toDateInputValue）
- date-only input（"YYYY-MM-DD"）→ UTC 午夜 Date，避免時區偏移

## 流程規則
- 公開頁只讀公開資料（publicProcedure）
- 快取：公開讀用 `cached()`；寫入後 `deleteByPattern` 失效；失效範圍寫註解
- root 與 (public) layout 唔可以呼叫 auth()/cookies()/headers()（保住 SSG）
- 改 prisma schema → `make check` 然後 `make test`（migrate deploy 到 test DB）

## 禁止
- 不引入 UI 庫、狀態管理庫（React Query + Tailwind 足夠）
- 不引入新嘅 Redis/DB 模組（統一用 `src/server/redis.ts`、`src/server/db.ts`）
- 不在 build 階段打 DB（動態頁用 force-dynamic；驗證：假 DATABASE_URL build）
- 不修改 harness 本身來讓 check 過關
