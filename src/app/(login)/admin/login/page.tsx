// /admin/login — NextAuth 登入（已登入直接進後台）
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { LoginForm } from '@/app/_components/login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/admin');
  }
  return <LoginForm />;
}
