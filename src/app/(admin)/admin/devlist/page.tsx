'use client';

// 開發清單：真實資料 + 剩餘天數（依 delivery 計算）
import Link from 'next/link';
import { Plus } from 'lucide-react';
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

function getDayCount(value: string | Date | null): number | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export default function DevListPage() {
  const utils = trpc.useUtils();
  const list = trpc.dev.list.useQuery();
  const deleteMutation = trpc.dev.delete.useMutation({
    onSuccess: () => {
      void utils.dev.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/devlist/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增專案
        </Link>
      </div>
      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />
      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : (list.data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">未有開發專案</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>專案</th>
                  <th className={thClass}>客戶</th>
                  <th className={thClass}>狀態</th>
                  <th className={thClass}>交付日</th>
                  <th className={thClass}>倒數</th>
                  <th className={thClass}>保養至</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {(list.data ?? []).map((d) => {
                  const days = getDayCount(d.delivery);
                  return (
                    <tr key={d.id}>
                      <td className={tdClass}>
                        <Link href={`/admin/devlist/${d.id}`} className="font-medium text-[#1a936f] hover:underline">
                          {d.name}
                        </Link>
                      </td>
                      <td className={tdClass}>{d.client}</td>
                      <td className={tdClass}>{d.status || '—'}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(d.delivery)}</td>
                      <td className={tdClass}>
                        {days === null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className={`font-semibold ${days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {days < 0 ? `逾期 ${-days} 天` : `剩 ${days} 天`}
                          </span>
                        )}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(d.warranty)}</td>
                      <td className={tdClass}>
                        <ConfirmDeleteButton onConfirm={() => deleteMutation.mutate({ id: d.id })} confirmText="確定刪除呢個開發專案？" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
