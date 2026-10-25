# 部署指南（騰訊雲輕量伺服器・香港・NPM 已裝・方案 B 共用 PG）

架構：`NPM (80/443) → npm-net → claude-hangs-app (Next 16 standalone :3000) → shared-db (claude_hangs_db) + redis`

```
公網 ──► NPM ──► app（Next.js 自己 serve 前後端 + tRPC + NextAuth）
                   │
                   ├──► shared-db（共用 PG，database: claude_hangs_db）
                   └──► redis（公開頁快取 + 登入限流）

（migrate 係一次性服務：每次 compose up 先跑 prisma migrate deploy，成功後 app 先起）
```

## Redis 功能（三個設計觸發點已就位）

| 功能 | 位置 | 行為 |
|---|---|---|
| 公開頁快取 | `src/server/cache.ts` + region/case routers | `region:*` TTL 5 分鐘、`case:*` 列表 2 分鐘/詳情 5 分鐘；admin 任何 create/update/delete 即時失效（含痛點/方案改動連帶失效 `case:*`） |
| 登入限流 | `src/server/auth.ts` | 同 IP 連續失敗 5 次 → 鎖 15 分鐘；成功登入自動 reset；Redis 唔可用時 **fail-open**（唔會鎖死 admin） |
| 行為追蹤 buffer | 未實作（模式已預備） | 將來做 WebUserLog 高頻寫入時，用 Redis 做 buffer 再 flush 落 PG |

**Redis 唔可用時**（冇設 `REDIS_URL` 或連唔到）：快取自動直落 DB、限流自動放行——app 唔會 crash。

## 部署前檢查

- [ ] DNS A record 已指向伺服器 IP
- [ ] `.env` 上伺服器（AUTH_SECRET / AUTH_ADMIN_USERNAME / AUTH_ADMIN_PASSWORD——**admin 密碼上線前一定要改**）
- [ ] `.env` 加 `POSTGRES_PASSWORD`（同 shared-db 密碼一致）
- [ ] shared-db 已起（`docker compose up -d`，會自動建 `claude_hangs_db`）

## 一次性設定（每部伺服器做一次）

```bash
docker network create npm-net
docker network connect npm-net <你個NPM容器名>
```

> 輕量機得 2GB RAM 嘅話，跑 PG + Next 前建議加 swap（指令見 `done/DEPLOY-CHECKLIST.md`）。

## 首次部署

```bash
cd claude_hangs
docker compose -f docker-compose.prod.yml up -d --build
docker ps
```

## NPM 面板設定

1. **Proxy Hosts → Add Proxy Host**：
   - Domain：`你的域名`
   - Forward Hostname/IP：`claude-hangs-app`　Port：`3000`
   - 開 **Block Common Exploits**、**Websockets Support**
2. **SSL**：Request a New Certificate → Force SSL

## 之後每次更新

```bash
cd claude_hangs
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

## 注意事項

- **本地開發照舊**：`make setup` / `make dev` / `make test`（dev compose `docker-compose.yml` 冇改過）
- **本地想用 Redis**：`docker run -d --name redis -p 6379:6379 redis:alpine`，再喺 `.env` 加 `REDIS_URL="redis://localhost:6379/0"`（唔加都 work，只係冇快取同限流）
- **模型改動**：`prisma migrate dev` 生成 migration → commit → 部署時 `migrate deploy` 自動套用
- **admin 登入**：`/login`，帳密喺 `.env`（NextAuth JWT session，無狀態）

## 資料備份（跟 shared-db 統一）

```bash
docker exec shared-db pg_dump -U popo claude_hangs_db > backup_claude_hangs_$(date +%F).sql
```

## 疑難排解

| 問題 | 處理 |
|---|---|
| migrate 失敗 | `docker compose -f docker-compose.prod.yml logs migrate`；schema 改咗要先生成 migration |
| 登入 redirect loop | `AUTH_SECRET` 有冇填 + `AUTH_TRUST_HOST`（compose 已設 true） |
| 連唔到 DB | shared-db 有冇起；`POSTGRES_PASSWORD` 係咪同 shared-db 一致 |
| NPM 出 502 | `docker ps` 睇 claude-hangs-app 係咪 up 兼喺 `npm-net` |
