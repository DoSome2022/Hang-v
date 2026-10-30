'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../../_components/admin-ui';

export default function PainPointsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const existing = trpc.painPoint.get.useQuery({ id });

  if (existing.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  if (existing.isError || !existing.data) {
    return <p className="py-8 text-center text-sm text-slate-500">痛點不存在</p>;
  }
  return <EditForm id={id} initial={existing.data} />;
}

function EditForm({ id, initial }: { id: string; initial: { title: string; description: string | null; regionId: string } }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const regions = trpc.region.list.useQuery();

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? '');
  const [regionId, setRegionId] = useState(initial.regionId);

  const updateMutation = trpc.painPoint.update.useMutation({
    onSuccess: () => {
      void utils.painPoint.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/pain-points');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id, title: title.trim(), description: description.trim() || undefined, regionId });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">編輯痛點</h2>
      <Field label="標題 *" htmlFor="pp-title">
        <input id="pp-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </Field>
      <Field label="描述" htmlFor="pp-desc">
        <textarea id="pp-desc" className={`${inputClass} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="區域 *" htmlFor="pp-region">
        <select id="pp-region" className={inputClass} value={regionId} onChange={(e) => setRegionId(e.target.value)} required>
          <option value="">選擇區域</option>
          {(regions.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </Field>
      <ErrorNote message={updateMutation.isError ? updateMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? '儲存中…' : '儲存修改'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/pain-points')}>取消</button>
      </div>
    </form>
  );
}
