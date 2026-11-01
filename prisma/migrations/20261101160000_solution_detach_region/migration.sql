-- 方案改公共數據：拆走 region 關聯
-- DropForeignKey
ALTER TABLE "solutions" DROP CONSTRAINT "solutions_region_id_fkey";

-- DropIndex
DROP INDEX "solutions_region_id_idx";

-- AlterTable
ALTER TABLE "solutions" DROP COLUMN "region_id";
