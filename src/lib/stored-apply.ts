'use client';

// 讀取 localStorage 的「申請案例」（consult_apply {caseId,title}）。
// 用 useSyncExternalStore 而非 useEffect：
// - SSR/hydration 期間用 getServerSnapshot（null），唔會有 hydration mismatch
// - getSnapshot 每次讀 localStorage 但按 raw 值快取，reference 穩定唔會無限重繪
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { CONSULT_APPLY_KEY } from '@/lib/storage-keys';

const storedApplySchema = z.object({ caseId: z.string().min(1), title: z.string() });
export type StoredApply = z.infer<typeof storedApplySchema>;

const noopSubscribe = () => () => {};
const serverSnapshot = null;

let lastRaw: string | null | undefined;
let lastValue: StoredApply | null = null;

function getSnapshot(): StoredApply | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CONSULT_APPLY_KEY);
  } catch {
    raw = null;
  }
  if (raw === lastRaw) return lastValue;
  lastRaw = raw;
  if (!raw) {
    lastValue = null;
    return lastValue;
  }
  try {
    const parsed = storedApplySchema.safeParse(JSON.parse(raw));
    lastValue = parsed.success ? parsed.data : null;
  } catch {
    lastValue = null;
  }
  return lastValue;
}

export function useStoredApply(): StoredApply | null {
  return useSyncExternalStore(noopSubscribe, getSnapshot, () => serverSnapshot);
}
