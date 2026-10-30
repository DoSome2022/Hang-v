'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import { trpc } from '@/trpc/react';
import {
  btnPrimaryClass,
  cardClass,
  ConfirmDeleteButton,
  ErrorNote,
  tableClass,
  thClass,
  tdClass,
} from '../_components/admin-ui';

export default function PainPointsPage() {
  const utils = trpc.useUtils();
  const list = trpc.painPoint.list.useQuery();
  const regions = trpc.region.list.useQuery();
  const deleteMutation = trpc.painPoint.delete.useMutation({
    onSuccess: () => {
      void utils.painPoint.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });

  const regionName = (id: string) => regions.data?.find((r) => r.id === id)?.name ?? id;

  const [query, setQuery] = useState('');
  const filtered = (list.data ?? []).filter((p) => !query.trim() || p.title.includes(query.trim()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/pain-points/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增痛點
        </Link>
        <input
          className="w-[240px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a936f]"
          placeholder="搜尋痛點"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />
      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">未有痛點</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>標題</th>
                  <th className={thClass}>描述</th>
                  <th className={thClass}>區域</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className={`${tdClass} font-medium`}>{p.title}</td>
                    <td className={`${tdClass} max-w-[360px] text-slate-500`}>{p.description ?? '—'}</td>
                    <td className={tdClass}>{regionName(p.regionId)}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/pain-points/${p.id}/edit`} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> 編輯
                        </Link>
                        <ConfirmDeleteButton
                          onConfirm={() => deleteMutation.mutate({ id: p.id })}
                          confirmText="確定刪除呢個痛點？已關聯的案例會失去此痛點。"
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
