import { beforeEach, describe, expect, it, vi } from "vitest";

// next-auth 在 node 測試環境無法使用 request scope，直接 mock
vi.mock("@/server/auth", () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { db } from "@/server/db";

type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

const REGION_ID = "test-region-1";

const makeCtx = (session: Ctx["session"]): Ctx =>
  ({ db, session, headers: new Headers() }) as Ctx;

const seedRegion = () =>
  db.region.create({ data: { id: REGION_ID, name: "測試區域", slug: "test" } });

beforeEach(async () => {
  // 清空測試資料（先刪子表）
  await db.$transaction([
    db.application.deleteMany(),
    db.casePainPoint.deleteMany(),
    db.caseSolution.deleteMany(),
    db.solutionPainPoint.deleteMany(),
    db.intro.deleteMany(),
    db.case.deleteMany(),
    db.solution.deleteMany(),
    db.painPoint.deleteMany(),
    db.region.deleteMany(),
  ]);
});

describe("公開流程", () => {
  it("region.list 回傳區域列表", async () => {
    await seedRegion();
    const caller = appRouter.createCaller(makeCtx(null));
    const list = await caller.region.list();
    expect(list).toHaveLength(1);
    expect(list[0]?.slug).toBe("test");
  });

  it("case.listPublic 依區域列出案例", async () => {
    await seedRegion();
    await db.case.create({
      data: { id: "case-1", title: "案例1", content: "內容", regionId: REGION_ID },
    });
    const caller = appRouter.createCaller(makeCtx(null));
    const list = await caller.case.listPublic({ regionSlug: "test" });
    expect(list.map((c) => c.id)).toEqual(["case-1"]);
    // 不存在的區域回傳空陣列
    const empty = await caller.case.listPublic({ regionSlug: "nope" });
    expect(empty).toEqual([]);
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
      data: { id: "sol-1", title: "方案X", regionId: REGION_ID },
    });
    const c1 = await db.case.create({
      data: {
        id: "case-1",
        title: "案例1",
        content: "內容1",
        regionId: REGION_ID,
        painPoints: { create: [{ painPointId: "pp-1" }] },
        solutions: { create: [{ solutionId: "sol-1" }] },
      },
    });
    await db.case.create({
      data: {
        id: "case-2",
        title: "案例2",
        content: "內容2",
        regionId: REGION_ID,
        painPoints: { create: [{ painPointId: "pp-1" }] }, // 共用痛點
      },
    });
    await db.case.create({
      data: {
        id: "case-3",
        title: "案例3",
        content: "內容3",
        regionId: REGION_ID,
        solutions: { create: [{ solutionId: "sol-1" }] }, // 共用方案
      },
    });
    await db.case.create({
      data: {
        id: "case-4",
        title: "案例4",
        content: "內容4",
        regionId: REGION_ID,
        painPoints: { create: [{ painPointId: "pp-2" }] }, // 無關
      },
    });

    const caller = appRouter.createCaller(makeCtx(null));
    const detail = await caller.case.getPublic({ id: c1.id });
    expect(detail?.relatedCases.map((r) => r.id).sort()).toEqual([
      "case-2",
      "case-3",
    ]);
  });

  it("application.create 寫入痛點快照", async () => {
    await seedRegion();
    await db.painPoint.create({
      data: { id: "pp-1", title: "痛點A", regionId: REGION_ID },
    });
    await db.case.create({
      data: {
        id: "case-1",
        title: "案例1",
        content: "內容",
        regionId: REGION_ID,
        painPoints: { create: [{ painPointId: "pp-1" }] },
      },
    });
    const caller = appRouter.createCaller(makeCtx(null));
    const app = await caller.application.create({
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
    await db.case.create({
      data: {
        id: "case-1",
        title: "案例1",
        content: "內容",
        regionId: REGION_ID,
        painPoints: { create: [{ painPointId: "pp-1" }] },
      },
    });
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.application.create({
        caseId: "case-1",
        applicantName: "測試員",
        applicantContact: "t@example.com",
        painPointIds: ["pp-2"], // 不屬於 case-1
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("權限", () => {
  it("未登入呼叫 protected → UNAUTHORIZED", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      caller.region.create({ name: "x", slug: "x" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("登入後呼叫 protected → 成功", async () => {
    const caller = appRouter.createCaller(
      makeCtx({
        user: { name: "admin" },
        expires: new Date().toISOString(),
      }),
    );
    const me = await caller.me();
    expect(me.name).toBe("admin");
    await seedRegion();
    const created = await caller.region.create({ name: "新區域", slug: "new" });
    expect(created.slug).toBe("new");
  });
});
