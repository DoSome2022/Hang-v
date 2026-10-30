// (admin) group 巢狀 layout：NextAuth 守衛 + admin metadata + Providers
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { AdminProviders } from '@/app/_components/admin-providers';

export const metadata: Metadata = {
  title: 'Hangs Tech Admin｜實瀚科技管理後台',
  description: '實瀚科技內容與申請管理後台',
  robots: { index: false, follow: false },
};

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }
  return <AdminProviders session={session}>{children}</AdminProviders>;
}
