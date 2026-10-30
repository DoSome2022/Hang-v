import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
import { categories } from '@/lib/service-catalog';
import { createCaller } from '@/server/api/caller';

// DB 案例動態加入 sitemap；DB 掛咗仍回 200（只少案例 URL）
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
  for (const category of categories) {
    entries.push({ path: `/services/${category.slug}`, priority: 0.7 });
    for (const service of category.services) entries.push({ path: `/services/${category.slug}/${service.slug}`, priority: 0.6 });
  }
  return entries.map((entry) => ({ url: `${siteUrl}${entry.path}`, changeFrequency: 'monthly', priority: entry.priority }));
}
