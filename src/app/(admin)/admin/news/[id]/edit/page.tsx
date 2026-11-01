'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { toDateInputValue } from '@/lib/format';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../../_components/admin-ui';

export default function NewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const existing = trpc.news.get.useQuery({ id });

  if (existing.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  if (existing.isError || !existing.data) {
    return <p className="py-8 text-center text-sm text-slate-500">資訊不存在</p>;
  }
  return <EditForm id={id} initial={existing.data} />;
}

type Initial = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  publishedAt: string | Date | null;
  tagNames: string[];
};

function EditForm({ id, initial }: { id: string; initial: Initial }) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [summary, setSummary] = useState(initial.summary);
  const [content, setContent] = useState(initial.content);
  const [category, setCategory] = useState(initial.category);
  const [status, setStatus] = useState<'draft' | 'published'>(initial.status);
  const [publishedAt, setPublishedAt] = useState(toDateInputValue(initial.publishedAt));
  const [tagNames, setTagNames] = useState(initial.tagNames.join(', '));

  const updateMutation = trpc.news.update.useMutation({
    onSuccess: () => {
      void utils.news.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/news');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateMutation.isPending) return;
    updateMutation.mutate({
      id,
      slug: slug.trim(),
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category: category.trim(),
      status,
      publishedAt: publishedAt || undefined,
      tagNames: tagNames.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">編輯資訊</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="標題 *" htmlFor="news-title">
          <input id="news-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        </Field>
        <Field label="Slug（唯一，公開 URL 用，小寫英數與 -）*" htmlFor="news-slug">
          <input id="news-slug" className={inputClass} pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </Field>
      </div>
      <Field label="摘要（列表頁顯示）" htmlFor="news-summary">
        <textarea id="news-summary" className={`${inputClass} min-h-[80px]`} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={2000} />
      </Field>
      <Field label="內容（詳情頁顯示，段落用空行分隔）" htmlFor="news-content">
        <textarea id="news-content" className={`${inputClass} min-h-[140px]`} value={content} onChange={(e) => setContent(e.target.value)} />
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
      <ErrorNote message={updateMutation.isError ? updateMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? '儲存中…' : '儲存修改'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/news')}>取消</button>
      </div>
    </form>
  );
}
