import type { Metadata } from 'next';
import { siteUrl } from './site';

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: `${title}｜實瀚科技 HANGS`, description,
    alternates: siteUrl ? { canonical: path } : { canonical: null },
    openGraph: { title: `${title}｜實瀚科技 HANGS`, description, type: 'website', locale: 'zh_HK', siteName: '實瀚科技 HANGS', ...(siteUrl ? { url: `${siteUrl}${path}` } : {}), images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Hangs Technology' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  };
}
