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

export default function SolutionsPage() {
  const utils = trpc.useUtils();
  const list = trpc.solution.list.useQuery();
  const painPoints = trpc.painPoint.list.useQuery();
  const tagGroups = trpc.tag.groupList.useQuery();
  const deleteMutation = trpc.solution.delete.useMutation({
    onSuccess: () => {
      void utils.solution.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });

  const painPointName = (id: string) => painPoints.data?.find((p) => p.id === id)?.title ?? id;
  const tagName = (id: string) => (tagGroups.data ?? []).flatMap((g) => g.tags).find((t) => t.id === id)?.name ?? id;

  const [query, setQuery] = useState('');
  const filtered = (list.data ?? []).filter((s) => !query.trim() || s.title.includes(query.trim()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/solutions/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增方案
        </Link>
        <input
          className="w-[240px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a936f]"
          placeholder="搜尋方案"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />
      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">未有方案</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>標題</th>
                  <th className={thClass}>描述</th>
                  <th className={thClass}>相關痛點</th>
                  <th className={thClass}>標籤</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className={`${tdClass} font-medium`}>{s.title}</td>
                    <td className={`${tdClass} max-w-[320px] text-slate-500`}>{s.description ?? '—'}</td>
                    <td className={`${tdClass} max-w-[240px]`}>
                      {s.painPointIds.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.painPointIds.map((id) => (
                            <span key={id} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{painPointName(id)}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} max-w-[200px]`}>
                      {s.tagIds.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.tagIds.map((id) => (
                            <span key={id} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{tagName(id)}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/solutions/${s.id}/edit`} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> 編輯
                        </Link>
                        <ConfirmDeleteButton
                          onConfirm={() => deleteMutation.mutate({ id: s.id })}
                          confirmText="確定刪除呢個方案？已關聯的案例會失去此方案。"
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
