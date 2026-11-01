import { z } from "zod";

// 行銷內容契約共用工具（service catalog / audience / site content 共用）
// 精神同 src/server/case-content.ts：全 default 容忍缺欄位、壞資料 fallback

/** 兩行標題（PageHeading.title 等 [line1, line2] 欄位） */
export const titlePairSchema = z.tuple([z.string(), z.string()]);
export type TitlePair = z.infer<typeof titlePairSchema>;

export const faqSchema = z.object({
  question: z.string().default(""),
  answer: z.string().default(""),
});
export type FaqItem = z.infer<typeof faqSchema>;

export const workStepSchema = z.object({
  title: z.string().default(""),
  text: z.string().default(""),
});
export type WorkStepItem = z.infer<typeof workStepSchema>;

export const slugPattern = /^[a-z0-9-]+$/;

/** Prisma Json 欄位 parse：safeParse 失敗（null/壞資料）回 fallback */
export function parseJsonOr<T>(schema: z.ZodType<T>, raw: unknown, fallback: T): T {
  const result = schema.safeParse(raw);
  return result.success ? result.data : fallback;
}
