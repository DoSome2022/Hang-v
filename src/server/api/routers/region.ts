import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { cached } from "@/server/cache";
import { deleteByPattern } from "@/server/redis";
import { caseCardOutput, caseCardSelect, toCaseCard } from "../case-card";

// 快取 TTL：公開讀（秒）
const REGION_TTL = 5 * 60;

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

// 公開區域頁 aggregate：region + intros + 區內案例卡 + 痛點/方案 chips
const publicRegionOutput = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  intros: z.array(z.object({ id: z.string(), title: z.string(), content: z.string() })),
  cases: z.array(caseCardOutput),
  painPoints: z.array(z.object({ id: z.string(), title: z.string() })),
  solutions: z.array(z.object({ id: z.string(), title: z.string() })),
});

export const regionRouter = createTRPCRouter({
  list: publicProcedure.output(z.array(regionOutput)).query(async ({ ctx }) => {
    // 公開讀快取（TTL 5 分鐘；admin 用嘅係 public 同一支，改完會即時失效）
    return cached("region:list", REGION_TTL, () =>
      ctx.db.region.findMany({ orderBy: { createdAt: "asc" } }),
    );
  }),
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(regionOutput.nullable())
    .query(async ({ ctx, input }) => {
      return cached(`region:get:${input.slug}`, REGION_TTL, () =>
        ctx.db.region.findUnique({ where: { slug: input.slug } }),
      );
    }),
  // 公開區域頁（/r/[slug]）：一次過攞 intro/案例卡/痛點/方案
  // 快取 key 唔可以同 region:get:* 共用——output 形狀唔同
  getPublicBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(publicRegionOutput.nullable())
    .query(async ({ ctx, input }) => {
      return cached(`region:public:slug:${input.slug}`, REGION_TTL, async () => {
        const row = await ctx.db.region.findUnique({
          where: { slug: input.slug },
          select: {
            id: true,
            name: true,
            slug: true,
            intros: {
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              select: { id: true, title: true, content: true },
            },
            cases: {
              orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
              select: caseCardSelect,
            },
            painPoints: {
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              select: { id: true, title: true },
            },
            solutions: {
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              select: { id: true, title: true },
            },
          },
        });
        if (!row) return null;
        return {
          ...row,
          cases: row.cases.map(toCaseCard),
        };
      });
    }),
  // 後台編輯用：依 id 取（不回 null，找不到由 errorFormatter 轉 404）
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(regionOutput)
    .query(async ({ ctx, input }) => {
      return ctx.db.region.findUniqueOrThrow({ where: { id: input.id } });
    }),
  create: protectedProcedure
    .input(regionCreateInput)
    .output(regionOutput)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db.region.create({ data: input });
      await deleteByPattern("region:*");
      return created;
    }),
  update: protectedProcedure
    .input(regionCreateInput.extend({ id: z.string() }))
    .output(regionOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updated = await ctx.db.region.update({ where: { id }, data });
      await deleteByPattern("region:*");
      return updated;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.region.delete({ where: { id: input.id } });
      // region 刪除會 cascade 到 case——公開 case 快取都要失效
      await deleteByPattern("region:*");
      await deleteByPattern("case:*");
      return { id: input.id };
    }),
});
