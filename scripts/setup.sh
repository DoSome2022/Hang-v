#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
fi

echo "==> Installing dependencies"
npm install

echo "==> Starting dev database"
docker compose up -d db

echo "==> Waiting for database to be ready"
for i in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Prisma generate"
npx prisma generate

echo "==> Prisma migrate (dev)"
npx prisma migrate dev --name init --skip-seed || npx prisma migrate deploy

echo "==> Setup complete"