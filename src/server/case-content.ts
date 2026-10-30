import { z } from "zod";

// Case.content 的 JSON 契約：{ lead, sections, result }
// - 舊資料可能是純文字，parseCaseContent 會 fallback 成單一 section，唔會爆 500

export const caseSectionSchema = z.object({
  heading: z.string().default(""),
  paragraphs: z.array(z.string()).default([]),
  bullets: z.array(z.string()).optional(),
});

export const caseResultSchema = z.object({
  label: z.string().default(""),
  value: z.string().default(""),
  note: z.string().default(""),
});

export const caseContentSchema = z.object({
  lead: z.string().default(""),
  sections: z.array(caseSectionSchema).default([]),
  result: caseResultSchema.default({ label: "", value: "", note: "" }),
});

export type CaseContent = z.infer<typeof caseContentSchema>;

export function parseCaseContent(raw: string): CaseContent {
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = caseContentSchema.safeParse(parsed);
    if (result.success) return result.data;
  } catch {
    // fallthrough
  }
  // 舊純文字 content → 單一 section
  const text = raw.trim();
  return {
    lead: "",
    sections: text ? [{ heading: "", paragraphs: [text] }] : [],
    result: { label: "", value: "", note: "" },
  };
}

export function serializeCaseContent(data: CaseContent): string {
  return JSON.stringify(caseContentSchema.parse(data));
}
