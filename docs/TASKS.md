# TASKS — 開發任務

## Phase 1：基礎
- [x] Prisma schema：Region, PainPoint, Case, Solution, Application
- [x] 多對多關聯表：Case↔PainPoint, Case↔Solution, Solution↔PainPoint
- [x] tRPC router 骨架 + Zod schema
- [x] NextAuth admin 驗證（protectedProcedure 中介層）

## Phase 2：Admin 後台
- [x] Region CRUD
- [x] PainPoint CRUD
- [x] Case CRUD（關聯痛點、方案）
- [x] Solution CRUD（關聯痛點）
- [x] Intro CRUD
- [x] Application 列表 + 處理（狀態切換）

## Phase 3：公開前台
- [x] 案例 card 列表（JSON 顯示即可）
- [x] card 點擊 → localStorage 寫入
- [x] 案例 Post 頁：內容 + 所用方案（相關案例見 Phase 4）
- [x] 申請表：自動帶入 Case 痛點供勾選 → 提交 tRPC
- [x] 提交後痛點快照寫入

## Phase 4：相關案例
- [x] 查詢邏輯：共用痛點或共用方案
- [x] Post 頁渲染相關案例

## Phase 5：收尾
- [x] 錯誤處理與 Zod 驗證覆蓋
- [x] 基本測試
