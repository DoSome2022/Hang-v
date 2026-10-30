'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../_components/admin-ui';

export default function PainPointsNewPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const regions = trpc.region.list.useQuery();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [regionId, setRegionId] = useState('');

  const createMutation = trpc.painPoint.create.useMutation({
    onSuccess: () => {
      void utils.painPoint.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/pain-points');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    createMutation.mutate({ title: title.trim(), description: description.trim() || undefined, regionId });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">新增痛點</h2>
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
      <ErrorNote message={createMutation.isError ? createMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={createMutation.isPending}>
          {createMutation.isPending ? '儲存中…' : '建立'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/pain-points')}>取消</button>
      </div>
    </form>
  );
}
