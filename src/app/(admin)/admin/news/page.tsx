'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { formatDate } from '@/lib/format';
import {
  btnPrimaryClass,
  cardClass,
  ConfirmDeleteButton,
  ErrorNote,
  tableClass,
  thClass,
  tdClass,
} from '../_components/admin-ui';

export default function NewsPage() {
  const utils = trpc.useUtils();
  const list = trpc.news.list.useQuery();
  const deleteMutation = trpc.news.delete.useMutation({
    onSuccess: () => {
      void utils.news.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });

  const [query, setQuery] = useState('');
  const filtered = (list.data ?? []).filter(
    (n) => !query.trim() || n.title.includes(query.trim()) || n.category.includes(query.trim()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/news/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增資訊
        </Link>
        <input
          className="w-[240px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a936f]"
          placeholder="搜尋標題 / 分類"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />
      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">未有資訊</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>標題</th>
                  <th className={thClass}>分類</th>
                  <th className={thClass}>標籤</th>
                  <th className={thClass}>日期</th>
                  <th className={thClass}>狀態</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr key={n.id}>
                    <td className={`${tdClass} font-medium`}>{n.title}</td>
                    <td className={tdClass}>{n.category || '—'}</td>
                    <td className={`${tdClass} max-w-[200px]`}>
                      {n.tagNames.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {n.tagNames.map((t) => (
                            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDate(n.publishedAt)}</td>
                    <td className={tdClass}>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${n.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {n.status === 'published' ? '已發佈' : '草稿'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/news/${n.id}/edit`} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> 編輯
                        </Link>
                        <ConfirmDeleteButton onConfirm={() => deleteMutation.mutate({ id: n.id })} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
