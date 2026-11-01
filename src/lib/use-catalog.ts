'use client';

// 服務目錄（client-side 讀 catalog.listCategories，public、有 Redis 快取）：
// SiteShell mega menu / 手機選單共用。
// pattern：useSyncExternalStore + module cache——SSR/build 唔 fetch（保住靜態頁），
// hydration 後 fetch；失敗回 null（選單項目唔顯示）。同一頁只 fetch 一次。
import { useSyncExternalStore } from 'react';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/api/root';
import type { CatalogCategory } from '@/server/api/routers/catalog';

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});

let cached: CatalogCategory[] | null | undefined; // undefined = 未載入
const listeners = new Set<() => void>();

function load() {
  if (cached !== undefined) return;
  cached = null; // 載入中
  // SSR / build 預渲染期間唔 fetch（避免 build 打 DB）
  if (typeof window === 'undefined') return;
  trpcClient.catalog.listCategories.query().then(
    (list: CatalogCategory[]) => {
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

export function useCatalog(): CatalogCategory[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
