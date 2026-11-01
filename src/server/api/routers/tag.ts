import { randomUUID } from "node:crypto";
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
      // region 公開頁 aggregate 含案例卡 tags
      await deleteByPattern("region:*");
      // news 公開頁 card 含 tags
      await deleteByPattern("news:*");
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
      // region 公開頁 aggregate 含案例卡 tags
      await deleteByPattern("region:*");
      // news 公開頁 card 含 tags
      await deleteByPattern("news:*");
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
      // region 公開頁 aggregate 含案例卡 tags
      await deleteByPattern("region:*");
      // news 公開頁 card 含 tags
      await deleteByPattern("news:*");
      return { id: input.id };
    }),

  // 標籤類型（TagGroup）：後台可直接建立/改名/刪除，唔使經 seed
  // key 係機器識別碼（seed 組用固定 key），新組自動生成；sortOrder 排最尾
  groupCreate: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1).max(30),
      }),
    )
    .output(groupOutput)
    .mutation(async ({ ctx, input }) => {
      const maxSort = await ctx.db.tagGroup.aggregate({ _max: { sortOrder: true } });
      const row = await ctx.db.tagGroup.create({
        data: {
          key: `g-${randomUUID()}`,
          label: input.label,
          sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        },
      });
      // 組別會影響公開案例頁顯示，一併失效快取
      await deleteByPattern("case:*");
      // region 公開頁 aggregate 含案例卡 tags
      await deleteByPattern("region:*");
      // news 公開頁 card 含 tags
      await deleteByPattern("news:*");
      return { id: row.id, key: row.key, label: row.label, sortOrder: row.sortOrder, tags: [] };
    }),
  groupUpdate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        label: z.string().min(1).max(30).optional(),
        sortOrder: z.number().int().min(0).optional(),
      }),
    )
    .output(groupOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const row = await ctx.db.tagGroup.update({
        where: { id },
        data,
        include: {
          tags: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      });
      await deleteByPattern("case:*");
      // region 公開頁 aggregate 含案例卡 tags
      await deleteByPattern("region:*");
      // news 公開頁 card 含 tags
      await deleteByPattern("news:*");
      return {
        id: row.id,
        key: row.key,
        label: row.label,
        sortOrder: row.sortOrder,
        tags: row.tags.map((t) => ({
          id: t.id,
          name: t.name,
          groupId: t.groupId,
          sortOrder: t.sortOrder,
        })),
      };
    }),
  // cascade 刪除組內所有 tags 及其 CaseTag/NewsTag 關聯（admin UI 有確認警告）
  groupDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tagGroup.delete({ where: { id: input.id } });
      await deleteByPattern("case:*");
      // region 公開頁 aggregate 含案例卡 tags
      await deleteByPattern("region:*");
      // news 公開頁 card 含 tags
      await deleteByPattern("news:*");
      return { id: input.id };
    }),
});
