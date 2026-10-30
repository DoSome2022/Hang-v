// (login) group 巢狀 layout：登入頁（獨立於 (admin)，避免 auth 守衛 redirect loop）
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登入｜實瀚科技管理後台',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
