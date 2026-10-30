'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Providers } from '@/app/_components/providers';

export function AdminProviders({ session, children }: { session: Session | null; children: React.ReactNode }) {
  return (
    <SessionProvider session={session}>
      <Providers>{children}</Providers>
    </SessionProvider>
  );
}
