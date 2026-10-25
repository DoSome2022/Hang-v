import { getRedis } from "@/server/redis";

// 公開頁快取：Redis 有值 → 直接回；冇 → 執行 fn 計算並寫入（TTL 秒）
// 日期序列化：JSON 唔支援 Date，用 prefix 標記 + reviver 還原，
// 確保 client 收到嘅仍然係真 Date（唔會重蹈舊版 superjson 未接嘅覆轍）

const DATE_PREFIX = "__date:";

function replacer(_key: string, value: unknown): unknown {
  return value instanceof Date ? DATE_PREFIX + value.toISOString() : value;
}

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && value.startsWith(DATE_PREFIX)) {
    return new Date(value.slice(DATE_PREFIX.length));
  }
  return value;
}

/** 快取 wrapper；Redis 唔可用時直接執行 fn（fail-open） */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fn();
  try {
    const hit = await redis.get(key);
    if (hit !== null) {
      return JSON.parse(hit, reviver) as T;
    }
    const value = await fn();
    await redis.set(key, JSON.stringify(value, replacer), "EX", ttlSeconds);
    return value;
  } catch {
    // Redis 出錯 → 降級為直接查 DB
    return fn();
  }
}
