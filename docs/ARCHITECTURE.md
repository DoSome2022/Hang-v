# ARCHITECTURE — 資料模型與流程

## 實體關係

```
Region（區域）
  ├─ 含多個 Case / Solution / PainPoint / Intro
  └─ 各內容實體皆有 regionId 外鍵

TagGroup（標籤群組：industry 行業 / pain 痛點 / audience 對象）
  └─ Tag（name unique）
      ├─ CaseTag（案例 ↔ 標籤，M2M）
      └─ NewsTag（資訊 ↔ 標籤，M2M）

PainPoint（痛點）↔ Case（M2M）↔ Solution（M2M）
Solution ↔ PainPoint（M2M）

Application（申請）
  ├─ 記錄來源 Case + 痛點快照（painPointsSnapshot JSON）
  └─ 狀態：pending → quoted → developing → completed | cancelled

News（最新資訊）：draft / published
DevProject → DevPart（checklist JSON）→ DevComment
Account（帳目）：quotation / invoice / receipt
```

## 案例 content JSON 契約

`Case.content` 存 JSON 字串（契約：`src/server/case-content.ts`）：

```json
{
  "lead": "導言",
  "sections": [{ "heading": "背景", "paragraphs": ["…"], "bullets": ["…"] }],
  "result": { "label": "整體成效", "value": "行政時間慳 60%", "note": "…" }
}
```

- `parseCaseContent` 容忍舊純文字 content（fallback 成單一 section），唔會爆 500
- 卡片高頻欄位（slug/summary/category/english/excerpt/readTime/publishedAt）放獨立欄位，列表唔使 parse 長文

## 公開查詢與快取

| 端點 | 快取 key | TTL | 失效 |
| --- | --- | --- | --- |
| region.list / get / getById | `region:*` | 300s | region 寫入 |
| case.listPublic / getPublicBySlug / getPublic | `case:*` | 120-300s | case/painPoint/solution/tag 寫入、region 刪除 |
| 諮詢限流 | `hangs:consult:rl:*` | 600s/3600s | 自然過期 |
| 登入限流 | `hangs:login:fail:<sha256(ip)>` | 900s | 成功登入清除 |
| 諮詢佇列 | `hangs:consult:queue` | — | LTRIM 1000 |

- Redis 不可用：快取/限流 fail-open，諮詢提交 503，`/api/health` 200 degraded
- DB 不可用：`/api/health` 503（Docker 容器 unhealthy）

## 公開前台（(public) route group）

- 57 個行銷頁靜態預渲染（generateStaticParams + dynamicParams=false）
- `/cases`、`/cases/[slug]`、`/apply`：`dynamic = 'force-dynamic'`，經 `createCaller()` 讀 DB——**build 唔打 DB**（驗證：假 DATABASE_URL build）
- `/apply` 資料流：案例頁 ApplyLink 寫 localStorage `consult_apply` → 表單（痛點預設全選）→ `application.create`（驗證痛點屬於案例、寫快照）→ 清 localStorage
- sitemap 動態加入 DB 案例（DB 掛咗仍回 200）
- 相關案例判定：共用任一 tag / 痛點 / 方案（排除自己，最多 3）

## Admin 後台（(admin) route group）

- `(admin)/layout.tsx`：server 端 `auth()` 守衛，未登入 redirect `/admin/login`；robots noindex
- 所有 admin 操作經 protectedProcedure（session.user 存在即可；目前只有 Credentials 一個 provider）
- 頁面全部 client component + tRPC hooks；mutation 成功後 invalidate 相關 query

## 登入（NextAuth v5）

- Credentials provider，帳密比對 `AUTH_ADMIN_USERNAME` / `AUTH_ADMIN_PASSWORD`（.env）
- JWT session（預設 30 天）；role 寫入 token
- 登入限流：同 IP 失敗 5 次鎖 15 分鐘（Redis Lua 原子 INCR+EXPIRE；Redis 不可用 fail-open）
- 注意：`clientIp()` 取 x-forwarded-for 第一個值——生產必須由可信反向代理覆寫

## 諮詢表單（/api/consult）

1. Redis 不可用 → 503
2. 限流：per-IP 5 次/600s + 全域 100 次/3600s（單一 Lua script 原子執行）→ 429 + Retry-After
3. 驗證表單欄位（name/email/message 必填 + 長度上限）→ 400
4. `LPUSH + LTRIM 1000` 排入 `hangs:consult:queue`
5. 目前冇 consumer（email/CRM worker 待接）——「已接收」= 進入佇列，唔等於有人已回覆

## Docker 部署

- Dockerfile 三階段：deps（npm ci）→ build（dummy DB + prisma generate + next build）→ runner（standalone + static + public + prisma engine、USER node、HEALTHCHECK /api/health）
- dev compose：db(5432) + db-test(5433) + redis（profile 選用）
- prod compose：redis（AOF、maxmemory 256mb、healthcheck、唔開 port）+ migrate（deploy）+ app（綁 127.0.0.1，NPM 反代）
- `NEXT_PUBLIC_SITE_URL` build 時注入（未設 → 全站 noindex）
