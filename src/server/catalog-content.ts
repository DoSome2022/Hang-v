import { z } from "zod";
import { faqSchema, workStepSchema } from "@/server/content-utils";

// 服務目錄 Json 欄位契約（ServiceCategory.approach/checklist、Service.benefits/... 嘅 Prisma Json 欄）
// 全 default：缺欄位/壞資料 safeParse 失敗時用 parseJsonOr fallback

export const stringArraySchema = z.array(z.string());
export const workflowArraySchema = z.array(workStepSchema);
export const faqsArraySchema = z.array(faqSchema);
