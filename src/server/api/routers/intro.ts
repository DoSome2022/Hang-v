import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { deleteByPattern } from "@/server/redis";

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
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(introOutput)
    .query(async ({ ctx, input }) => {
      return ctx.db.intro.findUniqueOrThrow({ where: { id: input.id } });
    }),
  create: protectedProcedure
    .input(introCreateInput)
    .output(introOutput)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db.intro.create({ data: input });
      // region 公開頁 aggregate 含 intro
      await deleteByPattern("region:*");
      return created;
    }),
  update: protectedProcedure
    .input(introCreateInput.extend({ id: z.string() }))
    .output(introOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updated = await ctx.db.intro.update({ where: { id }, data });
      // update 可改 regionId——所有 region 頁失效最安全
      await deleteByPattern("region:*");
      return updated;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.intro.delete({ where: { id: input.id } });
      await deleteByPattern("region:*");
      return { id: input.id };
    }),
});
