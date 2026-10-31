import { describe, expect, it } from "vitest";
import { parseFromCache, serializeForCache } from "@/server/cache";

// 快取序列化回歸測試：
// 曾有 bug——JSON.stringify 會先 call Date.toJSON()，replacer 收到嘅係
// ISO string 而唔係 Date，導致 prefix 冇寫入，第二次讀取時 zod
// output 驗證（z.date()）爆「Output validation failed」。

describe("cache serialize / parse roundtrip", () => {
  it("Date 經序列化往返後保持 Date 型別（含 prefix）", () => {
    const value = [
      {
        id: "abc",
        name: "示範區域",
        createdAt: new Date("2026-10-25T06:59:26.612Z"),
        updatedAt: new Date("2026-10-25T07:00:00.000Z"),
      },
    ];

    const json = serializeForCache(value);
    // 寫入時必須帶 prefix，否則 reviver 認唔出
    expect(json).toContain("__date:2026-10-25T06:59:26.612Z");

    const revived = parseFromCache(json) as typeof value;
    expect(revived[0]!.createdAt).toBeInstanceOf(Date);
    expect(revived[0]!.updatedAt).toBeInstanceOf(Date);
    expect(revived[0]!.createdAt.toISOString()).toBe(
      "2026-10-25T06:59:26.612Z",
    );
  });

  it("一般字串唔會被 prefix 邏輯誤傷", () => {
    const value = [{ title: "示範案例：茶餐廳轉型", content: "人手不足" }];
    const revived = parseFromCache(serializeForCache(value)) as typeof value;
    expect(revived[0]!.title).toBe("示範案例：茶餐廳轉型");
    expect(revived[0]!.content).toBe("人手不足");
  });

  it("null / 巢狀結構往返無損", () => {
    const value = { a: null, b: [{ c: 1, d: "x" }] };
    expect(parseFromCache(serializeForCache(value))).toEqual(value);
  });

  it("巢狀 Date（region aggregate 案例卡）往返後保持 Date 型別", () => {
    const value = {
      id: "r1",
      name: "示範區域",
      slug: "service-demo",
      intros: [{ id: "i1", title: "顧問服務示範", content: "內容" }],
      cases: [
        {
          id: "c1",
          slug: "case-1",
          title: "案例",
          publishedAt: new Date("2026-10-01T00:00:00.000Z"),
          tags: ["教育"],
        },
      ],
      painPoints: [],
      solutions: [],
    };

    const revived = parseFromCache(serializeForCache(value)) as typeof value;
    expect(revived.cases[0]!.publishedAt).toBeInstanceOf(Date);
    expect(revived.cases[0]!.publishedAt.toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
  });
});
