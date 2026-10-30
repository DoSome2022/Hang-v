#!/usr/bin/env bash
# E2E 前置：起 test DB → migrate deploy → seed → build → playwright
# Playwright 的 webServer 會喺 3107 起 standalone server（見 playwright.config.ts）
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "需要 .env（cp .env.example .env）" >&2
  exit 1
fi

# 讀取 test DB 連線（scripts/test.sh 同款做法）
TEST_DB_URL=$(grep '^TEST_DATABASE_URL=' .env | cut -d '=' -f2- | tr -d '"')
AUTH_SECRET=$(grep '^AUTH_SECRET=' .env | cut -d '=' -f2- | tr -d '"')
AUTH_USERNAME=$(grep '^AUTH_ADMIN_USERNAME=' .env | cut -d '=' -f2- | tr -d '"')
AUTH_PASSWORD=$(grep '^AUTH_ADMIN_PASSWORD=' .env | cut -d '=' -f2- | tr -d '"')
REDIS_URL=$(grep '^REDIS_URL=' .env | cut -d '=' -f2- | tr -d '"' || true)

echo "==> 起 test DB"
docker compose up -d db-test

export DATABASE_URL="$TEST_DB_URL"
export AUTH_SECRET="$AUTH_SECRET"
export AUTH_ADMIN_USERNAME="$AUTH_USERNAME"
export AUTH_ADMIN_PASSWORD="$AUTH_PASSWORD"
# e2e 用 Redis /1 隔離快取與佇列（避免同 dev DB 共用 /0 互相污染）
export REDIS_URL="$(echo "$REDIS_URL" | sed 's|/[0-9]*$|/1|')"
export NEXT_PUBLIC_SITE_URL="http://127.0.0.1:3107"

echo "==> migrate deploy + seed"
npx prisma migrate deploy
npx prisma db seed

echo "==> build（build 唔打 DB）"
npm run build

echo "==> playwright"
npx playwright test "$@"
