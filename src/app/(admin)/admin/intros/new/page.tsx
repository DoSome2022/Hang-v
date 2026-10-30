'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../_components/admin-ui';

export default function IntrosNewPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const regions = trpc.region.list.useQuery();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [regionId, setRegionId] = useState('');

  const createMutation = trpc.intro.create.useMutation({
    onSuccess: () => {
      void utils.intro.list.invalidate();
      router.push('/admin/intros');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    createMutation.mutate({ title: title.trim(), content: content.trim(), regionId });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">新增服務介紹</h2>
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
      <ErrorNote message={createMutation.isError ? createMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={createMutation.isPending}>
          {createMutation.isPending ? '儲存中…' : '建立'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/intros')}>取消</button>
      </div>
    </form>
  );
}
