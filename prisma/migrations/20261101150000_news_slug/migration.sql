-- AlterTable
ALTER TABLE "news" ADD COLUMN "slug" TEXT,
ADD COLUMN "content" TEXT NOT NULL DEFAULT '';

-- Backfill：現有行用 id 做 slug（唯一）
UPDATE "news" SET "slug" = 'news-' || "id" WHERE "slug" IS NULL;

ALTER TABLE "news" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");
