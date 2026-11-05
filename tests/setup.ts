// 測試必須跑在測試資料庫（db-test, 5433），防止誤用 dev DB。
// 用 make test 執行（scripts/test.sh 會 export DATABASE_URL=TEST_DATABASE_URL）。
if (!process.env.DATABASE_URL?.includes("claude_hangs_test")) {
  throw new Error(
    "DATABASE_URL 不是測試資料庫（claude_hangs_test）。請用 make test 執行測試。",
  );
}

// Redis 隔離：測試用 DB 1（同 scripts/test-e2e.sh 策略），
// 避免測試寫入嘅公開頁快取（case:*/region:*/news:*/catalog:*）污染 dev 站（DB 0）。
if (process.env.REDIS_URL) {
  process.env.REDIS_URL = process.env.REDIS_URL.replace(/\/\d+$/, "") + "/1";
}

// 每檔測試完結後清空測試表：避免殘留資料污染下一個 test file，
// 亦避免殘留行（例如 catalog category）令之後嘅 e2e 種子資料斷言失準。
// 注意：唔可以經 helpers import（會載入 app graph → next-auth → next/server 喺
// node 環境解唔到，同埋會令 test file 嘅 vi.mock 失效）；
// 用獨立嘅 tables.ts + 直接 import db（db.ts 冇 auth 依賴）。
import { afterAll } from "vitest";
import { db } from "@/server/db";
import { cleanAllTables } from "./tables";

afterAll(async () => {
  await cleanAllTables(db);
});
