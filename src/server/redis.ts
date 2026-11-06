import { createHash } from 'node:crypto';
import Redis from 'ioredis';

// 全站唯一 Redis 模組（合併自 Hangs_v2 的降級安全版本 + claude_hangs 的快取/限流功能）。
// 設計為「可選」：
// - 冇設 REDIS_URL（例如本地開發冇起 redis）→ getRedis() 回 null，呼叫方自行降級
// - 連線失敗 → 唔 crash，5 秒冷卻 + 有界重試，唔會連線風暴
//
// 用途：
// 1. 公開頁快取（見 cache.ts）
// 2. 登入限流（見 auth.ts）
// 3. 諮詢表單限流 + 排隊（見 app/api/consult/route.ts）

// 單例狀態放在 globalThis，避免 dev hot reload 重複建立連線。
type RedisState = { client: Redis; nextConnectAt: number };
const globalForRedis = globalThis as unknown as { __hangsRedis?: RedisState };

const CONNECT_COOLDOWN_MS = 5000;
const READY_TIMEOUT_MS = 1000;

export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

function createClient(): Redis {
  const client = new Redis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    connectTimeout: 1000,
    commandTimeout: 1500,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    enableReadyCheck: true,
    retryStrategy: (times) => (times > 3 ? null : Math.min(200 * times, 1000)),
    connectionName: 'hangs-web',
  });
  // no-op listener：避免未處理的 error 事件令 process 崩潰。
  // 連線失敗由 getRedis() 的冷卻重試機制處理。
  client.on('error', () => {});
  return client;
}

function waitForReady(client: Redis, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (client.status === 'ready') {
      resolve(true);
      return;
    }
    const timer = setTimeout(() => {
      client.off('ready', onReady);
      resolve(false);
    }, timeoutMs);
    const onReady = () => {
      clearTimeout(timer);
      resolve(true);
    };
    client.once('ready', onReady);
  });
}

/**
 * 取得可用的 Redis 客戶端；任何情況下都不可令 Next server 卡住或崩潰：
 * - 未設定 REDIS_URL → null（呼叫方自行降級）
 * - 已 ready → 直接回傳
 * - 正在重連 → null（背景有界重試由 ioredis 處理）
 * - 連線失敗 → 5 秒冷卻內不再嘗試，避免連線風暴
 */
export async function getRedis(): Promise<Redis | null> {
  if (!process.env.REDIS_URL) return null;

  const state = (globalForRedis.__hangsRedis ??= { client: createClient(), nextConnectAt: 0 });
  const { client } = state;

  if (client.status === 'ready') return client;
  if (client.status === 'reconnecting') return null;
  if (Date.now() < state.nextConnectAt) return null;

  state.nextConnectAt = Date.now() + CONNECT_COOLDOWN_MS;
  try {
    await client.connect();
  } catch {
    return null;
  }
  const ready = await waitForReady(client, READY_TIMEOUT_MS);
  return ready ? client : null;
}

/** 一次性腳本（seed 等）用：斷開連線令 process 可以退出 */
export async function closeRedis(): Promise<void> {
  const state = globalForRedis.__hangsRedis;
  if (!state) return;
  try {
    state.client.disconnect();
  } catch {
    // no-op
  }
}

/** SCAN + DEL：按 pattern 刪除快取鍵（避免 KEYS 阻塞） */
export async function deleteByPattern(pattern: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [next, found] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = next;
      keys.push(...found);
    } while (cursor !== '0');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // 快取失效失敗唔影響主流程
  }
}

// 固定視窗限流：單一 Lua script 原子完成 INCR + 首次 EXPIRE + TTL
const RATE_LIMIT_SCRIPT = `
local ipCount = redis.call('INCR', KEYS[1])
if ipCount == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ipTtl = redis.call('TTL', KEYS[1])
local globalCount = redis.call('INCR', KEYS[2])
if globalCount == 1 then redis.call('EXPIRE', KEYS[2], ARGV[2]) end
local globalTtl = redis.call('TTL', KEYS[2])
return { ipCount, ipTtl, globalCount, globalTtl }
`;

/**
 * 諮詢表單固定視窗限流（per-IP + 全域）。
 * 超限回 allowed:false 與 retryAfter（秒）；Redis 不可用由呼叫方處理。
 */
export async function fixedWindowLimit(opts: {
  ipKey: string;
  globalKey: string;
  ipLimit: number;
  ipWindowSeconds: number;
  globalLimit: number;
  globalWindowSeconds: number;
}): Promise<{ allowed: boolean; retryAfter: number } | null> {
  const redis = await getRedis();
  if (!redis) return null;
  const [ipCount, ipTtl, globalCount, globalTtl] = (await redis.eval(
    RATE_LIMIT_SCRIPT,
    2,
    opts.ipKey,
    opts.globalKey,
    opts.ipWindowSeconds,
    opts.globalWindowSeconds,
  )) as number[];
  if (Number(ipCount) > opts.ipLimit || Number(globalCount) > opts.globalLimit) {
    return { allowed: false, retryAfter: Math.max(Number(ipTtl) || 1, Number(globalTtl) || 1) };
  }
  return { allowed: true, retryAfter: 0 };
}

/** 原子 LPUSH + LTRIM 排入佇列（上限 maxLength，超出丟棄最舊） */
export async function enqueueJson(key: string, payload: unknown, maxLength: number): Promise<void> {
  const redis = await getRedis();
  if (!redis) throw new Error('redis unavailable');
  await redis.multi().lpush(key, JSON.stringify(payload)).ltrim(key, 0, maxLength - 1).exec();
}

// 咨詢佇列 key：/api/consult 建立申請後 best-effort 排入，供將來 email/CRM worker 消費
export const CONSULT_QUEUE_KEY = 'hangs:consult:queue';

// —— 登入限流 ——

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_LOCK_SECONDS = 15 * 60;

export function loginKey(ip: string): string {
  return `hangs:login:fail:${hashToken(ip)}`;
}

// 原子 INCR + 首次 EXPIRE（修正舊版 INCR/EXPIRE 非原子的問題）
const LOGIN_FAIL_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;

export async function loginBlocked(ip: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false; // fail-open
  try {
    const count = await redis.get(loginKey(ip));
    return count !== null && Number(count) >= LOGIN_MAX_FAILURES;
  } catch {
    return false;
  }
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.eval(LOGIN_FAIL_SCRIPT, 1, loginKey(ip), LOGIN_LOCK_SECONDS);
  } catch {
    // 記錄失敗唔影響登入流程
  }
}

export async function resetLoginFailures(ip: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.del(loginKey(ip));
  } catch {
    // no-op
  }
}
