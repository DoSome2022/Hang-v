import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
import { createCaller } from '@/server/api/caller';

// DB 案例與區域動態加入 sitemap；DB 掛咗仍回 200（只少 DB URL）
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) return [];
  const entries = [
    { path: '', priority: 1 },
    { path: '/solutions/solo', priority: 0.8 },
    { path: '/solutions/sme', priority: 0.8 },
    { path: '/solutions/enterprise', priority: 0.8 },
    { path: '/services', priority: 0.9 },
    { path: '/choose-service', priority: 0.85 },
    { path: '/cases', priority: 0.8 },
  ];
  try {
    const caller = await createCaller();
    const cases = await caller.case.listPublic();
    for (const c of cases) {
      entries.push({ path: `/cases/${c.slug}`, priority: 0.65 });
    }
  } catch (error) {
    console.error('[sitemap] 案例資料不可用', error);
  }
  try {
    const caller = await createCaller();
    const regions = await caller.region.list();
    for (const r of regions) {
      entries.push({ path: `/r/${r.slug}`, priority: 0.7 });
    }
  } catch (error) {
    console.error('[sitemap] 區域資料不可用', error);
  }
  try {
    const caller = await createCaller();
    const catalog = await caller.catalog.listCategories();
    for (const category of catalog) {
      entries.push({ path: `/services/${category.slug}`, priority: 0.7 });
      for (const service of category.services) entries.push({ path: `/services/${category.slug}/${service.slug}`, priority: 0.6 });
    }
  } catch (error) {
    console.error('[sitemap] 服務目錄資料不可用', error);
  }
  return entries.map((entry) => ({ url: `${siteUrl}${entry.path}`, changeFrequency: 'monthly', priority: entry.priority }));
}
