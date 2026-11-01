import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { cached } from "@/server/cache";
import { deleteByPattern } from "@/server/redis";
import { slugPattern } from "@/server/content-utils";
import { ensureTagIds } from "@/server/tags";

// 快取 TTL：公開讀（秒）
const NEWS_TTL = 5 * 60;

const newsStatusEnum = z.enum(["draft", "published"]);

const newsInput = z.object({
  slug: z.string().min(1).regex(slugPattern, "slug 只可用小寫英數與 -"),
  title: z.string().min(1),
  summary: z.string().max(2000).default(""),
  content: z.string().default(""),
  category: z.string().max(120).default(""),
  status: newsStatusEnum.default("draft"),
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式須為 YYYY-MM-DD")
    .optional(),
  tagNames: z.array(z.string()).default([]),
});

const newsOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  category: z.string(),
  status: newsStatusEnum,
  publishedAt: z.date().nullable(),
  tagNames: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 公開頁 card：/news 列表用
const newsCardOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  category: z.string(),
  publishedAt: z.date().nullable(),
  tags: z.array(z.string()),
});

const newsSelect = {
  tags: { select: { tag: { select: { name: true } } } },
} as const;

type NewsRow = Prisma.NewsGetPayload<{ include: typeof newsSelect }>;

const toOutput = (row: NewsRow) => {
  const { tags, ...rest } = row;
  return { ...rest, tagNames: tags.map((t) => t.tag.name) };
};

const toCard = (row: NewsRow) => {
  const { tags, ...rest } = row;
  return {
    id: rest.id,
    slug: rest.slug,
    title: rest.title,
    summary: rest.summary,
    category: rest.category,
    publishedAt: rest.publishedAt,
    tags: tags.map((t) => t.tag.name),
  };
};

const toData = async (
  db: PrismaClient,
  input: z.infer<typeof newsInput>,
) => ({
  slug: input.slug,
  title: input.title,
  summary: input.summary,
  content: input.content,
  category: input.category,
  status: input.status,
  publishedAt: input.publishedAt ? new Date(`${input.publishedAt}T00:00:00.000Z`) : null,
  tags: {
    create: (await ensureTagIds(db, input.tagNames)).map((tagId) => ({ tagId })),
  },
});

const toUpdateData = async (
  db: PrismaClient,
  input: z.infer<typeof newsInput>,
) => ({
  slug: input.slug,
  title: input.title,
  summary: input.summary,
  content: input.content,
  category: input.category,
  status: input.status,
  publishedAt: input.publishedAt ? new Date(`${input.publishedAt}T00:00:00.000Z`) : null,
  tags: {
    deleteMany: {},
    create: (await ensureTagIds(db, input.tagNames)).map((tagId) => ({ tagId })),
  },
});

export const newsRouter = createTRPCRouter({
  // —— 公開（/news 列表 + 詳情；只顯示 published） ——

  listPublic: publicProcedure
    .output(z.array(newsCardOutput))
    .query(async ({ ctx }) => {
      return cached("news:public:list", NEWS_TTL, async () => {
        const rows = await ctx.db.news.findMany({
          where: { status: "published" },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          include: newsSelect,
        });
        return rows.map(toCard);
      });
    }),
  getPublicBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(newsCardOutput.extend({ content: z.string() }).nullable())
    .query(async ({ ctx, input }) => {
      return cached(`news:public:slug:${input.slug}`, NEWS_TTL, async () => {
        const row = await ctx.db.news.findUnique({
          where: { slug: input.slug },
          include: newsSelect,
        });
        if (!row || row.status !== "published") return null;
        return { ...toCard(row), content: row.content };
      });
    }),

  // —— 後台 ——

  list: protectedProcedure
    .output(z.array(newsOutput))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.news.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: newsSelect,
      });
      return rows.map(toOutput);
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(newsOutput)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.news.findUniqueOrThrow({
        where: { id: input.id },
        include: newsSelect,
      });
      return toOutput(row);
    }),
  create: protectedProcedure
    .input(newsInput)
    .output(newsOutput)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.news.create({
        data: await toData(ctx.db, input),
        include: newsSelect,
      });
      await deleteByPattern("news:*");
      return toOutput(row);
    }),
  update: protectedProcedure
    .input(newsInput.extend({ id: z.string() }))
    .output(newsOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const row = await ctx.db.news.update({
        where: { id },
        data: await toUpdateData(ctx.db, data),
        include: newsSelect,
      });
      await deleteByPattern("news:*");
      return toOutput(row);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.news.delete({ where: { id: input.id } });
      await deleteByPattern("news:*");
      return { id: input.id };
    }),
});
