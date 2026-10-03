import type { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const caseOutput = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  regionId: z.string(),
  painPointIds: z.array(z.string()),
  solutionIds: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const caseCreateInput = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  regionId: z.string().min(1),
  painPointIds: z.array(z.string()),
  solutionIds: z.array(z.string()),
});

// 多對多關聯表（case_pain_points / case_solutions）由 id 陣列決定
const caseRelationsCreate = (painPointIds: string[], solutionIds: string[]) => ({
  painPoints: {
    create: painPointIds.map((painPointId) => ({ painPointId })),
  },
  solutions: {
    create: solutionIds.map((solutionId) => ({ solutionId })),
  },
});
const caseRelationsUpdate = (painPointIds: string[], solutionIds: string[]) => ({
  painPoints: {
    deleteMany: {},
    create: painPointIds.map((painPointId) => ({ painPointId })),
  },
  solutions: {
    deleteMany: {},
    create: solutionIds.map((solutionId) => ({ solutionId })),
  },
});

const relationSelect = {
  painPoints: { select: { painPointId: true } },
  solutions: { select: { solutionId: true } },
} as const;

type CaseRow = Prisma.CaseGetPayload<{ include: typeof relationSelect }>;

const toOutput = (row: CaseRow) => {
  const { painPoints, solutions, ...rest } = row;
  return {
    ...rest,
    painPointIds: painPoints.map((p) => p.painPointId),
    solutionIds: solutions.map((s) => s.solutionId),
  };
};

// ---- 公開前台（只讀公開資料） ----

const caseCardOutput = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.date(),
});

const caseDetailOutput = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  painPoints: z.array(z.object({ id: z.string(), title: z.string() })),
  solutions: z.array(z.object({ id: z.string(), title: z.string() })),
  relatedCases: z.array(z.object({ id: z.string(), title: z.string() })),
  createdAt: z.date(),
});

export const caseRouter = createTRPCRouter({
  // 公開：依區域列出案例 card
  listPublic: publicProcedure
    .input(z.object({ regionSlug: z.string() }))
    .output(z.array(caseCardOutput))
    .query(async ({ ctx, input }) => {
      const region = await ctx.db.region.findUnique({
        where: { slug: input.regionSlug },
        select: { id: true },
      });
      if (!region) return [];
      return ctx.db.case.findMany({
        where: { regionId: region.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      });
    }),
  // 公開：案例 Post 頁（內容 + 痛點 + 所用方案）
  getPublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(caseDetailOutput.nullable())
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.case.findUnique({
        where: { id: input.id },
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
        },
      });
      if (!row) return null;
      // 相關案例：共用任一痛點 或 共用任一方案（排除自己）
      const related = await ctx.db.case.findMany({
        where: {
          id: { not: row.id },
          OR: [
            {
              painPoints: {
                some: {
                  painPointId: { in: row.painPoints.map((p) => p.painPointId) },
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
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true },
        take: 10,
      });
      return {
        id: row.id,
        title: row.title,
        content: row.content,
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
    }),
  list: protectedProcedure
    .output(z.array(caseOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.case.findMany({
        orderBy: { createdAt: "asc" },
        include: relationSelect,
      });
      return rows.map(toOutput);
    }),
  create: protectedProcedure
    .input(caseCreateInput)
    .output(caseOutput)
    .mutation(async ({ ctx, input }) => {
      const { painPointIds, solutionIds, ...data } = input;
      const row = await ctx.db.case.create({
        data: { ...data, ...caseRelationsCreate(painPointIds, solutionIds) },
        include: relationSelect,
      });
      return toOutput(row);
    }),
  update: protectedProcedure
    .input(caseCreateInput.extend({ id: z.string() }))
    .output(caseOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, painPointIds, solutionIds, ...data } = input;
      const row = await ctx.db.case.update({
        where: { id },
        data: { ...data, ...caseRelationsUpdate(painPointIds, solutionIds) },
        include: relationSelect,
      });
      return toOutput(row);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.case.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
