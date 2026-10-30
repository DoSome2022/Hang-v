import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { deleteByPattern } from "@/server/redis";

const tagOutput = z.object({
  id: z.string(),
  name: z.string(),
  groupId: z.string(),
  sortOrder: z.number(),
});

const groupOutput = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  sortOrder: z.number(),
  tags: z.array(tagOutput),
});

export const tagRouter = createTRPCRouter({
  // 後台標籤管理：三組標籤連同組內 tags
  groupList: protectedProcedure
    .output(z.array(groupOutput))
    .query(async ({ ctx }) => {
      const groups = await ctx.db.tagGroup.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          tags: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      });
      return groups.map((g) => ({
        id: g.id,
        key: g.key,
        label: g.label,
        sortOrder: g.sortOrder,
        tags: g.tags.map((t) => ({
          id: t.id,
          name: t.name,
          groupId: t.groupId,
          sortOrder: t.sortOrder,
        })),
      }));
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(60),
        groupId: z.string().min(1),
        sortOrder: z.number().int().default(0),
      }),
    )
    .output(tagOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.tag.create({
        data: { name: input.name, groupId: input.groupId, sortOrder: input.sortOrder },
      });
      await deleteByPattern("case:*");
      return {
        id: row.id,
        name: row.name,
        groupId: row.groupId,
        sortOrder: row.sortOrder,
      };
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(60).optional(),
        groupId: z.string().min(1).optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .output(tagOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const row = await ctx.db.tag.update({ where: { id }, data });
      await deleteByPattern("case:*");
      return {
        id: row.id,
        name: row.name,
        groupId: row.groupId,
        sortOrder: row.sortOrder,
      };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tag.delete({ where: { id: input.id } });
      await deleteByPattern("case:*");
      return { id: input.id };
    }),
});
