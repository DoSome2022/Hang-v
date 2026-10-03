// 測試必須跑在測試資料庫（db-test, 5433），防止誤用 dev DB。
// 用 make test 執行（scripts/test.sh 會 export DATABASE_URL=TEST_DATABASE_URL）。
if (!process.env.DATABASE_URL?.includes("claude_hangs_test")) {
  throw new Error(
    "DATABASE_URL 不是測試資料庫（claude_hangs_test）。請用 make test 執行測試。",
  );
}
