import { beforeEach, describe, expect, it, vi } from "vitest";

// next-auth 在 node 測試環境無法使用 request scope，直接 mock
vi.mock("@/server/auth", () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { db } from "@/server/db";
import { adminCaller, cleanAllTables, publicCaller } from "./helpers";

const REGION_ID = "test-region-1";

const seedRegion = () =>
  db.region.create({ data: { id: REGION_ID, name: "測試區域", slug: "test" } });

// 案例 content 用新 JSON 契約
const caseContent = JSON.stringify({
  lead: "",
  sections: [{ heading: "", paragraphs: ["內容"] }],
  result: { label: "", value: "", note: "" },
});

const seedCase = (data: {
  id: string;
  title: string;
  slug?: string;
  painPointIds?: string[];
  solutionIds?: string[];
}) =>
  db.case.create({
    data: {
      id: data.id,
      slug: data.slug ?? data.id,
      title: data.title,
      content: caseContent,
      regionId: REGION_ID,
      painPoints: { create: (data.painPointIds ?? []).map((painPointId) => ({ painPointId })) },
      solutions: { create: (data.solutionIds ?? []).map((solutionId) => ({ solutionId })) },
    },
  });

beforeEach(async () => {
  await cleanAllTables(db);
});

describe("公開流程", () => {
  it("region.list 回傳區域列表", async () => {
    await seedRegion();
    const list = await publicCaller().region.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.slug).toBe("test");
  });

  it("region.getPublicBySlug 回傳區域完整內容（介紹/案例卡/痛點/方案）", async () => {
    await seedRegion();
    await db.intro.create({
      data: { id: "intro-1", title: "介紹一", content: "內容一", regionId: REGION_ID, createdAt: new Date("2026-01-01T00:00:00Z") },
    });
    await db.intro.create({
      data: { id: "intro-2", title: "介紹二", content: "內容二", regionId: REGION_ID, createdAt: new Date("2026-01-02T00:00:00Z") },
    });
    const group = await db.tagGroup.create({ data: { key: "industry", label: "行業" } });
    const tag = await db.tag.create({ data: { name: "教育", groupId: group.id } });
    const c1 = await seedCase({ id: "case-1", title: "案例1" });
    await db.case.update({
      where: { id: c1.id },
      data: { publishedAt: new Date("2026-02-01T00:00:00Z"), category: "教育", excerpt: "摘一" },
    });
    const c2 = await seedCase({ id: "case-2", title: "案例2" });
    await db.case.update({
      where: { id: c2.id },
      data: { publishedAt: new Date("2026-03-01T00:00:00Z") },
    });
    await db.caseTag.create({ data: { caseId: c1.id, tagId: tag.id } });
    await db.painPoint.create({ data: { id: "pp-1", title: "痛點A", regionId: REGION_ID } });

    const data = await publicCaller().region.getPublicBySlug({ slug: "test" });
    expect(data?.name).toBe("測試區域");
    // intros 按 createdAt asc
    expect(data?.intros.map((i) => i.title)).toEqual(["介紹一", "介紹二"]);
    // cases 按 publishedAt desc
    expect(data?.cases.map((c) => c.slug)).toEqual(["case-2", "case-1"]);
    expect(data?.cases[0]).toMatchObject({ title: "案例2", tags: [] });
    expect(data?.cases[1]).toMatchObject({ category: "教育", excerpt: "摘一", tags: ["教育"] });
    expect(data?.painPoints.map((p) => p.title)).toEqual(["痛點A"]);
  });

  it("region.getPublicBySlug 唔存在 slug 回 null；空區域回空陣列", async () => {
    expect(await publicCaller().region.getPublicBySlug({ slug: "nope" })).toBeNull();
    await db.region.create({ data: { id: "empty-region", name: "空區域", slug: "empty" } });
    const data = await publicCaller().region.getPublicBySlug({ slug: "empty" });
    expect(data).toMatchObject({ intros: [], cases: [], painPoints: [] });
  });

  it("case.listPublic 列出全部案例卡片（含 slug/tags）", async () => {
    await seedRegion();
    await seedCase({ id: "case-1", title: "案例1" });
    const list = await publicCaller().case.listPublic();
    expect(list.map((c) => c.id)).toEqual(["case-1"]);
    expect(list[0]?.slug).toBe("case-1");
  });

  it("case.getPublicBySlug 依 slug 取詳情", async () => {
    await seedRegion();
    await seedCase({ id: "case-1", title: "案例1", slug: "my-case" });
    const detail = await publicCaller().case.getPublicBySlug({ slug: "my-case" });
    expect(detail?.title).toBe("案例1");
    expect(detail?.sections).toHaveLength(1);
    // 不存在的 slug 回傳 null
    expect(await publicCaller().case.getPublicBySlug({ slug: "nope" })).toBeNull();
  });

  it("相關案例：共用痛點或共用方案（排除自己）", async () => {
    await seedRegion();
    await db.painPoint.create({
      data: { id: "pp-1", title: "痛點A", regionId: REGION_ID },
    });
    await db.painPoint.create({
      data: { id: "pp-2", title: "痛點B", regionId: REGION_ID },
    });
    await db.solution.create({
      data: { id: "sol-1", title: "方案X" },
    });
    const c1 = await seedCase({
      id: "case-1",
      title: "案例1",
      painPointIds: ["pp-1"],
      solutionIds: ["sol-1"],
    });
    await seedCase({ id: "case-2", title: "案例2", painPointIds: ["pp-1"] }); // 共用痛點
    await seedCase({ id: "case-3", title: "案例3", solutionIds: ["sol-1"] }); // 共用方案
    await seedCase({ id: "case-4", title: "案例4", painPointIds: ["pp-2"] }); // 無關

    const detail = await publicCaller().case.getPublicBySlug({ slug: c1.slug });
    expect(detail?.relatedCases.map((r) => r.slug).sort()).toEqual([
      "case-2",
      "case-3",
    ]);
  });

  it("case.getPublic 回傳案例與痛點（/apply 用）", async () => {
    await seedRegion();
    await db.painPoint.create({
      data: { id: "pp-1", title: "痛點A", regionId: REGION_ID },
    });
    const c = await seedCase({ id: "case-1", title: "案例1", painPointIds: ["pp-1"] });
    const detail = await publicCaller().case.getPublic({ id: c.id });
    expect(detail?.painPoints.map((p) => p.title)).toEqual(["痛點A"]);
  });

  it("application.create 寫入痛點快照（狀態 pending）", async () => {
    await seedRegion();
    await db.painPoint.create({
      data: { id: "pp-1", title: "痛點A", regionId: REGION_ID },
    });
    await seedCase({ id: "case-1", title: "案例1", painPointIds: ["pp-1"] });
    const app = await publicCaller().application.create({
      caseId: "case-1",
      applicantName: "測試員",
      applicantContact: "t@example.com",
      painPointIds: ["pp-1"],
    });
    expect(app.status).toBe("pending");
    expect(app.painPointsSnapshot).toEqual([
      { painPointId: "pp-1", title: "痛點A" },
    ]);
  });

  it("application.create 拒絕不屬於案例的痛點", async () => {
    await seedRegion();
    await db.painPoint.create({
      data: { id: "pp-1", title: "痛點A", regionId: REGION_ID },
    });
    await db.painPoint.create({
      data: { id: "pp-2", title: "痛點B", regionId: REGION_ID },
    });
    await seedCase({ id: "case-1", title: "案例1", painPointIds: ["pp-1"] });
    await expect(
      publicCaller().application.create({
        caseId: "case-1",
        applicantName: "測試員",
        applicantContact: "t@example.com",
        painPointIds: ["pp-2"], // 不屬於 case-1
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("application.create 拒絕不存在的案例", async () => {
    await expect(
      publicCaller().application.create({
        caseId: "nope",
        applicantName: "測試員",
        applicantContact: "t@example.com",
        painPointIds: [],
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("後台申請（5 狀態）", () => {
  it("application.update 可切換 5 狀態；list 可依狀態篩選", async () => {
    await seedRegion();
    await seedCase({ id: "case-1", title: "案例1" });
    const caller = publicCaller();
    const app = await caller.application.create({
      caseId: "case-1",
      applicantName: "測試員",
      applicantContact: "t@example.com",
      painPointIds: [],
    });

    const admin = adminCaller();
    for (const status of ["quoted", "developing", "completed", "cancelled"] as const) {
      const updated = await admin.application.update({ id: app.id, status });
      expect(updated.status).toBe(status);
    }
    await admin.application.update({ id: app.id, status: "pending" });

    const pending = await admin.application.list({ statuses: ["pending"] });
    expect(pending).toHaveLength(1);
    const quoted = await admin.application.list({ statuses: ["quoted"] });
    expect(quoted).toHaveLength(0);
    const all = await admin.application.list();
    expect(all).toHaveLength(1);
  });
});

describe("權限", () => {
  it("未登入呼叫 protected → UNAUTHORIZED", async () => {
    const caller = publicCaller();
    await expect(caller.me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      caller.region.create({ name: "x", slug: "x" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.news.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.dashboard.stats()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("登入後呼叫 protected → 成功", async () => {
    const caller = adminCaller();
    const me = await caller.me();
    expect(me.name).toBe("admin");
    await seedRegion();
    const created = await caller.region.create({ name: "新區域", slug: "new" });
    expect(created.slug).toBe("new");
  });
});
