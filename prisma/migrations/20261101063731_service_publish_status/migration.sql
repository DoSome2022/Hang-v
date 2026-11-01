-- CreateEnum
CREATE TYPE "publish_status" AS ENUM ('draft', 'published');

-- AlterTable
ALTER TABLE "service_categories" ADD COLUMN     "status" "publish_status" NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "status" "publish_status" NOT NULL DEFAULT 'published';

-- CreateIndex
CREATE INDEX "service_categories_status_idx" ON "service_categories"("status");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "services"("status");
