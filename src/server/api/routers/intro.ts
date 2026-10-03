import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const introOutput = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  regionId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const introCreateInput = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  regionId: z.string().min(1),
});

export const introRouter = createTRPCRouter({
  list: protectedProcedure
    .output(z.array(introOutput))
    .query(async ({ ctx }) => {
      return ctx.db.intro.findMany({ orderBy: { createdAt: "asc" } });
    }),
  create: protectedProcedure
    .input(introCreateInput)
    .output(introOutput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.intro.create({ data: input });
    }),
  update: protectedProcedure
    .input(introCreateInput.extend({ id: z.string() }))
    .output(introOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.intro.update({ where: { id }, data });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.intro.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
