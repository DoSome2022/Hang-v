import type { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { cached } from "@/server/cache";
import { deleteByPattern } from "@/server/redis";
import { parseJsonOr, slugPattern, faqSchema, workStepSchema } from "@/server/content-utils";

// 快取 TTL：公開讀（秒）
const CATALOG_TTL = 5 * 60;

const publishStatusEnum = z.enum(["draft", "published"]);

// —— 公開 output ——

const serviceCardOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  english: z.string(),
  tagline: z.string(),
  intro: z.string(),
  status: publishStatusEnum,
  sortOrder: z.number(),
});

const categoryCardOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  english: z.string(),
  icon: z.string(),
  description: z.string(),
  intro: z.string(),
  approach: z.array(z.string()),
  checklist: z.array(z.string()),
  status: publishStatusEnum,
  sortOrder: z.number(),
  services: z.array(serviceCardOutput),
});

const serviceDetailOutput = serviceCardOutput.extend({
  problem: z.string(),
  benefits: z.array(z.string()),
  capabilities: z.array(z.string()),
  workflow: z.array(workStepSchema),
  fit: z.array(z.string()),
  faqs: z.array(faqSchema),
  category: categoryCardOutput,
});

// 公開組件共用型別（type-only import，唔會入 client bundle）
export type CatalogCategory = z.infer<typeof categoryCardOutput>;
export type CatalogService = z.infer<typeof serviceDetailOutput>;

// —— 共用查詢 ——

const serviceCardSelect = {
  id: true,
  slug: true,
  title: true,
  english: true,
  tagline: true,
  intro: true,
  status: true,
  sortOrder: true,
} as const;

const categoryOrderBy: Prisma.ServiceCategoryOrderByWithRelationInput[] = [
  { sortOrder: "asc" },
  { createdAt: "asc" },
];

type CategoryRow = Prisma.ServiceCategoryGetPayload<{
  include: { services: { select: typeof serviceCardSelect } };
}>;

type ServiceRow = Prisma.ServiceGetPayload<{
  include: { category: { include: { services: { select: typeof serviceCardSelect } } } };
}>;

// Prisma row → output 轉換 helper
const toCategoryCard = (row: CategoryRow) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  english: row.english,
  icon: row.icon,
  description: row.description,
  intro: row.intro,
  approach: parseJsonOr(z.array(z.string()), row.approach, []),
  checklist: parseJsonOr(z.array(z.string()), row.checklist, []),
  status: row.status,
  sortOrder: row.sortOrder,
  services: row.services,
});

const toServiceDetail = (row: ServiceRow) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  english: row.english,
  tagline: row.tagline,
  intro: row.intro,
  status: row.status,
  sortOrder: row.sortOrder,
  problem: row.problem,
  benefits: parseJsonOr(z.array(z.string()), row.benefits, []),
  capabilities: parseJsonOr(z.array(z.string()), row.capabilities, []),
  workflow: parseJsonOr(z.array(workStepSchema), row.workflow, []),
  fit: parseJsonOr(z.array(z.string()), row.fit, []),
  faqs: parseJsonOr(z.array(faqSchema), row.faqs, []),
  category: toCategoryCard(row.category),
});

// —— 後台 input ——

const categoryInput = z.object({
  slug: z.string().min(1).regex(slugPattern, "slug 只可用小寫英數與 -"),
  title: z.string().min(1),
  english: z.string().default(""),
  icon: z.string().default("code"),
  description: z.string().default(""),
  intro: z.string().default(""),
  approach: z.array(z.string()).default([]),
  checklist: z.array(z.string()).default([]),
  status: publishStatusEnum.default("published"),
  sortOrder: z.number().int().min(0).optional(),
});

const serviceInput = z.object({
  slug: z.string().min(1).regex(slugPattern, "slug 只可用小寫英數與 -"),
  title: z.string().min(1),
  categoryId: z.string().min(1),
  english: z.string().default(""),
  tagline: z.string().default(""),
  intro: z.string().default(""),
  problem: z.string().default(""),
  benefits: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  workflow: z.array(workStepSchema).default([]),
  fit: z.array(z.string()).default([]),
  faqs: z.array(faqSchema).default([]),
  status: publishStatusEnum.default("published"),
  sortOrder: z.number().int().min(0).optional(),
});

export const catalogRouter = createTRPCRouter({
  // —— 公開 ——

  listCategories: publicProcedure
    .output(z.array(categoryCardOutput))
    .query(async ({ ctx }) => {
      return cached("catalog:list", CATALOG_TTL, async () => {
        // 公開只顯示已發佈；draft 保留喺 DB 日後再用
        const rows = await ctx.db.serviceCategory.findMany({
          where: { status: "published" },
          orderBy: categoryOrderBy,
          include: {
            services: {
              where: { status: "published" },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: serviceCardSelect,
            },
          },
        });
        return rows.map(toCategoryCard);
      });
    }),
  getCategory: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(categoryCardOutput.nullable())
    .query(async ({ ctx, input }) => {
      return cached(`catalog:category:${input.slug}`, CATALOG_TTL, async () => {
        const row = await ctx.db.serviceCategory.findUnique({
          where: { slug: input.slug },
          include: {
            services: {
              where: { status: "published" },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: serviceCardSelect,
            },
          },
        });
        if (!row || row.status !== "published") return null;
        return toCategoryCard(row);
      });
    }),
  getService: publicProcedure
    .input(z.object({ categorySlug: z.string(), serviceSlug: z.string() }))
    .output(serviceDetailOutput.nullable())
    .query(async ({ ctx, input }) => {
      return cached(`catalog:service:${input.categorySlug}:${input.serviceSlug}`, CATALOG_TTL, async () => {
        const row = await ctx.db.service.findFirst({
          where: {
            slug: input.serviceSlug,
            status: "published",
            category: { slug: input.categorySlug, status: "published" },
          },
          include: {
            category: {
              include: {
                services: {
                  where: { status: "published" },
                  orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                  select: serviceCardSelect,
                },
              },
            },
          },
        });
        return row ? toServiceDetail(row) : null;
      });
    }),

  // —— 後台（管理列表連全部欄位俾編輯頁用） ——

  adminList: protectedProcedure
    .output(z.array(categoryCardOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.serviceCategory.findMany({
        orderBy: categoryOrderBy,
        include: { services: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: serviceCardSelect } },
      });
      return rows.map(toCategoryCard);
    }),
  adminGetService: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(serviceDetailOutput.extend({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      // findUniqueOrThrow：P2025 由 errorFormatter 轉 NOT_FOUND
      const row = await ctx.db.service.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          category: {
            include: { services: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: serviceCardSelect } },
          },
        },
      });
      return { ...toServiceDetail(row), categoryId: row.category.id };
    }),
  categoryCreate: protectedProcedure
    .input(categoryInput)
    .output(categoryCardOutput)
    .mutation(async ({ ctx, input }) => {
      const maxSort = await ctx.db.serviceCategory.aggregate({ _max: { sortOrder: true } });
      const row = await ctx.db.serviceCategory.create({
        data: { ...input, sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1 },
        include: { services: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: serviceCardSelect } },
      });
      await deleteByPattern("catalog:*");
      return toCategoryCard(row);
    }),
  categoryUpdate: protectedProcedure
    .input(categoryInput.extend({ id: z.string() }))
    .output(categoryCardOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const row = await ctx.db.serviceCategory.update({
        where: { id },
        data,
        include: { services: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: serviceCardSelect } },
      });
      await deleteByPattern("catalog:*");
      return toCategoryCard(row);
    }),
  categoryDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // cascade 刪除組內所有 services——公開 URL 會 404，admin UI 有確認警告
      await ctx.db.serviceCategory.delete({ where: { id: input.id } });
      await deleteByPattern("catalog:*");
      return { id: input.id };
    }),
  serviceCreate: protectedProcedure
    .input(serviceInput)
    .output(serviceDetailOutput)
    .mutation(async ({ ctx, input }) => {
      const maxSort = await ctx.db.service.aggregate({
        where: { categoryId: input.categoryId },
        _max: { sortOrder: true },
      });
      const row = await ctx.db.service.create({
        data: { ...input, sortOrder: input.sortOrder ?? (maxSort._max.sortOrder ?? -1) + 1 },
        include: {
          category: {
            include: { services: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: serviceCardSelect } },
          },
        },
      });
      await deleteByPattern("catalog:*");
      return toServiceDetail(row);
    }),
  serviceUpdate: protectedProcedure
    .input(serviceInput.extend({ id: z.string() }))
    .output(serviceDetailOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const row = await ctx.db.service.update({
        where: { id },
        data,
        include: {
          category: {
            include: { services: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: serviceCardSelect } },
          },
        },
      });
      await deleteByPattern("catalog:*");
      return toServiceDetail(row);
    }),
  serviceDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.service.delete({ where: { id: input.id } });
      await deleteByPattern("catalog:*");
      return { id: input.id };
    }),
});
