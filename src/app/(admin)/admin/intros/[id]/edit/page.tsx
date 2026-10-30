'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../../_components/admin-ui';

export default function IntrosEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const existing = trpc.intro.get.useQuery({ id });

  if (existing.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  if (existing.isError || !existing.data) {
    return <p className="py-8 text-center text-sm text-slate-500">服務介紹不存在</p>;
  }
  return <EditForm id={id} initial={existing.data} />;
}

function EditForm({ id, initial }: { id: string; initial: { title: string; content: string; regionId: string } }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const regions = trpc.region.list.useQuery();

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [regionId, setRegionId] = useState(initial.regionId);

  const updateMutation = trpc.intro.update.useMutation({
    onSuccess: () => {
      void utils.intro.list.invalidate();
      router.push('/admin/intros');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id, title: title.trim(), content: content.trim(), regionId });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">編輯服務介紹</h2>
      <Field label="標題 *" htmlFor="intro-title">
        <input id="intro-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </Field>
      <Field label="內容 *" htmlFor="intro-content">
        <textarea id="intro-content" className={`${inputClass} min-h-[140px]`} value={content} onChange={(e) => setContent(e.target.value)} required />
      </Field>
      <Field label="區域 *" htmlFor="intro-region">
        <select id="intro-region" className={inputClass} value={regionId} onChange={(e) => setRegionId(e.target.value)} required>
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
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/intros')}>取消</button>
      </div>
    </form>
  );
}
