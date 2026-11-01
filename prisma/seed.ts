// 種子資料：可重複執行（全部 findFirst-or-create / upsert，唔會破壞既有資料）。
// 執行：npx prisma db seed（或 make db-seed）
// 注意：production 唔會自動跑 seed，如需首發內容請手動執行。

import { PrismaClient } from '@prisma/client';
import { closeRedis, deleteByPattern } from '../src/server/redis';
import { seedCases } from './seed-data/cases';
import { seedTagGroups, seedTags, seedPainPoints, seedSolutions } from './seed-data/taxonomy';
import { seedNews } from './seed-data/news';
import { seedDevs } from './seed-data/devs';
import { categories as seedCatalogCategories } from './seed-data/service-catalog';

const prisma = new PrismaClient();

// 日期字串 → UTC 午夜（避免時區偏移）
function dateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

async function ensureRegion() {
  return prisma.region.upsert({
    where: { slug: 'service-demo' },
    update: { name: '示範區域' },
    create: { name: '示範區域', slug: 'service-demo' },
  });
}

async function ensureTagGroups() {
  const groups = new Map<string, string>();
  for (const g of seedTagGroups) {
    const row = await prisma.tagGroup.upsert({
      where: { key: g.key },
      // 唔覆寫 label：後台可主動改名，重跑 seed 唔應該 revert 後台修改
      update: {},
      create: { key: g.key, label: g.label, sortOrder: g.sortOrder },
    });
    groups.set(g.key, row.id);
  }
  return groups;
}

async function ensureTag(groupIds: Map<string, string>, name: string, group: 'industry' | 'pain' | 'audience'): Promise<string> {
  const existing = await prisma.tag.findUnique({ where: { name } });
  if (existing) return existing.id;
  const created = await prisma.tag.create({
    data: { name, groupId: groupIds.get(group)! },
  });
  return created.id;
}

async function ensurePainPoint(regionId: string, title: string, description: string | null): Promise<string> {
  const existing = await prisma.painPoint.findFirst({ where: { title, regionId } });
  if (existing) return existing.id;
  const created = await prisma.painPoint.create({
    data: { title, description, regionId },
  });
  return created.id;
}

async function ensureSolution(regionId: string, title: string, description: string | null): Promise<string> {
  const existing = await prisma.solution.findFirst({ where: { title, regionId } });
  if (existing) return existing.id;
  const created = await prisma.solution.create({
    data: { title, description, regionId },
  });
  return created.id;
}

async function seedCasesIntoDb(regionId: string, groupIds: Map<string, string>) {
  for (const c of seedCases) {
    const caseRow = await prisma.case.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        content: JSON.stringify({ lead: c.lead, sections: c.sections, result: c.result }),
        summary: c.summary,
        category: c.category,
        english: c.english,
        excerpt: c.excerpt,
        readTime: c.readTime,
        publishedAt: dateOnly(c.date),
        regionId,
      },
      create: {
        slug: c.slug,
        title: c.title,
        content: JSON.stringify({ lead: c.lead, sections: c.sections, result: c.result }),
        summary: c.summary,
        category: c.category,
        english: c.english,
        excerpt: c.excerpt,
        readTime: c.readTime,
        publishedAt: dateOnly(c.date),
        regionId,
      },
    });

    // 關聯重建（deleteMany + createMany 保證 idempotent，只影響呢個案例）
    const tagIds: string[] = [];
    for (const tagName of c.tags) {
      // 案例 tags 冇 group 標示，按名稱喺 seedTags 搵；搵唔到就放 pain group
      const def = seedTags.find((t) => t.name === tagName);
      tagIds.push(await ensureTag(groupIds, tagName, def?.group ?? 'pain'));
    }
    const painPointIds = [];
    for (const pp of c.painPoints) {
      const def = seedPainPoints.find((p) => p.title === pp);
      painPointIds.push(await ensurePainPoint(regionId, pp, def?.description ?? null));
    }
    const solutionIds = [];
    for (const s of c.solutions) {
      const def = seedSolutions.find((x) => x.title === s);
      solutionIds.push(await ensureSolution(regionId, s, def?.description ?? null));
    }

    await prisma.caseTag.deleteMany({ where: { caseId: caseRow.id } });
    if (tagIds.length > 0) {
      await prisma.caseTag.createMany({
        data: tagIds.map((tagId) => ({ caseId: caseRow.id, tagId })),
      });
    }
    await prisma.casePainPoint.deleteMany({ where: { caseId: caseRow.id } });
    if (painPointIds.length > 0) {
      await prisma.casePainPoint.createMany({
        data: painPointIds.map((painPointId) => ({ caseId: caseRow.id, painPointId })),
      });
    }
    await prisma.caseSolution.deleteMany({ where: { caseId: caseRow.id } });
    if (solutionIds.length > 0) {
      await prisma.caseSolution.createMany({
        data: solutionIds.map((solutionId) => ({ caseId: caseRow.id, solutionId })),
      });
    }
  }
}

async function seedNewsIntoDb(groupIds: Map<string, string>) {
  for (const n of seedNews) {
    const existing = await prisma.news.findFirst({ where: { title: n.title } });
    if (existing) continue;
    const tagIds: string[] = [];
    for (const tagName of n.tags) {
      const def = seedTags.find((t) => t.name === tagName);
      tagIds.push(await ensureTag(groupIds, tagName, def?.group ?? 'pain'));
    }
    await prisma.news.create({
      data: {
        title: n.title,
        summary: n.summary,
        category: n.category,
        status: n.status,
        publishedAt: dateOnly(n.date),
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
  }
}

async function seedDevsIntoDb() {
  for (const d of seedDevs) {
    const existing = await prisma.devProject.findFirst({ where: { name: d.name } });
    if (existing) continue;
    await prisma.devProject.create({
      data: {
        name: d.name,
        client: d.client,
        status: d.status,
        delivery: dateOnly(d.delivery),
        warranty: dateOnly(d.warranty),
        link: d.link,
        meetings: d.meetings,
        parts: {
          create: d.parts.map((p, i) => ({
            name: p.name,
            owner: p.owner,
            deadline: dateOnly(p.deadline),
            checklist: p.checklist,
            sortOrder: i,
            comments: {
              create: p.comments.map((cm) => ({
                who: cm.who,
                whenLabel: cm.when,
                text: cm.text,
              })),
            },
          })),
        },
      },
    });
  }
}

async function seedAccounts() {
  const rows = [
    { kind: 'quotation' as const, company: 'HANGS', number: 'HANGSQN-001', amount: 283000, status: '已報' },
    { kind: 'quotation' as const, company: 'ITE', number: 'ITEQN-001', amount: 93600, status: '已報' },
    { kind: 'quotation' as const, company: 'ITEC', number: 'ITECQN-001', amount: 20100, status: '已報' },
    { kind: 'invoice' as const, company: 'ITE', number: 'ITE-0101', amount: 32930, status: '待收' },
    { kind: 'invoice' as const, company: 'ITEC', number: 'ITEC-0101', amount: 20100, status: '待收' },
    { kind: 'invoice' as const, company: 'HANGS', number: 'HANGSINV-0101', amount: 283000, status: '待收' },
    { kind: 'receipt' as const, company: 'ITE', number: 'ITEREC-001', amount: 93600, status: '已收' },
    { kind: 'receipt' as const, company: 'ITEC', number: 'ITECREC-001', amount: 20100, status: '已收' },
    { kind: 'receipt' as const, company: 'HANGS', number: 'HANGSREC-001', amount: 283000, status: '已收' },
  ];
  for (const r of rows) {
    await prisma.account.upsert({
      where: { number: r.number },
      update: { kind: r.kind, company: r.company, amount: r.amount, status: r.status },
      create: { kind: r.kind, company: r.company, number: r.number, amount: r.amount, status: r.status },
    });
  }
}

// 服務目錄（公開 /services）：upsert by slug。
// 預設唔覆寫 admin 修改（update: {}）；SEED_FORCE_CONTENT=1 時強制還原 seed 內容
async function seedServiceCatalog() {
  const force = process.env.SEED_FORCE_CONTENT === '1';
  for (const [categoryIndex, cat] of seedCatalogCategories.entries()) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: force
        ? {
            title: cat.title,
            english: cat.english,
            icon: cat.icon,
            description: cat.description,
            intro: cat.intro,
            approach: cat.approach,
            checklist: cat.checklist,
            sortOrder: categoryIndex,
          }
        : {},
      create: {
        slug: cat.slug,
        title: cat.title,
        english: cat.english,
        icon: cat.icon,
        description: cat.description,
        intro: cat.intro,
        approach: cat.approach,
        checklist: cat.checklist,
        sortOrder: categoryIndex,
      },
    });
    for (const [serviceIndex, svc] of cat.services.entries()) {
      await prisma.service.upsert({
        where: { slug: svc.slug },
        update: force
          ? {
              title: svc.title,
              english: svc.english,
              tagline: svc.tagline,
              intro: svc.intro,
              problem: svc.problem,
              benefits: svc.benefits,
              capabilities: svc.capabilities,
              workflow: svc.workflow,
              fit: svc.fit,
              faqs: svc.faqs,
              categoryId: category.id,
              sortOrder: serviceIndex,
            }
          : {},
        create: {
          slug: svc.slug,
          categoryId: category.id,
          title: svc.title,
          english: svc.english,
          tagline: svc.tagline,
          intro: svc.intro,
          problem: svc.problem,
          benefits: svc.benefits,
          capabilities: svc.capabilities,
          workflow: svc.workflow,
          fit: svc.fit,
          faqs: svc.faqs,
          sortOrder: serviceIndex,
        },
      });
    }
  }
  await deleteByPattern('catalog:*');
}

async function seedIntro(regionId: string) {
  const existing = await prisma.intro.findFirst({ where: { regionId } });
  if (existing) return;
  await prisma.intro.create({
    data: {
      title: '顧問服務示範',
      content: '呢個係 demo 區域，用嚟親身試用成個流程。',
      regionId,
    },
  });
}

async function main() {
  const region = await ensureRegion();
  const groupIds = await ensureTagGroups();

  // 基礎 tags
  for (const t of seedTags) {
    await ensureTag(groupIds, t.name, t.group);
  }
  // 痛點與方案
  for (const p of seedPainPoints) {
    await ensurePainPoint(region.id, p.title, p.description);
  }
  for (const s of seedSolutions) {
    await ensureSolution(region.id, s.title, s.description);
  }

  await seedCasesIntoDb(region.id, groupIds);
  await seedNewsIntoDb(groupIds);
  await seedDevsIntoDb();
  await seedAccounts();
  await seedIntro(region.id);
  await seedServiceCatalog();

  // 清公開頁快取：避免部署後「空案例列表」負面快取殘留 2 分鐘
  // （Redis 唔可用時 deleteByPattern 係 no-op，唔影響 seed 本身）
  await deleteByPattern('case:*');
  await deleteByPattern('region:*');

  const [regions, cases, tags, news, devs, accounts] = await Promise.all([
    prisma.region.count(),
    prisma.case.count(),
    prisma.tag.count(),
    prisma.news.count(),
    prisma.devProject.count(),
    prisma.account.count(),
  ]);
  console.log(`Seed 完成：regions=${regions}, cases=${cases}, tags=${tags}, news=${news}, devs=${devs}, accounts=${accounts}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // ioredis 連線會令 event loop 唔退出，必須斷開
    await closeRedis();
    await prisma.$disconnect();
  });
