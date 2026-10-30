'use client';

// 案例管理：列表（搜尋/篩選/刪除）+ 新增/編輯入口
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus, Search } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { formatDate } from '@/lib/format';
import {
  btnPrimaryClass,
  cardClass,
  ConfirmDeleteButton,
  ErrorNote,
  inputClass,
  tableClass,
  thClass,
  tdClass,
} from '../_components/admin-ui';

export default function CasesAdminPage() {
  const utils = trpc.useUtils();
  const [query, setQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const list = trpc.case.list.useQuery();
  const deleteMutation = trpc.case.delete.useMutation({
    onSuccess: () => {
      void utils.case.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const c of list.data ?? []) for (const t of c.tagNames) set.add(t);
    return [...set].sort();
  }, [list.data]);

  const filtered = useMemo(() => {
    const rows = list.data ?? [];
    const q = query.trim().toLowerCase();
    return rows.filter((c) => {
      const matchQuery = !q || c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
      const matchTag = !filterTag || c.tagNames.includes(filterTag);
      return matchQuery && matchTag;
    });
  }, [list.data, query, filterTag]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/cases/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增案例
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} mt-0 w-[240px] pl-9`}
              placeholder="搜尋標題 / slug / 分類"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className={`${inputClass} mt-0 w-[160px]`} value={filterTag} onChange={(e) => setFilterTag(e.target.value)} aria-label="依標籤篩選">
            <option value="">全部標籤</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />

      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">未有案例</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>標題</th>
                  <th className={thClass}>Slug</th>
                  <th className={thClass}>分類</th>
                  <th className={thClass}>標籤</th>
                  <th className={thClass}>發佈日期</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className={`${tdClass} font-medium`}>{c.title}</td>
                    <td className={tdClass}>
                      <Link href={`/cases/${c.slug}`} target="_blank" className="inline-flex items-center gap-1 text-[#1a936f] hover:underline">
                        {c.slug} <ExternalLink size={12} />
                      </Link>
                    </td>
                    <td className={tdClass}>{c.category || '—'}</td>
                    <td className={`${tdClass} max-w-[220px]`}>
                      {c.tagNames.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {c.tagNames.map((t) => (
                            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDate(c.publishedAt)}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/cases/${c.id}/edit`} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> 編輯
                        </Link>
                        <ConfirmDeleteButton
                          onConfirm={() => deleteMutation.mutate({ id: c.id })}
                          confirmText="確定刪除呢個案例？注意：此案例的所有申請紀錄會一併刪除。"
                        >
                          <TrashIcon /> 刪除
                        </ConfirmDeleteButton>
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

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
