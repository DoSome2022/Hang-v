import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const regionOutput = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const regionCreateInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const regionRouter = createTRPCRouter({
  list: publicProcedure.output(z.array(regionOutput)).query(async ({ ctx }) => {
    return ctx.db.region.findMany({ orderBy: { createdAt: "asc" } });
  }),
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(regionOutput.nullable())
    .query(async ({ ctx, input }) => {
      return ctx.db.region.findUnique({ where: { slug: input.slug } });
    }),
  create: protectedProcedure
    .input(regionCreateInput)
    .output(regionOutput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.region.create({ data: input });
    }),
  update: protectedProcedure
    .input(regionCreateInput.extend({ id: z.string() }))
    .output(regionOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.region.update({ where: { id }, data });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.region.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
