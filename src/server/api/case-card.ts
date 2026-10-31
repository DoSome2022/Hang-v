import type { Prisma } from "@prisma/client";
import { z } from "zod";

// 公開案例卡共用 schema / select / 轉換：
// case router 嘅 listPublic 同 region aggregate（區域公開頁）都用同一形狀
export const caseCardOutput = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  excerpt: z.string(),
  summary: z.string(),
  readTime: z.string(),
  publishedAt: z.date().nullable(),
  tags: z.array(z.string()),
});

export const caseCardSelect = {
  id: true,
  slug: true,
  title: true,
  category: true,
  excerpt: true,
  summary: true,
  readTime: true,
  publishedAt: true,
  tags: { select: { tag: { select: { name: true } } } },
} satisfies Prisma.CaseSelect;

type CaseCardRow = Prisma.CaseGetPayload<{ select: typeof caseCardSelect }>;

export const toCaseCard = (row: CaseCardRow) => {
  const { tags, ...rest } = row;
  return { ...rest, tags: tags.map((t) => t.tag.name) };
};
