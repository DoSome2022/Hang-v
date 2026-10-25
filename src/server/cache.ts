import { getRedis } from "@/server/redis";

// 公開頁快取：Redis 有值 → 直接回；冇 → 執行 fn 計算並寫入（TTL 秒）
// 日期序列化：JSON 唔支援 Date，用 prefix 標記 + reviver 還原，
// 確保 client 收到嘅仍然係真 Date（唔會重蹈舊版 superjson 未接嘅覆轍）

const DATE_PREFIX = "__date:";

// ⚠️ JSON.stringify 會先 call Date.toJSON() 先至 call replacer——
// 即係 replacer 收嘅 value 已經係 ISO string，「value instanceof Date」永遠
// 唔成立（呢個 bug 令快取寫入時 prefix 冇咗，第二次讀取 output 驗證爆）。
// 正解：用 this[key] 攞返上層 object 入面嘅原值判斷係咪真 Date。
export function replacer(this: Record<string, unknown>, key: string, value: unknown): unknown {
  const original = this[key];
  if (original instanceof Date) {
    return DATE_PREFIX + original.toISOString();
  }
  return value;
}

export function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && value.startsWith(DATE_PREFIX)) {
    return new Date(value.slice(DATE_PREFIX.length));
  }
  return value;
}

export const serializeForCache = (value: unknown): string =>
  JSON.stringify(value, replacer);

export const parseFromCache = (json: string): unknown =>
  JSON.parse(json, reviver);

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
      return parseFromCache(hit) as T;
    }
    const value = await fn();
    await redis.set(key, serializeForCache(value), "EX", ttlSeconds);
    return value;
  } catch {
    // Redis 出錯 → 降級為直接查 DB
    return fn();
  }
}
