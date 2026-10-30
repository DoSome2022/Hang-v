import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { cached } from "@/server/cache";
import { deleteByPattern } from "@/server/redis";
import { parseCaseContent, serializeCaseContent, caseSectionSchema, caseResultSchema } from "@/server/case-content";
import { ensureTagIds } from "@/server/tags";

// 快取 TTL：公開讀（秒）
const CASE_LIST_TTL = 2 * 60;
const CASE_DETAIL_TTL = 5 * 60;

// —— 公開前台 ——

const caseCardOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  excerpt: z.string(),
  summary: z.string(),
  readTime: z.string(),
  publishedAt: z.date().nullable(),
  tags: z.array(z.string()),
});

const relatedCaseOutput = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.string(),
});

const caseDetailOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  english: z.string(),
  summary: z.string(),
  readTime: z.string(),
  publishedAt: z.date().nullable(),
  tags: z.array(z.string()),
  lead: z.string(),
  sections: z.array(caseSectionSchema),
  result: caseResultSchema,
  painPoints: z.array(z.object({ id: z.string(), title: z.string() })),
  solutions: z.array(z.object({ id: z.string(), title: z.string() })),
  relatedCases: z.array(relatedCaseOutput),
  createdAt: z.date(),
});

// /apply 用：只需痛點供勾選
const caseApplyOutput = z.object({
  id: z.string(),
  title: z.string(),
  painPoints: z.array(z.object({ id: z.string(), title: z.string() })),
});

// —— 後台 ——

const dateOnlyInput = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD")
  .optional();

const caseCreateInput = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug 只可用小寫英數與 -"),
  title: z.string().min(1),
  category: z.string().default(""),
  english: z.string().default(""),
  summary: z.string().default(""),
  excerpt: z.string().default(""),
  readTime: z.string().default(""),
  publishedAt: dateOnlyInput,
  lead: z.string().default(""),
  sections: z.array(caseSectionSchema).default([]),
  result: caseResultSchema.default({ label: "", value: "", note: "" }),
  tagNames: z.array(z.string()).default([]),
  regionId: z.string().min(1),
  painPointIds: z.array(z.string()).default([]),
  solutionIds: z.array(z.string()).default([]),
});

const caseAdminOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  english: z.string(),
  summary: z.string(),
  excerpt: z.string(),
  readTime: z.string(),
  publishedAt: z.date().nullable(),
  regionId: z.string(),
  tagNames: z.array(z.string()),
  painPointIds: z.array(z.string()),
  solutionIds: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const relationSelect = {
  painPoints: { select: { painPointId: true } },
  solutions: { select: { solutionId: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

type CaseRow = Prisma.CaseGetPayload<{ include: typeof relationSelect }>;

const toAdminOutput = (row: CaseRow) => {
  const { painPoints, solutions, tags, ...rest } = row;
  return {
    ...rest,
    tagNames: tags.map((t) => t.tag.name),
    painPointIds: painPoints.map((p) => p.painPointId),
    solutionIds: solutions.map((s) => s.solutionId),
  };
};

// 關聯寫入 helper
const toWriteData = async (
  db: PrismaClient,
  input: z.infer<typeof caseCreateInput>,
) => ({
  slug: input.slug,
  title: input.title,
  content: serializeCaseContent({
    lead: input.lead,
    sections: input.sections,
    result: input.result,
  }),
  category: input.category,
  english: input.english,
  summary: input.summary,
  excerpt: input.excerpt,
  readTime: input.readTime,
  publishedAt: input.publishedAt ? new Date(`${input.publishedAt}T00:00:00.000Z`) : null,
  regionId: input.regionId,
  tags: {
    create: (await ensureTagIds(db, input.tagNames)).map((tagId) => ({ tagId })),
  },
  painPoints: {
    create: input.painPointIds.map((painPointId) => ({ painPointId })),
  },
  solutions: {
    create: input.solutionIds.map((solutionId) => ({ solutionId })),
  },
});

const toUpdateData = async (
  db: PrismaClient,
  input: z.infer<typeof caseCreateInput>,
) => ({
  slug: input.slug,
  title: input.title,
  content: serializeCaseContent({
    lead: input.lead,
    sections: input.sections,
    result: input.result,
  }),
  category: input.category,
  english: input.english,
  summary: input.summary,
  excerpt: input.excerpt,
  readTime: input.readTime,
  publishedAt: input.publishedAt ? new Date(`${input.publishedAt}T00:00:00.000Z`) : null,
  regionId: input.regionId,
  tags: {
    deleteMany: {},
    create: (await ensureTagIds(db, input.tagNames)).map((tagId) => ({ tagId })),
  },
  painPoints: {
    deleteMany: {},
    create: input.painPointIds.map((painPointId) => ({ painPointId })),
  },
  solutions: {
    deleteMany: {},
    create: input.solutionIds.map((solutionId) => ({ solutionId })),
  },
});

export const caseRouter = createTRPCRouter({
  // 公開：全部案例 card（/cases 頁；快取 2 分鐘）
  listPublic: publicProcedure
    .output(z.array(caseCardOutput))
    .query(async ({ ctx }) => {
      return cached("case:public:list", CASE_LIST_TTL, async () => {
        const rows = await ctx.db.case.findMany({
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            excerpt: true,
            summary: true,
            readTime: true,
            publishedAt: true,
            tags: { select: { tag: { select: { name: true } } } },
          },
        });
        return rows.map(({ tags, ...rest }) => ({
          ...rest,
          tags: tags.map((t) => t.tag.name),
        }));
      });
    }),
  // 公開：案例詳情（依 slug；快取 5 分鐘）
  getPublicBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(caseDetailOutput.nullable())
    .query(async ({ ctx, input }) => {
      return cached(`case:public:slug:${input.slug}`, CASE_DETAIL_TTL, async () => {
        const row = await ctx.db.case.findUnique({
          where: { slug: input.slug },
          include: {
            painPoints: {
              select: {
                painPointId: true,
                painPoint: { select: { id: true, title: true } },
              },
            },
            solutions: {
              select: {
                solutionId: true,
                solution: { select: { id: true, title: true } },
              },
            },
            tags: { select: { tagId: true, tag: { select: { name: true } } } },
          },
        });
        if (!row) return null;
        const content = parseCaseContent(row.content);
        // 相關案例：共用 tags / 痛點 / 方案（排除自己，最多 3）
        const related = await ctx.db.case.findMany({
          where: {
            id: { not: row.id },
            OR: [
              { tags: { some: { tagId: { in: row.tags.map((t) => t.tagId) } } } },
              {
                painPoints: {
                  some: {
                    painPointId: {
                      in: row.painPoints.map((p) => p.painPointId),
                    },
                  },
                },
              },
              {
                solutions: {
                  some: {
                    solutionId: { in: row.solutions.map((s) => s.solutionId) },
                  },
                },
              },
            ],
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          select: { slug: true, title: true, category: true },
          take: 3,
        });
        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          category: row.category,
          english: row.english,
          summary: row.summary,
          readTime: row.readTime,
          publishedAt: row.publishedAt,
          tags: row.tags.map((t) => t.tag.name),
          lead: content.lead,
          sections: content.sections,
          result: content.result,
          painPoints: row.painPoints.map((p) => ({
            id: p.painPoint.id,
            title: p.painPoint.title,
          })),
          solutions: row.solutions.map((s) => ({
            id: s.solution.id,
            title: s.solution.title,
          })),
          relatedCases: related,
          createdAt: row.createdAt,
        };
      });
    }),
  // 公開：/apply 用（依 id 取案例 + 痛點）
  getPublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(caseApplyOutput.nullable())
    .query(async ({ ctx, input }) => {
      return cached(`case:public:id:${input.id}`, CASE_DETAIL_TTL, async () => {
        const row = await ctx.db.case.findUnique({
          where: { id: input.id },
          include: {
            painPoints: {
              select: { painPoint: { select: { id: true, title: true } } },
            },
          },
        });
        if (!row) return null;
        return {
          id: row.id,
          title: row.title,
          painPoints: row.painPoints.map((p) => ({
            id: p.painPoint.id,
            title: p.painPoint.title,
          })),
        };
      });
    }),
  // 後台：全部案例
  list: protectedProcedure
    .output(z.array(caseAdminOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.case.findMany({
        orderBy: { createdAt: "asc" },
        include: relationSelect,
      });
      return rows.map(toAdminOutput);
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(caseAdminOutput)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.case.findUniqueOrThrow({
        where: { id: input.id },
        include: relationSelect,
      });
      return toAdminOutput(row);
    }),
  create: protectedProcedure
    .input(caseCreateInput)
    .output(caseAdminOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.case.create({
        data: await toWriteData(ctx.db, input),
        include: relationSelect,
      });
      await deleteByPattern("case:*");
      return toAdminOutput(row);
    }),
  update: protectedProcedure
    .input(caseCreateInput.extend({ id: z.string() }))
    .output(caseAdminOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const row = await ctx.db.case.update({
        where: { id },
        data: await toUpdateData(ctx.db, data),
        include: relationSelect,
      });
      await deleteByPattern("case:*");
      return toAdminOutput(row);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.case.delete({ where: { id: input.id } });
      await deleteByPattern("case:*");
      return { id: input.id };
    }),
});
