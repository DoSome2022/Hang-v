import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { deleteByPattern } from "@/server/redis";

const painPointOutput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  regionId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const painPointCreateInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  regionId: z.string().min(1),
});

export const painPointRouter = createTRPCRouter({
  list: protectedProcedure
    .output(z.array(painPointOutput))
    .query(async ({ ctx }) => {
      return ctx.db.painPoint.findMany({ orderBy: { createdAt: "asc" } });
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(painPointOutput)
    .query(async ({ ctx, input }) => {
      return ctx.db.painPoint.findUniqueOrThrow({ where: { id: input.id } });
    }),
  create: protectedProcedure
    .input(painPointCreateInput)
    .output(painPointOutput)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db.painPoint.create({ data: input });
      // 案例詳情快取內含痛點資料 + 相關案例依賴痛點關聯 → 一併失效
      await deleteByPattern("case:*");
      return created;
    }),
  update: protectedProcedure
    .input(painPointCreateInput.extend({ id: z.string() }))
    .output(painPointOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updated = await ctx.db.painPoint.update({ where: { id }, data });
      await deleteByPattern("case:*");
      return updated;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.painPoint.delete({ where: { id: input.id } });
      await deleteByPattern("case:*");
      return { id: input.id };
    }),
});
