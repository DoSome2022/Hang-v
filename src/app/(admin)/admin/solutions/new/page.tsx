'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { GroupedTagPicker } from '../../_components/tag-picker';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../_components/admin-ui';

export default function SolutionsNewPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const painPoints = trpc.painPoint.list.useQuery();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [painPointIds, setPainPointIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);

  const createMutation = trpc.solution.create.useMutation({
    onSuccess: () => {
      void utils.solution.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/solutions');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    createMutation.mutate({ title: title.trim(), description: description.trim() || undefined, painPointIds, tagIds });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">新增方案</h2>
      <Field label="標題 *" htmlFor="sol-title">
        <input id="sol-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </Field>
      <Field label="描述" htmlFor="sol-desc">
        <textarea id="sol-desc" className={`${inputClass} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
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
      <Field label="標籤（行業 / 痛點 / 對象）">
        <GroupedTagPicker
          selectedIds={tagIds}
          onToggle={(tagId) =>
            setTagIds((prev) => (prev.includes(tagId) ? prev.filter((x) => x !== tagId) : [...prev, tagId]))
          }
        />
      </Field>
      <ErrorNote message={createMutation.isError ? createMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={createMutation.isPending}>
          {createMutation.isPending ? '儲存中…' : '建立'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/solutions')}>取消</button>
      </div>
    </form>
  );
}
