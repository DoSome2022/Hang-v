import { beforeEach, describe, expect, it, vi } from "vitest";

// 驗證 region 公開頁（region:public:slug:*）快取失效 wiring 冇漏：
// mock deleteByPattern 斷言邊啲 mutation 有清 region:*。
// 真正嘅 key 刪除行為由 src/server/redis.ts 負責，呢度只測 router 有冇 call。

// next-auth 在 node 測試環境無法使用 request scope，直接 mock
vi.mock("@/server/auth", () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

const { deleteByPatternMock } = vi.hoisted(() => ({
  deleteByPatternMock: vi.fn(),
}));

vi.mock("@/server/redis", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/redis")>();
  return { ...actual, deleteByPattern: deleteByPatternMock };
});

import { db } from "@/server/db";
import { adminCaller, cleanAllTables } from "./helpers";

beforeEach(async () => {
  deleteByPatternMock.mockClear();
  await cleanAllTables(db);
});

const seedRegion = () =>
  db.region.create({ data: { id: "r1", name: "區域", slug: "r" } });

const calledPatterns = () =>
  deleteByPatternMock.mock.calls.map((c) => c[0] as string).sort();

describe("region 公開頁快取失效", () => {
  it("case.create 同時失效 case:* 與 region:*", async () => {
    await seedRegion();
    await adminCaller().case.create({ slug: "c1", title: "案例", regionId: "r1" });
    expect(calledPatterns()).toEqual(["case:*", "region:*"]);
  });

  it("intro.update 失效 region:*", async () => {
    await seedRegion();
    const intro = await db.intro.create({
      data: { title: "介紹", content: "內容", regionId: "r1" },
    });
    await adminCaller().intro.update({
      id: intro.id,
      title: "介紹2",
      content: "內容2",
      regionId: "r1",
    });
    expect(calledPatterns()).toEqual(["region:*"]);
  });

  it("painPoint.create / solution.update 失效 case:* 與 region:*", async () => {
    await seedRegion();
    const admin = adminCaller();
    await admin.painPoint.create({ title: "痛點", regionId: "r1" });
    expect(calledPatterns()).toEqual(["case:*", "region:*"]);

    deleteByPatternMock.mockClear();
    const sol = await db.solution.create({
      data: { title: "方案", regionId: "r1" },
    });
    await admin.solution.update({
      id: sol.id,
      title: "方案2",
      regionId: "r1",
      painPointIds: [],
    });
    expect(calledPatterns()).toEqual(["case:*", "region:*"]);
  });

  it("tag.update 失效 case:* 與 region:*", async () => {
    const group = await db.tagGroup.create({ data: { key: "pain", label: "痛點" } });
    const tag = await db.tag.create({ data: { name: "網站慢", groupId: group.id } });
    await adminCaller().tag.update({ id: tag.id, name: "網站很慢" });
    expect(calledPatterns()).toEqual(["case:*", "region:*"]);
  });

  it("catalog serviceCreate 失效 catalog:*", async () => {
    const cat = await adminCaller().catalog.categoryCreate({ slug: "c1", title: "分類" });
    deleteByPatternMock.mockClear();
    await adminCaller().catalog.serviceCreate({ slug: "s1", title: "服務", categoryId: cat.id });
    expect(calledPatterns()).toEqual(["catalog:*"]);
  });
});
