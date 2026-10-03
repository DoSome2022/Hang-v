.PHONY: setup check test dev db-reset clean help

help:
	@echo "setup     - install deps, start dev DB, prisma generate + migrate"
	@echo "check     - tsc --noEmit + prisma validate (fast)"
	@echo "test      - start test DB + prisma migrate deploy"
	@echo "dev       - start next dev"
	@echo "db-reset  - reset dev database"
	@echo "clean     - remove build artifacts"

setup:
	@bash scripts/setup.sh

check:
	@bash scripts/check.sh

test:
	@bash scripts/test.sh

dev:
	npm run dev

db-reset:
	docker compose down -v db
	docker compose up -d db
	@sleep 2
	npx prisma migrate reset --force

clean:
	rm -rf .next node_modules/.cache