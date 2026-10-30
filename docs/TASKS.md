# TASKS — 開發任務

## Phase 1：基礎（後端）
- [x] Prisma schema：Region, PainPoint, Case, Solution, Application
- [x] 多對多關聯表：Case↔PainPoint, Case↔Solution, Solution↔PainPoint
- [x] tRPC router 骨架 + Zod schema
- [x] NextAuth admin 驗證（protectedProcedure 中介層）
- [x] Redis：公開頁快取 + 登入限流（fail-open）

## Phase 2：Admin 後台
- [x] Region / PainPoint / Case / Solution / Intro CRUD
- [x] Application 列表 + 5 狀態切換（pending/quoted/developing/completed/cancelled）
- [x] News / Tag / DevProject / Account 模型 + CRUD（合併時擴充）
- [x] Dashboard 真實統計

## Phase 3：公開前台
- [x] 行銷官網 57 頁（靜態預渲染）
- [x] /cases、/cases/[slug] DB 驅動（seed 3 篇案例長文）
- [x] 案例申請流程：ApplyLink → localStorage → /apply → application.create
- [x] 諮詢表單 → /api/consult → Redis 限流 + 佇列
- [x] 相關案例（共用 tag/痛點/方案）

## Phase 4：收尾
- [x] 錯誤處理與 Zod 驗證覆蓋（長度上限、5 狀態 enum）
- [x] vitest 22 tests + Playwright 66 tests
- [x] Docker standalone + prod compose + NPM 部署文件
- [x] SEO 全套（metadata/JSON-LD/sitemap 含 DB 案例/robots/OG 圖）

## 後續（未做）
- [ ] 諮詢佇列 consumer（email/WhatsApp/CRM worker）
- [ ] Application 刪除案例時改 Restrict 或加 caseTitle 快照（避免連帶刪申請）
- [ ] 正式公司 logo、正式網域與私隱政策
- [ ] admin 密碼雜湊儲存、JWT maxAge 縮短
- [ ] 公開端點全局限流（非 Redis 限流的部分）
