'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../../_components/admin-ui';

export default function SolutionsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const existing = trpc.solution.get.useQuery({ id });

  if (existing.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  if (existing.isError || !existing.data) {
    return <p className="py-8 text-center text-sm text-slate-500">方案不存在</p>;
  }
  return <EditForm id={id} initial={existing.data} />;
}

function EditForm({
  id,
  initial,
}: {
  id: string;
  initial: { title: string; description: string | null; regionId: string; painPointIds: string[] };
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const regions = trpc.region.list.useQuery();
  const painPoints = trpc.painPoint.list.useQuery();

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? '');
  const [regionId, setRegionId] = useState(initial.regionId);
  const [painPointIds, setPainPointIds] = useState<string[]>(initial.painPointIds);

  const updateMutation = trpc.solution.update.useMutation({
    onSuccess: () => {
      void utils.solution.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/solutions');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id, title: title.trim(), description: description.trim() || undefined, regionId, painPointIds });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">編輯方案</h2>
      <Field label="標題 *" htmlFor="sol-title">
        <input id="sol-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </Field>
      <Field label="描述" htmlFor="sol-desc">
        <textarea id="sol-desc" className={`${inputClass} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="區域 *" htmlFor="sol-region">
        <select id="sol-region" className={inputClass} value={regionId} onChange={(e) => setRegionId(e.target.value)} required>
          <option value="">選擇區域</option>
          {(regions.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </Field>
      <Field label="相關痛點">
        <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
          {(painPoints.data ?? []).length === 0 && <p className="text-sm text-slate-400">未有痛點</p>}
          {(painPoints.data ?? []).map((p) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#1a936f]"
                checked={painPointIds.includes(p.id)}
                onChange={(e) => setPainPointIds((prev) => (e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)))}
              />
              {p.title}
            </label>
          ))}
        </div>
      </Field>
      <ErrorNote message={updateMutation.isError ? updateMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? '儲存中…' : '儲存修改'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/solutions')}>取消</button>
      </div>
    </form>
  );
}
