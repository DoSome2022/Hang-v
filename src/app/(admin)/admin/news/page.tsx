'use client';

// 最新資訊列表：半自動搜尋（建立日期/標題/內容/標籤，debounce）+ 排列順序 + 分頁
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Search } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { PAGE_SIZE } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { useDebouncedValue } from '@/lib/use-debounced-value';
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

type SortKey = 'created-desc' | 'created-asc' | 'tag-asc' | 'tag-desc';

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
  const debouncedQuery = useDebouncedValue(query, 250);
  const [sort, setSort] = useState<SortKey>('created-desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const rows = list.data ?? [];
    const q = debouncedQuery.trim().toLowerCase();
    const qDate = debouncedQuery.trim();
    const matched = q
      ? rows.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tagNames.some((t) => t.toLowerCase().includes(q)) ||
            formatDate(n.createdAt).includes(qDate) ||
            formatDate(n.publishedAt).includes(qDate),
        )
      : rows;
    const tagKey = (n: (typeof rows)[number]) => n.tagNames.join('、');
    return [...matched].sort((a, b) => {
      switch (sort) {
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'tag-asc':
          return tagKey(a).localeCompare(tagKey(b), 'zh-Hant');
        case 'tag-desc':
          return tagKey(b).localeCompare(tagKey(a), 'zh-Hant');
        default: // created-desc
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [list.data, debouncedQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/news/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增資訊
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-[280px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className={`${inputClass} mt-0 pl-9`}
              placeholder="搜尋標題 / 內容 / 標籤 / 日期"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1a936f]"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              setPage(1);
            }}
            aria-label="排列順序"
          >
            <option value="created-desc">建立日期（新 → 舊）</option>
            <option value="created-asc">建立日期（舊 → 新）</option>
            <option value="tag-asc">標籤（A → Z）</option>
            <option value="tag-desc">標籤（Z → A）</option>
          </select>
        </div>
      </div>
      <div className="text-sm text-slate-500">共 {filtered.length} 筆</div>
      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />
      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {debouncedQuery.trim() ? '搵唔到符合嘅資訊' : '未有資訊'}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>標題</th>
                    <th className={thClass}>分類</th>
                    <th className={thClass}>標籤</th>
                    <th className={thClass}>發佈日期</th>
                    <th className={thClass}>建立日期</th>
                    <th className={thClass}>狀態</th>
                    <th className={thClass}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((n) => (
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
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(n.createdAt)}</td>
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

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>第 {safePage} / {totalPages} 頁</span>
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                  >
                    上一頁
                  </button>
                  <button
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                  >
                    下一頁
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
