// /apply 巢狀 layout：metadata + tRPC Providers（只此動態頁需要 client tRPC）
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { Providers } from '@/app/_components/providers';

export const metadata: Metadata = pageMetadata(
  '申請合作',
  '選擇你想解決的痛點，提交申請。實瀚科技會按你的現況與需求跟進。',
  '/apply',
);

export default function ApplyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Providers>{children}</Providers>;
}
