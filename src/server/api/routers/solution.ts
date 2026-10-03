import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const solutionOutput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  regionId: z.string(),
  painPointIds: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const solutionCreateInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  regionId: z.string().min(1),
  painPointIds: z.array(z.string()),
});

// 多對多關聯表（solution_pain_points）由 painPointIds 決定
const painPointsCreate = (painPointIds: string[]) => ({
  create: painPointIds.map((painPointId) => ({ painPointId })),
});
const painPointsUpdate = (painPointIds: string[]) => ({
  deleteMany: {},
  create: painPointIds.map((painPointId) => ({ painPointId })),
});

export const solutionRouter = createTRPCRouter({
  list: protectedProcedure
    .output(z.array(solutionOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.solution.findMany({
        orderBy: { createdAt: "asc" },
        include: { painPoints: { select: { painPointId: true } } },
      });
      return rows.map(({ painPoints, ...rest }) => ({
        ...rest,
        painPointIds: painPoints.map((p) => p.painPointId),
      }));
    }),
  create: protectedProcedure
    .input(solutionCreateInput)
    .output(solutionOutput)
    .mutation(async ({ ctx, input }) => {
      const { painPointIds, ...data } = input;
      const row = await ctx.db.solution.create({
        data: { ...data, painPoints: painPointsCreate(painPointIds) },
        include: { painPoints: { select: { painPointId: true } } },
      });
      const { painPoints, ...rest } = row;
      return { ...rest, painPointIds: painPoints.map((p) => p.painPointId) };
    }),
  update: protectedProcedure
    .input(solutionCreateInput.extend({ id: z.string() }))
    .output(solutionOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, painPointIds, ...data } = input;
      const row = await ctx.db.solution.update({
        where: { id },
        data: { ...data, painPoints: painPointsUpdate(painPointIds) },
        include: { painPoints: { select: { painPointId: true } } },
      });
      const { painPoints, ...rest } = row;
      return { ...rest, painPointIds: painPoints.map((p) => p.painPointId) };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.solution.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
