'use client';

// 服務介紹管理
import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
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

export default function IntrosPage() {
  const utils = trpc.useUtils();
  const list = trpc.intro.list.useQuery();
  const regions = trpc.region.list.useQuery();
  const deleteMutation = trpc.intro.delete.useMutation({
    onSuccess: () => void utils.intro.list.invalidate(),
  });

  const regionName = (id: string) => regions.data?.find((r) => r.id === id)?.name ?? id;

  const [query, setQuery] = useState('');
  const filtered = (list.data ?? []).filter((i) => !query.trim() || i.title.includes(query.trim()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/intros/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增服務介紹
        </Link>
        <input
          className="w-[240px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a936f]"
          placeholder="搜尋標題"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />
      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">未有服務介紹</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>標題</th>
                  <th className={thClass}>內容</th>
                  <th className={thClass}>區域</th>
                  <th className={thClass}>更新時間</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td className={`${tdClass} font-medium`}>{i.title}</td>
                    <td className={`${tdClass} max-w-[320px]`}>{i.content}</td>
                    <td className={tdClass}>{regionName(i.regionId)}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDateTime(i.updatedAt)}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/intros/${i.id}/edit`} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                          <Pencil size={13} /> 編輯
                        </Link>
                        <ConfirmDeleteButton onConfirm={() => deleteMutation.mutate({ id: i.id })} />
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
