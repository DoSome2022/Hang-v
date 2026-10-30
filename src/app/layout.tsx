// src/app/layout.tsx — 全站 root layout（html/body + 共用 CSS + metadataBase）
// 注意：此 layout 不得呼叫 auth()/cookies()/headers()，否則全部行銷頁會失去靜態預渲染。

import type { Metadata, Viewport } from 'next';
import { siteUrl } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl ?? 'http://localhost:3000'),
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
