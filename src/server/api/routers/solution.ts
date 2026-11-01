import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { deleteByPattern } from "@/server/redis";

const solutionOutput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  painPointIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const solutionCreateInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  painPointIds: z.array(z.string()),
  tagIds: z.array(z.string()).default([]),
});

// 多對多關聯表由 id 陣列決定
const painPointsCreate = (painPointIds: string[]) => ({
  create: painPointIds.map((painPointId) => ({ painPointId })),
});
const painPointsUpdate = (painPointIds: string[]) => ({
  deleteMany: {},
  create: painPointIds.map((painPointId) => ({ painPointId })),
});
const tagsCreate = (tagIds: string[]) => ({
  create: tagIds.map((tagId) => ({ tagId })),
});
const tagsUpdate = (tagIds: string[]) => ({
  deleteMany: {},
  create: tagIds.map((tagId) => ({ tagId })),
});

const relationSelect = {
  painPoints: { select: { painPointId: true } },
  tags: { select: { tagId: true } },
} as const;

type SolutionRow = Prisma.SolutionGetPayload<{ include: typeof relationSelect }>;

const toOutput = (row: SolutionRow) => {
  const { painPoints, tags, ...rest } = row;
  return {
    ...rest,
    painPointIds: painPoints.map((p) => p.painPointId),
    tagIds: tags.map((t) => t.tagId),
  };
};

export const solutionRouter = createTRPCRouter({
  list: protectedProcedure
    .output(z.array(solutionOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.solution.findMany({
        orderBy: { createdAt: "asc" },
        include: relationSelect,
      });
      return rows.map(toOutput);
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(solutionOutput)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.solution.findUniqueOrThrow({
        where: { id: input.id },
        include: relationSelect,
      });
      return toOutput(row);
    }),
  create: protectedProcedure
    .input(solutionCreateInput)
    .output(solutionOutput)
    .mutation(async ({ ctx, input }) => {
      const { painPointIds, tagIds, ...data } = input;
      const row = await ctx.db.solution.create({
        data: {
          ...data,
          painPoints: painPointsCreate(painPointIds),
          tags: tagsCreate(tagIds),
        },
        include: relationSelect,
      });
      // 案例詳情快取內含方案資料 + 相關案例依賴方案關聯 → 一併失效；
      // region 公開頁亦顯示方案 chips
      await deleteByPattern("case:*");
      await deleteByPattern("region:*");
      return toOutput(row);
    }),
  update: protectedProcedure
    .input(solutionCreateInput.extend({ id: z.string() }))
    .output(solutionOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, painPointIds, tagIds, ...data } = input;
      const row = await ctx.db.solution.update({
        where: { id },
        data: {
          ...data,
          painPoints: painPointsUpdate(painPointIds),
          tags: tagsUpdate(tagIds),
        },
        include: relationSelect,
      });
      await deleteByPattern("case:*");
      await deleteByPattern("region:*");
      return toOutput(row);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.solution.delete({ where: { id: input.id } });
      await deleteByPattern("case:*");
      await deleteByPattern("region:*");
      return { id: input.id };
    }),
});
