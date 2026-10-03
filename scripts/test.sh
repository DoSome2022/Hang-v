#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
fi

echo "==> Starting test database"
docker compose up -d db-test

echo "==> Waiting for test database to be ready"
for i in $(seq 1 30); do
  if docker compose exec -T db-test pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

export DATABASE_URL="$(grep '^TEST_DATABASE_URL=' .env | cut -d '=' -f2- | tr -d '"')"

echo "==> Prisma migrate deploy (test DB)"
npx prisma migrate deploy

echo "==> Running vitest"
npx vitest run