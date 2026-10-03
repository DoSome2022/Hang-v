#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> TypeScript typecheck"
npx tsc --noEmit

echo "==> Prisma validate"
npx prisma validate

echo "==> Check passed"