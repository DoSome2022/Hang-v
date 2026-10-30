'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../_components/admin-ui';

export default function NewsNewPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [tagNames, setTagNames] = useState('');

  const createMutation = trpc.news.create.useMutation({
    onSuccess: () => {
      void utils.news.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/news');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    createMutation.mutate({
      title: title.trim(),
      summary: summary.trim(),
      category: category.trim(),
      status,
      publishedAt: publishedAt || undefined,
      tagNames: tagNames.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">新增資訊</h2>
      <Field label="標題 *" htmlFor="news-title">
        <input id="news-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </Field>
      <Field label="摘要" htmlFor="news-summary">
        <textarea id="news-summary" className={`${inputClass} min-h-[100px]`} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={2000} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="分類" htmlFor="news-category">
          <input id="news-category" className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={120} />
        </Field>
        <Field label="日期" htmlFor="news-date">
          <input id="news-date" type="date" className={inputClass} value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        </Field>
      </div>
      <Field label="狀態" htmlFor="news-status">
        <select id="news-status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
          <option value="draft">草稿</option>
          <option value="published">已發佈</option>
        </select>
      </Field>
      <Field label="標籤（以逗號分隔）" htmlFor="news-tags">
        <input id="news-tags" className={inputClass} value={tagNames} onChange={(e) => setTagNames(e.target.value)} placeholder="科技／IT, 中小企" />
      </Field>
      <ErrorNote message={createMutation.isError ? createMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={createMutation.isPending}>
          {createMutation.isPending ? '儲存中…' : '建立'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/news')}>取消</button>
      </div>
    </form>
  );
}
