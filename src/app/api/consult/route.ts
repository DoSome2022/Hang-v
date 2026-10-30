import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { enqueueJson, fixedWindowLimit, getRedis, hashToken } from '@/server/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IP_LIMIT = 5;
const IP_WINDOW_SECONDS = 600;
const GLOBAL_LIMIT = 100;
const GLOBAL_WINDOW_SECONDS = 3600;
const QUEUE_KEY = 'hangs:consult:queue';
const QUEUE_MAX = 1000;
const IP_FALLBACK = 'unknown';

const NO_STORE = { 'Cache-Control': 'no-store' };

function ipHash(ip: string): string {
  return hashToken(ip);
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim().slice(0, 64);
    if (first) return first;
  }
  return IP_FALLBACK;
}

function json(body: object, status: number, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

export async function POST(request: NextRequest) {
  const redis = await getRedis();
  if (!redis) {
    return json({ ok: false, error: 'SERVICE_UNAVAILABLE' }, 503);
  }

  const ip = clientIp(request);
  const ipKey = `hangs:consult:rl:ip:${ipHash(ip)}`;

  // 1. 限流（per-IP + 全域），超限回 429 + Retry-After
  try {
    const limit = await fixedWindowLimit({
      ipKey,
      globalKey: 'hangs:consult:rl:global',
      ipLimit: IP_LIMIT,
      ipWindowSeconds: IP_WINDOW_SECONDS,
      globalLimit: GLOBAL_LIMIT,
      globalWindowSeconds: GLOBAL_WINDOW_SECONDS,
    });
    if (limit === null) {
      return json({ ok: false, error: 'SERVICE_UNAVAILABLE' }, 503);
    }
    if (!limit.allowed) {
      return json({ ok: false, error: 'RATE_LIMITED' }, 429, { 'Retry-After': String(limit.retryAfter) });
    }
  } catch {
    return json({ ok: false, error: 'SERVICE_UNAVAILABLE' }, 503);
  }

  // 2. 解析並驗證表單
  let fields: Record<string, string>;
  try {
    const formData = await request.formData();
    fields = Object.fromEntries(
      [...formData.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : '']),
    );
  } catch {
    return json({ ok: false, error: 'INVALID_INPUT' }, 400);
  }

  const name = (fields.name ?? '').trim();
  const company = (fields.company ?? '').trim();
  const email = (fields.email ?? '').trim();
  const size = (fields.size ?? '').trim();
  const service = (fields.service ?? '').trim();
  const message = (fields.message ?? '').trim();

  const invalid =
    !name || name.length > 80 ||
    company.length > 120 ||
    !email || email.length > 180 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    size.length > 40 ||
    service.length > 120 ||
    !message || message.length > 2000;
  if (invalid) {
    return json({ ok: false, error: 'INVALID_INPUT' }, 400);
  }

  // 3. 排入佇列（原子 LPUSH + LTRIM 上限）
  const payload = {
    schemaVersion: 1,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    ipHash: ipHash(ip),
    userAgent: (request.headers.get('user-agent') ?? '').slice(0, 300),
    name,
    company,
    email,
    size,
    service,
    message,
  };

  try {
    await enqueueJson(QUEUE_KEY, payload, QUEUE_MAX);
  } catch {
    return json({ ok: false, error: 'SERVICE_UNAVAILABLE' }, 503);
  }

  return json({ ok: true, id: payload.id }, 200);
}
