import { getRedis } from '@/server/redis';
import { db } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

// 供 Docker healthcheck 使用：
// - DB 是必要依賴：down → 503（容器會被標記 unhealthy）
// - Redis 是可降級依賴：down → 200 + degraded（快取/限流失效，靜態頁照常服務，
//   諮詢提交回 503；避免 Redis 短暫故障令容器被重啟）
export async function GET() {
  const timestamp = new Date().toISOString();

  let dbUp = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbUp = true;
  } catch {
    dbUp = false;
  }
  if (!dbUp) {
    return Response.json({ status: 'down', db: 'down', redis: 'unknown', timestamp }, { status: 503, headers: NO_STORE });
  }

  const redis = await getRedis();
  if (!redis) {
    return Response.json({ status: 'degraded', db: 'up', redis: 'down', timestamp }, { status: 200, headers: NO_STORE });
  }
  try {
    await redis.ping();
    return Response.json({ status: 'ok', db: 'up', redis: 'up', timestamp }, { status: 200, headers: NO_STORE });
  } catch {
    return Response.json({ status: 'degraded', db: 'up', redis: 'down', timestamp }, { status: 200, headers: NO_STORE });
  }
}
