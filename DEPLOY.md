# 部署指南（騰訊雲輕量伺服器・香港・NPM 已裝・方案 B 共用 PG）

架構：`NPM (80/443) → npm-net → claude-hangs-app (Next 16 standalone :3000) → shared-db (claude_hangs_db) + redis`

```
公網 ──► NPM ──► app（Next.js 自己 serve 行銷官網 + 後台 + tRPC + NextAuth）
                   │
                   ├──► shared-db（共用 PG，database: claude_hangs_db）
                   └──► redis（公開頁快取 + 登入限流 + 諮詢限流/佇列）

（migrate 係一次性服務：每次 compose up 先跑 prisma migrate deploy，成功後 app 先起）
```

## Redis 功能

| 功能 | 位置 | 行為 |
|---|---|---|
| 公開頁快取 | `src/server/cache.ts` + region/case routers | `region:*` TTL 5 分鐘、`case:*` 列表 2 分鐘/詳情 5 分鐘；admin 寫入即時失效 |
| 登入限流 | `src/server/auth.ts` | 同 IP 失敗 5 次 → 鎖 15 分鐘（Lua 原子 INCR+EXPIRE）；Redis 唔可用 **fail-open** |
| 諮詢限流 + 佇列 | `src/app/api/consult/route.ts` | per-IP 5 次/10 分鐘 + 全域 100 次/小時（Lua 原子）；`hangs:consult:queue` 上限 1000；Redis 唔可用 → 503 |

**Redis 唔可用時**：快取直落 DB、限流放行、`/api/health` 回 200 `degraded`——app 唔會 crash、唔會被 docker 判定 unhealthy。
**DB 唔可用時**：`/api/health` 回 503（容器 unhealthy）。

## 部署前檢查

- [ ] DNS A record 已指向伺服器 IP
- [ ] `.env` 上伺服器（`AUTH_SECRET` 用 `openssl rand -base64 32` 產生；`AUTH_ADMIN_USERNAME`/`AUTH_ADMIN_PASSWORD` **上線前一定要改**）
- [ ] `.env` 加 `POSTGRES_PASSWORD`（同 shared-db 密碼一致）
- [ ] `.env` 加 `NEXT_PUBLIC_SITE_URL=https://你的正式網域`（build 時注入；未設全站 noindex）
- [ ] shared-db 已起（`docker compose up -d`，會自動建 `claude_hangs_db`）

## 一次性設定（每部伺服器做一次）

```bash
docker network create npm-net
docker network connect npm-net <你個NPM容器名>
```

> 輕量機得 2GB RAM 嘅話，跑 PG + Next 前建議加 swap。

## 首次部署

```bash
cd claude_hangs
# 上傳 .env 後：
NEXT_PUBLIC_SITE_URL=https://你的正式網域 docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps        # app 應 healthy
# 首次內容（3 篇案例、標籤、news 等種子資料）——seed 唔會自動跑：
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

> seed 全 upsert、可重複執行，唔會覆蓋既有資料。

## NPM 面板設定

1. **Proxy Hosts → Add Proxy Host**：
   - Domain：`你的域名`
   - Forward Hostname/IP：`claude-hangs-app`　Port：`3000`
   - 開 **Block Common Exploits**、**Websockets Support**
   - **Advanced → Custom Nginx Configuration**（覆寫而非附加 XFF，限流先可信）：
     ```nginx
     proxy_set_header X-Forwarded-For $remote_addr;
     ```
2. **SSL**：Request a New Certificate → Force SSL
3. app 只綁 `127.0.0.1`，3000 埠唔會暴露公網

## 之後每次更新

```bash
cd claude_hangs
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

## 注意事項

- **本地開發**：`make setup` / `make dev` / `make test` / `make test-e2e` / `make db-seed`
- **本地 Redis**：`docker compose --profile redis up -d redis`（本機已裝 Redis 可跳過）
- **模型改動**：`prisma migrate dev` 生成 migration → commit → 部署時 `migrate deploy` 自動套用
- **admin 登入**：`/admin/login`，帳密喺 `.env`（NextAuth JWT session）
- **諮詢佇列觀察**：`docker compose -f docker-compose.prod.yml exec redis redis-cli LLEN hangs:consult:queue`
- **健康檢查語義**：DB down → 503（unhealthy）；Redis down → 200 degraded（唔會誤重啟）

## 資料備份

```bash
# PG（跟 shared-db 統一）
docker exec shared-db pg_dump -U popo claude_hangs_db > backup_claude_hangs_$(date +%F).sql
# Redis（AOF 已開，volume redis-data；需要時一併備份）
docker compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE
```

## 疑難排解

| 問題 | 處理 |
|---|---|
| migrate 失敗 | `docker compose -f docker-compose.prod.yml logs migrate`；schema 改咗要先生成 migration |
| 登入 redirect loop | `AUTH_SECRET` 有冇填（非空）+ `AUTH_TRUST_HOST`（compose 已設 true） |
| 連唔到 DB | shared-db 有冇起；`POSTGRES_PASSWORD` 係咪同 shared-db 一致 |
| NPM 出 502 | `docker ps` 睇 claude-hangs-app 係咪 up 兼喺 `npm-net`；`logs` 睇 health |
| 諮詢表單 429/503 | Redis down → 503；限流觸發 → 429（睇 `Retry-After`） |
| 首頁 noindex | 有冇喺 build 時設 `NEXT_PUBLIC_SITE_URL`；改網域要重新 build |
