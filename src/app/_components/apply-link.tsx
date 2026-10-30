'use client';

import Link from 'next/link';
import { CONSULT_APPLY_KEY } from '@/lib/storage-keys';

// 「申請」連結：點擊時把案例寫入 localStorage（consult_apply），再導向 /apply
export function ApplyLink({
  caseId,
  title,
  label = '申請',
  className,
}: {
  caseId: string;
  title: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href="/apply"
      className={className}
      onClick={() => {
        try {
          localStorage.setItem(CONSULT_APPLY_KEY, JSON.stringify({ caseId, title }));
        } catch {
          // localStorage 不可用時仍可前往 /apply（會顯示引導）
        }
      }}
    >
      {label}
    </Link>
  );
}
