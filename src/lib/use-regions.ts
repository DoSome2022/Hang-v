'use client';

// 公開區域列表（client-side 讀 region.list，public、有 Redis 快取）：
// Header 導覽選單同 Footer 共用。
// 用 useSyncExternalStore 模式（同 stored-apply.ts）：
// - SSR / build 預渲染期間唔 fetch（保住 SSG）
// - hydration 後 fetch，結果到咗先 notify 重繪
// - fetch 失敗或冇區域 → null（消費位隱藏，唔顯示空選單）
// - module-level cache：同一個頁面 load 內 Header + Footer 只 fetch 一次
import { useSyncExternalStore } from 'react';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/api/root';

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});

// region.list output（對應 src/server/api/routers/region.ts 嘅 regionOutput）
type RegionListItem = { id: string; name: string; slug: string };

let cached: RegionListItem[] | null | undefined; // undefined = 未載入
const listeners = new Set<() => void>();

function load() {
  if (cached !== undefined) return;
  cached = null; // 載入中
  // SSR / build 預渲染期間唔 fetch（避免 build 打 DB）
  if (typeof window === 'undefined') return;
  trpcClient.region.list.query().then(
    (list: RegionListItem[]) => {
      cached = list.length > 0 ? list : null;
      listeners.forEach((l) => l());
    },
    () => {
      cached = null; // 失敗 → 唔顯示
      listeners.forEach((l) => l());
    },
  );
}

const getSnapshot = () => {
  load();
  return cached ?? null;
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export function useRegions(): RegionListItem[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
