import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
  create: protectedProcedure
    .input(painPointCreateInput)
    .output(painPointOutput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.painPoint.create({ data: input });
    }),
  update: protectedProcedure
    .input(painPointCreateInput.extend({ id: z.string() }))
    .output(painPointOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.painPoint.update({ where: { id }, data });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.painPoint.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
