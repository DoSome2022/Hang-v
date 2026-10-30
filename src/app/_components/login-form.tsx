'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LockKeyhole, User } from 'lucide-react';

const inputClass =
  'mt-[7px] block w-full min-h-[44px] rounded-[6px] border border-[#dfe6d9] bg-white px-3 py-[11px] text-[14px] leading-[1.6] text-navy transition-colors placeholder:text-[#a3ac99] focus:border-green focus:outline-2 focus:outline-offset-1 focus:outline-[#009c6f24]';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const res = await signIn('credentials', { username, password, redirect: false });
      if (res?.error) {
        setError('帳號或密碼錯誤。連續失敗 5 次會暫時鎖定 15 分鐘。');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('登入失敗，請稍後再試。');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a1f33] to-[#0d3b66] p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-[0_24px_60px_-24px_rgb(0_0_0_/_50%)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a936f] text-xl font-bold text-white">H</div>
          <h1 className="text-xl font-bold text-[#0d3b66]">實瀚科技管理後台</h1>
          <p className="mt-1 text-[13px] text-[#8a99a8]">請登入以管理內容與申請</p>
        </div>
        <form onSubmit={onSubmit}>
          <label className="block text-[13px] font-medium text-[#4a5b6a]" htmlFor="login-username">
            帳號
          </label>
          <div className="relative mt-[7px]">
            <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7b2]" />
            <input
              id="login-username"
              className={`${inputClass} pl-9`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <label className="mt-4 block text-[13px] font-medium text-[#4a5b6a]" htmlFor="login-password">
            密碼
          </label>
          <div className="relative mt-[7px]">
            <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7b2]" />
            <input
              id="login-password"
              type="password"
              className={`${inputClass} pl-9`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-[#e8c9c9] bg-[#fdf3f3] p-[10px_14px] text-[13px] text-[#a34747]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 min-h-[46px] w-full rounded-[7px] bg-[#009c6f] px-5 text-[14px] font-medium text-white transition hover:bg-[#007f5b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? '登入中…' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}
