# 部署指南（阿里雲 + 寶塔 BT Panel）

架構（自足式 compose：db + redis + app 全部喺容器內）：

```
公網 (80/443)
   └─► 寶塔 Nginx（網站 → 反向代理，SSL）
         └─► 127.0.0.1:3000 ──► hangs-app（Next.js 16 standalone）
                                  ├─► hangs-db（PostgreSQL 16，volume 持久化）
                                  └─► hangs-redis（AOF 持久化）
```

## 一、伺服器準備（寶塔）

1. 裝好寶塔面板（阿里雲安全組：放行 80/443/22 + 寶塔面板埠；**唔好放行 3000**）
2. 寶塔「軟體商店」安裝 **Docker 管理器**（docker + compose 會一併裝好）
3. 輕量機（2GB RAM）建議加 swap：
   ```bash
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```
4. 確認架構：`uname -m`（`x86_64` 或 `aarch64`，見下方「架構注意」）

## 二、上傳專案

```bash
mkdir -p /www/wwwroot/hangs
cd /www/wwwroot/hangs
# 上傳專案檔（git clone 或 SFTP；git clone 後 git checkout merge-hangs-v2）
```

## 三、建立 .env

```bash
cd /www/wwwroot/hangs
cp .env.example .env
vim .env
```

必填（其他有預設）：

```dotenv
# 資料庫密碼（自訂強密碼；db 容器第一次起時生效，之後改要連 volume 一齊清）
POSTGRES_PASSWORD="改成強密碼"
# NextAuth（openssl rand -base64 32）
AUTH_SECRET="openssl rand -base64 32 的輸出"
AUTH_ADMIN_USERNAME="你的管理帳號"
AUTH_ADMIN_PASSWORD="你的管理密碼"
# 正式網域（build 時注入；唔設會全站 noindex）
NEXT_PUBLIC_SITE_URL="https://你的正式網域"
```

## 四、部署

```bash
cd /www/wwwroot/hangs
# 1. build 鏡像 + 起 db/redis/migrate/app（migrate 自動套用 migrations）
docker compose -f docker-compose.prod.yml up -d --build

# 2. 等 app healthy（約 30-60 秒，含 build 時間）
docker compose -f docker-compose.prod.yml ps        # hangs-app 應 (healthy)

# 3. 首次內容種子（3 篇案例、標籤、news 等；全 upsert 可重複跑）
docker compose -f docker-compose.prod.yml --profile seed run --rm --build seed
```

> ⚠️ `run --rm seed` 一定要加 `--build`（第一次冇改過 code 可以省），否則會用舊鏡像。

## 五、寶塔面板設定（反向代理 + SSL）

1. **網站 → 添加站點**：填網域，根目錄隨意（建個空資料夾）
2. **站點 → 設置 → 反向代理**：
   - 目標 URL：`http://127.0.0.1:3000`
   - 發送域名：`$host`
3. **站點 → 設置 → 配置文件**，喺 `location /` 的 proxy 區塊加（覆寫而非附加 XFF，登入限流同諮詢限流先可信）：
   ```nginx
   proxy_set_header X-Forwarded-For $remote_addr;
   ```
4. **SSL**：站點 → SSL → Let's Encrypt（或你的證書）→ 開強制 HTTPS
5. **防火牆**：阿里雲安全組 + 寶塔防火牆只開 80/443/22

## 六、驗證清單

```bash
# 本機（伺服器上）
curl http://127.0.0.1:3000/api/health            # {"status":"ok","db":"up","redis":"up"}
curl -s http://127.0.0.1:3000/cases | grep 補習社  # seed 後即時見到案例
curl -sI http://127.0.0.1:3000/admin | grep -i location   # → /admin/login

# 對外（你部機）
https://你的網域/api/health                      # ok + db/redis up
https://你的網域/cases                            # 3 張案例卡
https://你的網域/admin/login                      # 可登入（.env 帳密）
# 首頁 meta robots 應係 index,follow（NEXT_PUBLIC_SITE_URL 有設定）
# sitemap.xml 應含 /cases/tutoring-centre-management
```

## 七、之後每次更新

```bash
cd /www/wwwroot/hangs
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
# 有新 seed 內容先跑：docker compose -f docker-compose.prod.yml --profile seed run --rm --build seed
```

## 八、架構注意（重要）

- **本機 build 的鏡像唔可以搬去伺服器**：Mac（M 系）build 出嚟係 `arm64`，多數阿里雲 ECS 係 `x86_64`。一律**喺伺服器 build**（`docker compose up -d --build`，會自動按伺服器架構 build）。若伺服器係 ARM（g8y 等），一樣照跑。
- 本機 docker build 只係驗證 Dockerfile 正確，唔係產物。

## 九、備份

```bash
# DB（每日 cron）
docker compose -f docker-compose.prod.yml exec db pg_dump -U popo claude_hangs_db | gzip > /www/backup/hangs-db-$(date +%F).sql.gz
# Redis（AOF 已開，volume 一併備份更穩陣）
docker compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE
# 寶塔亦可在「資料庫/檔案」做定期備份
```

## 十、疑難排解

| 問題 | 處理 |
|---|---|
| build 時 OOM / 卡住 | 加 swap；或分兩步：`docker compose build` 單獨跑，再 `up -d` |
| migrate 失敗 | `docker compose -f docker-compose.prod.yml logs migrate`；schema 改咗要 commit migrations |
| 登入 redirect loop | `AUTH_SECRET` 有冇填（非空、唔好用 .env.example 原值） |
| 案例頁 404 / 內容唔見 | 有冇跑 seed？跑咗之後如仍 404，檢查 `NEXT_PUBLIC_SITE_URL` 係咪同實際網域一致並重新 build |
| 諮詢表單 503 | Redis 容器唔 healthy：`docker compose -f docker-compose.prod.yml logs redis` |
| 網站 noindex | `NEXT_PUBLIC_SITE_URL` 有冇設 + 重新 build（改網域都要重 build） |
| 寶塔反代 502 | `docker compose -f docker-compose.prod.yml ps` 睇 hangs-app 係咪 healthy；反代目標應係 `http://127.0.0.1:3000` |
| 端口衝突 | 3000 被佔：.env 加 `APP_PORT=3100`（寶塔反代目標改返 3100） |
| db 密碼改咗連唔上 | 第一次起後密碼已寫入 volume；要改就 `docker compose down -v`（會清資料！）再起 |
