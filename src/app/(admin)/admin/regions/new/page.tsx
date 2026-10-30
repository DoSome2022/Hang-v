'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../_components/admin-ui';

export default function RegionsNewPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const createMutation = trpc.region.create.useMutation({
    onSuccess: () => {
      void utils.region.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/regions');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    createMutation.mutate({ name: name.trim(), slug: slug.trim() });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">新增區域</h2>
      <Field label="名稱 *" htmlFor="region-name">
        <input id="region-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
      </Field>
      <Field label="Slug（唯一，小寫英數與 -）*" htmlFor="region-slug">
        <input
          id="region-slug"
          className={inputClass}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          pattern="[a-z0-9-]+"
          title="只可用小寫英數與 -"
        />
      </Field>
      <ErrorNote message={createMutation.isError ? createMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={createMutation.isPending}>
          {createMutation.isPending ? '儲存中…' : '建立'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/regions')}>取消</button>
      </div>
    </form>
  );
}
