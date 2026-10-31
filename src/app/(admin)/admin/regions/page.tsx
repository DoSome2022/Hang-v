'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { formatDateTime } from '@/lib/format';
import {
  btnPrimaryClass,
  cardClass,
  ConfirmDeleteButton,
  ErrorNote,
  tableClass,
  thClass,
  tdClass,
} from '../_components/admin-ui';

export default function RegionsPage() {
  const utils = trpc.useUtils();
  const list = trpc.region.list.useQuery();
  const deleteMutation = trpc.region.delete.useMutation({
    onSuccess: () => {
      void utils.region.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });

  const [query, setQuery] = useState('');
  const filtered = (list.data ?? []).filter(
    (r) => !query.trim() || r.name.includes(query.trim()) || r.slug.includes(query.trim()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/regions/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增區域
        </Link>
        <input
          className="w-[240px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a936f]"
          placeholder="搜尋名稱 / slug"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />
      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">未有區域</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>ID</th>
                  <th className={thClass}>區域名稱</th>
                  <th className={thClass}>Slug</th>
                  <th className={thClass}>建立時間</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className={`${tdClass} font-mono text-xs text-slate-400`}>{r.id}</td>
                    <td className={`${tdClass} font-medium`}>{r.name}</td>
                    <td className={tdClass}>{r.slug}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(r.createdAt)}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/r/${r.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <ExternalLink size={13} /> 查看公開頁
                        </Link>
                        <Link href={`/admin/regions/${r.id}/edit`} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> 編輯
                        </Link>
                        <ConfirmDeleteButton
                          onConfirm={() => deleteMutation.mutate({ id: r.id })}
                          confirmText="確定刪除呢個區域？區域下所有案例、痛點、方案、介紹與申請會一併刪除。"
                        />
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
