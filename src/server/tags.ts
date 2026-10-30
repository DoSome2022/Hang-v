import type { PrismaClient } from "@prisma/client";

// 依 tag 名稱取得/建立 tag id（去重、trim）。
// 新 tag 預設放入 key='pain' 的 TagGroup（後台可在標籤管理改組）。
export async function ensureTagIds(
  db: PrismaClient,
  names: string[],
): Promise<string[]> {
  const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (cleaned.length === 0) return [];

  // 新 tag 預設放入 key='pain' 的 TagGroup；唔存在就自動建立
  const painGroup = await db.tagGroup.upsert({
    where: { key: "pain" },
    update: {},
    create: { key: "pain", label: "痛點", sortOrder: 1 },
  });
  const ids: string[] = [];
  for (const name of cleaned) {
    const existing = await db.tag.findUnique({ where: { name } });
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const created = await db.tag.create({
      data: { name, groupId: painGroup.id },
    });
    ids.push(created.id);
  }
  return ids;
}
