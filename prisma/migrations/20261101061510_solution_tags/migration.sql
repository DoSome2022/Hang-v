-- CreateTable
CREATE TABLE "solution_tags" (
    "solution_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solution_tags_pkey" PRIMARY KEY ("solution_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "solution_tags" ADD CONSTRAINT "solution_tags_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_tags" ADD CONSTRAINT "solution_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
