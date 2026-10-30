import { beforeEach, describe, expect, it, vi } from "vitest";

// next-auth 在 node 測試環境無法使用 request scope，直接 mock
vi.mock("@/server/auth", () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { db } from "@/server/db";
import { adminCaller, cleanAllTables } from "./helpers";

beforeEach(async () => {
  await cleanAllTables(db);
});

describe("tag router", () => {
  it("groupList 回傳標籤群組與組內 tags", async () => {
    const admin = adminCaller();
    const group = await db.tagGroup.create({ data: { key: "industry", label: "行業" } });
    await db.tag.create({ data: { name: "教育", groupId: group.id } });

    const groups = await admin.tag.groupList();
    expect(groups).toHaveLength(1);
    expect(groups[0]?.key).toBe("industry");
    expect(groups[0]?.tags.map((t) => t.name)).toEqual(["教育"]);
  });

  it("create/update/delete tag", async () => {
    const admin = adminCaller();
    const group = await db.tagGroup.create({ data: { key: "pain", label: "痛點" } });
    const created = await admin.tag.create({ name: "新痛點", groupId: group.id });
    expect(created.name).toBe("新痛點");
    const updated = await admin.tag.update({ id: created.id, name: "改咗名" });
    expect(updated.name).toBe("改咗名");
    await admin.tag.delete({ id: created.id });
    expect(await db.tag.count()).toBe(0);
  });
});

describe("news router", () => {
  it("create/list/update/delete", async () => {
    const admin = adminCaller();
    const created = await admin.news.create({
      title: "最新消息",
      summary: "摘要",
      category: "科技",
      status: "published",
      publishedAt: "2026-10-01",
      tagNames: [],
    });
    expect(created.status).toBe("published");

    const list = await admin.news.list();
    expect(list).toHaveLength(1);

    const updated = await admin.news.update({
      id: created.id,
      title: "最新消息",
      summary: "摘要",
      category: "科技",
      status: "draft",
      tagNames: ["新標籤"],
    });
    expect(updated.status).toBe("draft");
    expect(updated.tagNames).toContain("新標籤");

    await admin.news.delete({ id: created.id });
    expect(await db.news.count()).toBe(0);
  });
});

describe("dev router", () => {
  it("create → addPart → addComment → get", async () => {
    const admin = adminCaller();
    const project = await admin.dev.create({
      name: "專案A",
      client: "客戶A",
      status: "開發中",
      delivery: "2026-12-01",
      meetings: [],
    });
    expect(project.parts).toHaveLength(0);

    const part = await admin.dev.addPart({
      projectId: project.id,
      name: "前端 UI",
      owner: "Aaron",
      checklist: [{ label: "登入頁", done: true }],
    });
    expect(part.checklist).toEqual([{ label: "登入頁", done: true }]);

    await admin.dev.addComment({
      partId: part.id,
      who: "Aaron",
      text: "UI 俾客人試緊",
    });

    const got = await admin.dev.get({ id: project.id });
    expect(got.parts).toHaveLength(1);
    expect(got.parts[0]?.comments.map((c) => c.text)).toEqual(["UI 俾客人試緊"]);

    // updatePart 切 checklist
    const updated = await admin.dev.updatePart({
      id: part.id,
      name: "前端 UI",
      owner: "Aaron",
      checklist: [{ label: "登入頁", done: true }, { label: "手機版", done: false }],
    });
    expect(updated.checklist).toHaveLength(2);

    await admin.dev.delete({ id: project.id });
    expect(await db.devProject.count()).toBe(0);
  });
});

describe("account router", () => {
  it("create/list({kind})/delete", async () => {
    const admin = adminCaller();
    const quo = await admin.account.create({
      kind: "quotation",
      company: "ITE",
      number: "ITEQN-001",
      amount: 93600,
      status: "已報",
    });
    await admin.account.create({
      kind: "invoice",
      company: "ITE",
      number: "ITE-0101",
      amount: 32930,
      status: "待收",
    });

    const all = await admin.account.list();
    expect(all).toHaveLength(2);
    const quoList = await admin.account.list({ kind: "quotation" });
    expect(quoList.map((a) => a.id)).toEqual([quo.id]);

    await admin.account.delete({ id: quo.id });
    expect(await db.account.count()).toBe(1);
  });
});

describe("dashboard router", () => {
  it("stats 回傳真實數字", async () => {
    await db.region.create({ data: { id: "r1", name: "區域", slug: "r" } });
    await db.case.create({
      data: {
        id: "c1",
        slug: "c1",
        title: "案例",
        content: "{}",
        regionId: "r1",
      },
    });
    await db.application.create({
      data: {
        caseId: "c1",
        applicantName: "A",
        applicantContact: "a@b.c",
        painPointsSnapshot: [],
      },
    });

    const stats = await adminCaller().dashboard.stats();
    expect(stats.regions).toBe(1);
    expect(stats.cases).toBe(1);
    expect(stats.applicationsTotal).toBe(1);
    expect(stats.applicationStatuses.pending).toBe(1);
    expect(stats.applicationStatuses.quoted).toBe(0);
  });
});

describe("case router 後台", () => {
  it("create/update/delete 案例（新 input 全欄位）", async () => {
    await db.region.create({ data: { id: "r1", name: "區域", slug: "r" } });
    const admin = adminCaller();
    const created = await admin.case.create({
      slug: "demo-case",
      title: "示範案例",
      category: "教育",
      english: "DEMO",
      summary: "摘要",
      excerpt: "節錄",
      readTime: "5 分鐘",
      publishedAt: "2026-10-01",
      lead: "導言",
      sections: [{ heading: "背景", paragraphs: ["內文"] }],
      result: { label: "成效", value: "慳 50%", note: "備註" },
      tagNames: ["教育"],
      regionId: "r1",
      painPointIds: [],
      solutionIds: [],
    });
    expect(created.slug).toBe("demo-case");
    expect(created.tagNames).toEqual(["教育"]);

    const list = await admin.case.list();
    expect(list).toHaveLength(1);

    const got = await admin.case.get({ id: created.id });
    expect(JSON.parse(got.content)).toMatchObject({
      lead: "導言",
      result: { value: "慳 50%" },
    });

    const updated = await admin.case.update({
      id: created.id,
      slug: "demo-case",
      title: "示範案例（改）",
      category: "教育",
      english: "DEMO",
      summary: "摘要",
      excerpt: "節錄",
      readTime: "5 分鐘",
      publishedAt: "2026-10-01",
      lead: "導言",
      sections: [{ heading: "背景", paragraphs: ["內文"] }],
      result: { label: "成效", value: "慳 50%", note: "備註" },
      tagNames: ["教育", "中小企"],
      regionId: "r1",
      painPointIds: [],
      solutionIds: [],
    });
    expect(updated.title).toBe("示範案例（改）");
    expect(updated.tagNames.sort()).toEqual(["中小企", "教育"]);

    await admin.case.delete({ id: created.id });
    expect(await db.case.count()).toBe(0);
  });

  it("case.create 拒絕非法 slug", async () => {
    await db.region.create({ data: { id: "r1", name: "區域", slug: "r" } });
    await expect(
      adminCaller().case.create({
        slug: "Bad Slug!",
        title: "案例",
        regionId: "r1",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
