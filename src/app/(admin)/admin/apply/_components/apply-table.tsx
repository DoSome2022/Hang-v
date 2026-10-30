'use client';

// 申請列表共用表格：真實搜尋 + 分頁 + 5 狀態切換（資料來自 tRPC）
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { PAGE_SIZE, STATUS_OPTIONS, type ApplicationStatus } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import { StatusBadge, cardClass, inputClass, tableClass, thClass, tdClass } from '../../_components/admin-ui';

export default function ApplyTable({ statuses }: { statuses?: ApplicationStatus[] }) {
  const utils = trpc.useUtils();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const list = trpc.application.list.useQuery(statuses ? { statuses } : {}, { refetchOnWindowFocus: false });
  const updateMutation = trpc.application.update.useMutation({
    onSuccess: () => {
      void utils.application.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });

  const filtered = useMemo(() => {
    const rows = list.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (a) =>
        a.applicantName.toLowerCase().includes(q) ||
        a.applicantContact.toLowerCase().includes(q) ||
        a.caseTitle.toLowerCase().includes(q),
    );
  }, [list.data, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className={cardClass}>
      {/* 工具列 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-[360px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} mt-0 pl-9`}
            placeholder="搜尋申請人 / 聯絡方式 / 案例"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <span className="text-sm text-slate-500">共 {filtered.length} 筆</span>
      </div>

      {list.isLoading ? (
        <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">未有申請</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>申請人</th>
                  <th className={thClass}>聯絡方式</th>
                  <th className={thClass}>案例</th>
                  <th className={thClass}>痛點快照</th>
                  <th className={thClass}>備註</th>
                  <th className={thClass}>時間</th>
                  <th className={thClass}>狀態</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => (
                  <tr key={a.id}>
                    <td className={`${tdClass} font-medium`}>{a.applicantName}</td>
                    <td className={tdClass}>{a.applicantContact}</td>
                    <td className={`${tdClass} max-w-[160px]`}>{a.caseTitle}</td>
                    <td className={`${tdClass} max-w-[220px]`}>
                      {a.painPointsSnapshot.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {a.painPointsSnapshot.map((p) => (
                            <span key={p.painPointId} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {p.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} max-w-[180px] text-slate-500`}>{a.note ?? '—'}</td>
                    <td className={`${tdClass} whitespace-nowrap text-slate-500`}>{formatDateTime(a.createdAt)}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={a.status} />
                        <select
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#1a936f]"
                          value={a.status}
                          disabled={updateMutation.isPending}
                          onChange={(e) =>
                            updateMutation.mutate({ id: a.id, status: e.target.value as ApplicationStatus })
                          }
                          aria-label="切換狀態"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
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
  );
}
