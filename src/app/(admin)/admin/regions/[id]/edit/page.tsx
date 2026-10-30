'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../../_components/admin-ui';

export default function RegionsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const existing = trpc.region.getById.useQuery({ id });

  if (existing.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  if (existing.isError || !existing.data) {
    return <p className="py-8 text-center text-sm text-slate-500">區域不存在</p>;
  }
  return <EditForm id={id} initial={existing.data} />;
}

function EditForm({ id, initial }: { id: string; initial: { name: string; slug: string } }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);

  const updateMutation = trpc.region.update.useMutation({
    onSuccess: () => {
      void utils.region.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/regions');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id, name: name.trim(), slug: slug.trim() });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">編輯區域</h2>
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
      <ErrorNote message={updateMutation.isError ? updateMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? '儲存中…' : '儲存修改'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/regions')}>取消</button>
      </div>
    </form>
  );
}
