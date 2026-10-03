# CONVENTIONS — 編程要求

## 語言與框架
- TypeScript strict
- Next.js 16 App Router
- tRPC 負責所有資料進出，禁止在 component 直接碰 Prisma
- Zod 為唯一驗證來源，input/output 都要 validate
- Admin 驗證：NextAuth（僅 admin 一個角色）

## 前端
- 極簡：可只 render JSON
- 不做多餘樣式與動畫
- 需要互動處（如 card 點擊）用最小 client component

## 資料層
- Prisma schema 為單一真相
- 多對多用顯式關聯表，方便加欄位
- Application 存痛點快照，不依賴即時關聯

## 命名
- DB：snake_case
- TS：camelCase
- tRPC router：`xxxRouter`，procedure 用 `get/list/create/update/delete`

## 流程規則
- 公開頁只讀公開資料（Case 公開，Solution 不公開）
- Admin 操作一律走 protectedProcedure
- localStorage key 統一前綴：`consult_`

## 禁止
- 不引入 UI 庫（除非明確要求）
- 不引入狀態管理庫（localStorage + tRPC 足夠）
- 不提前優化，先讓流程跑通
