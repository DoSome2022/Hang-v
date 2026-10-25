import Redis from "ioredis";

// Redis 單例——設計為「可選」：
// - 冇設 REDIS_URL（例如本地開發冇起 redis）→ 全部操作 no-op
// - 連線失敗 → 唔 crash，相關功能優雅降級（fail-open）
//
// 用途（三個設計觸發點）：
// 1. 公開頁快取（見 cache.ts）
// 2. 登入限流（見 auth.ts）
// 3. 將來：高頻行為追蹤 buffer（WebUserLog 模式）

const globalForRedis = globalThis as unknown as {
  redisClient?: Redis | null;
  redisStatus?: "unknown" | "up" | "down";
};

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: false,
    enableOfflineQueue: false,
  });

  client.on("error", () => {
    globalForRedis.redisStatus = "down";
  });
  client.on("ready", () => {
    globalForRedis.redisStatus = "up";
  });

  return client;
}

export function getRedis(): Redis | null {
  if (globalForRedis.redisStatus === "down") return null;
  if (globalForRedis.redisClient === undefined) {
    globalForRedis.redisClient = createClient();
  }
  return globalForRedis.redisClient;
}

/** SCAN + DEL：按 pattern 刪除快取鍵（避免 KEYS 阻塞） */
export async function deleteByPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys: string[] = [];
    let cursor = "0";
    do {
      const [next, found] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = next;
      keys.push(...found);
    } while (cursor !== "0");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // 快取失效失敗唔影響主流程
  }
}
