// src/app/(public)/layout.tsx — 公開行銷站巢狀 layout（SiteShell + metadata）
// 注意：不得呼叫 auth()/cookies()/headers()，否則 57 頁失去靜態預渲染。

import type { Metadata } from 'next';
import { company, siteUrl } from '@/lib/site';
import SiteShell from '@/components/site-shell';

export const metadata: Metadata = {
  ...(siteUrl ? { alternates: { canonical: '/' } } : {}),
  title: '實瀚科技 HANGS｜AI 應用、流程自動化及企業 IT 解決方案',
  description: company.description,
  applicationName: company.name,
  keywords: ['香港 AI 解決方案', '一人公司 AI', '企業 AI 應用', '流程自動化', '雲端遷移', 'DevOps', '客製系統開發', '實瀚科技'],
  openGraph: {
    title: '少一點繁瑣，多一點可能。｜實瀚科技',
    description: company.description,
    type: 'website',
    locale: 'zh_HK',
    siteName: '實瀚科技 HANGS',
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: { card: 'summary_large_image', title: '實瀚科技｜讓科技，成為你的成長力。', description: company.description },
  robots: { index: Boolean(siteUrl), follow: Boolean(siteUrl) },
  category: 'technology',
};

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="fixed left-4 top-[-100px] z-[200] rounded-lg bg-navy px-5 py-3 text-white focus:top-3" href="#main">跳至主要內容</a>
      <SiteShell>{children}</SiteShell>
    </>
  );
}
