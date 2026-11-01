-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "english" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'code',
    "description" TEXT NOT NULL DEFAULT '',
    "intro" TEXT NOT NULL DEFAULT '',
    "approach" JSONB NOT NULL DEFAULT '[]',
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "english" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "intro" TEXT NOT NULL DEFAULT '',
    "problem" TEXT NOT NULL DEFAULT '',
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "capabilities" JSONB NOT NULL DEFAULT '[]',
    "workflow" JSONB NOT NULL DEFAULT '[]',
    "fit" JSONB NOT NULL DEFAULT '[]',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "services"("category_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
