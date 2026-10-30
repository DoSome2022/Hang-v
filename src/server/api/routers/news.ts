import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { ensureTagIds } from "@/server/tags";

const newsStatusEnum = z.enum(["draft", "published"]);

const newsInput = z.object({
  title: z.string().min(1),
  summary: z.string().max(2000).default(""),
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
  title: z.string(),
  summary: z.string(),
  category: z.string(),
  status: newsStatusEnum,
  publishedAt: z.date().nullable(),
  tagNames: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const newsSelect = {
  tags: { select: { tag: { select: { name: true } } } },
} as const;

type NewsRow = Prisma.NewsGetPayload<{ include: typeof newsSelect }>;

const toOutput = (row: NewsRow) => {
  const { tags, ...rest } = row;
  return { ...rest, tagNames: tags.map((t) => t.tag.name) };
};

const toData = async (
  db: PrismaClient,
  input: z.infer<typeof newsInput>,
) => ({
  title: input.title,
  summary: input.summary,
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
  title: input.title,
  summary: input.summary,
  category: input.category,
  status: input.status,
  publishedAt: input.publishedAt ? new Date(`${input.publishedAt}T00:00:00.000Z`) : null,
  tags: {
    deleteMany: {},
    create: (await ensureTagIds(db, input.tagNames)).map((tagId) => ({ tagId })),
  },
});

export const newsRouter = createTRPCRouter({
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
      return toOutput(row);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.news.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
});
