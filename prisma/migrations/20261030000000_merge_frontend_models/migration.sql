-- CreateEnum
CREATE TYPE "news_status" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "account_kind" AS ENUM ('quotation', 'invoice', 'receipt');

-- AlterEnum：application_status 2 值 → 5 值
-- 既有 processed 資料轉為 completed（pending 保持 pending）
BEGIN;
CREATE TYPE "application_status_new" AS ENUM ('pending', 'quoted', 'developing', 'completed', 'cancelled');
ALTER TABLE "public"."applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "status" TYPE "application_status_new" USING (
  CASE "status"::text
    WHEN 'pending' THEN 'pending'
    WHEN 'processed' THEN 'completed'
    ELSE 'pending'
  END
)::"application_status_new";
ALTER TYPE "application_status" RENAME TO "application_status_old";
ALTER TYPE "application_status_new" RENAME TO "application_status";
DROP TYPE "public"."application_status_old";
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable：cases 新欄位（slug 先 nullable，回填後收緊）
ALTER TABLE "cases" ADD COLUMN     "category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "english" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "excerpt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "read_time" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "summary" TEXT NOT NULL DEFAULT '';

-- 回填 slug（用 id 保證唯一）
UPDATE "cases" SET "slug" = 'case-' || "id" WHERE "slug" IS NULL;

ALTER TABLE "cases" ALTER COLUMN "slug" SET NOT NULL;

-- CreateTable
CREATE TABLE "tag_groups" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tag_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_tags" (
    "case_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_tags_pkey" PRIMARY KEY ("case_id","tag_id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "status" "news_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_tags" (
    "news_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_tags_pkey" PRIMARY KEY ("news_id","tag_id")
);

-- CreateTable
CREATE TABLE "dev_projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '',
    "delivery" TIMESTAMP(3),
    "warranty" TIMESTAMP(3),
    "link" TEXT,
    "meetings" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dev_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev_parts" (
    "id" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL DEFAULT '',
    "deadline" TIMESTAMP(3),
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dev_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev_comments" (
    "id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "when_label" TEXT NOT NULL DEFAULT '',
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dev_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "kind" "account_kind" NOT NULL,
    "company" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_groups_key_key" ON "tag_groups"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_group_id_idx" ON "tags"("group_id");

-- CreateIndex
CREATE INDEX "news_status_idx" ON "news"("status");

-- CreateIndex
CREATE INDEX "news_published_at_idx" ON "news"("published_at");

-- CreateIndex
CREATE INDEX "dev_parts_project_id_idx" ON "dev_parts"("project_id");

-- CreateIndex
CREATE INDEX "dev_comments_part_id_idx" ON "dev_comments"("part_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_number_key" ON "accounts"("number");

-- CreateIndex
CREATE INDEX "accounts_kind_idx" ON "accounts"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "cases_slug_key" ON "cases"("slug");

-- CreateIndex
CREATE INDEX "cases_published_at_idx" ON "cases"("published_at");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tag_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tags" ADD CONSTRAINT "case_tags_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tags" ADD CONSTRAINT "case_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev_parts" ADD CONSTRAINT "dev_parts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "dev_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev_comments" ADD CONSTRAINT "dev_comments_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "dev_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
