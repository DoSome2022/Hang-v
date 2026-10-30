.PHONY: setup check lint test test-e2e dev db-reset db-seed clean help

help:
	@echo "setup     - install deps, start dev DB, prisma generate + migrate"
	@echo "check     - tsc --noEmit + prisma validate (fast)"
	@echo "lint      - eslint ."
	@echo "test      - start test DB + prisma migrate deploy + vitest"
	@echo "test-e2e  - start test DB + migrate + seed + build + playwright"
	@echo "dev       - start next dev"
	@echo "db-seed   - run prisma db seed (dev DB)"
	@echo "db-reset  - reset dev database (會清資料)"
	@echo "clean     - remove build artifacts"

setup:
	@bash scripts/setup.sh

check:
	@bash scripts/check.sh

lint:
	npm run lint

test:
	@bash scripts/test.sh

test-e2e:
	@bash scripts/test-e2e.sh

dev:
	npm run dev

db-seed:
	npx prisma db seed

db-reset:
	docker compose down -v db
	docker compose up -d db
	@sleep 2
	npx prisma migrate reset --force

clean:
	rm -rf .next node_modules/.cache test-results playwright-report
