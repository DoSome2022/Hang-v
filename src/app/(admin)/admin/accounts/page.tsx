'use client';

// 帳目：Quotation / Invoice / Receipt 三 tab，真實 CRUD
import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
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

type Kind = 'quotation' | 'invoice' | 'receipt';

const KINDS: { kind: Kind; label: string }[] = [
  { kind: 'quotation', label: 'Quotation 報價' },
  { kind: 'invoice', label: 'Invoice 發票' },
  { kind: 'receipt', label: 'Receipt 收據' },
];

export default function AccountsPage() {
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<Kind>('quotation');
  const [editing, setEditing] = useState<string | null>(null); // 編輯中的 id；'new' = 新增

  const list = trpc.account.list.useQuery({ kind: tab });
  const createMutation = trpc.account.create.useMutation({
    onSuccess: () => {
      setEditing(null);
      void utils.account.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });
  const updateMutation = trpc.account.update.useMutation({
    onSuccess: () => {
      setEditing(null);
      void utils.account.list.invalidate();
    },
  });
  const deleteMutation = trpc.account.delete.useMutation({
    onSuccess: () => {
      void utils.account.list.invalidate();
      void utils.dashboard.stats.invalidate();
    },
  });


  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {KINDS.map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              onClick={() => {
                setTab(kind);
                setEditing(null);
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${tab === kind ? 'bg-[#0d3b66] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button className={btnPrimaryClass} onClick={() => setEditing('new')}>
          <Plus size={16} /> 新增
        </button>
      </div>

      <ErrorNote message={deleteMutation.isError ? deleteMutation.error.message : null} />

      <div className={cardClass}>
        {list.isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
        ) : (list.data ?? []).length === 0 && editing !== 'new' ? (
          <p className="py-8 text-center text-sm text-slate-400">未有帳目</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>編號</th>
                  <th className={thClass}>公司</th>
                  <th className={thClass}>金額</th>
                  <th className={thClass}>狀態</th>
                  <th className={thClass}>日期</th>
                  <th className={thClass}>操作</th>
                </tr>
              </thead>
              <tbody>
                {/* 新增列 */}
                {editing === 'new' && (
                  <AccountFormRow
                    pending={createMutation.isPending}
                    onSubmit={(values) => createMutation.mutate({ kind: tab, ...values })}
                    onCancel={() => setEditing(null)}
                    error={createMutation.isError ? createMutation.error.message : null}
                  />
                )}
                {(list.data ?? []).map((a) =>
                  editing === a.id ? (
                    <AccountFormRow
                      key={a.id}
                      pending={updateMutation.isPending}
                      initial={a}
                      onSubmit={(values) => updateMutation.mutate({ id: a.id, kind: tab, ...values })}
                      onCancel={() => setEditing(null)}
                      error={updateMutation.isError ? updateMutation.error.message : null}
                    />
                  ) : (
                    <tr key={a.id}>
                      <td className={`${tdClass} font-mono text-xs`}>{a.number}</td>
                      <td className={`${tdClass} font-medium`}>{a.company}</td>
                      <td className={tdClass}>{a.amount.toLocaleString()}</td>
                      <td className={tdClass}>{a.status}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(a.issuedAt ?? a.createdAt)}</td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            onClick={() => setEditing(a.id)}
                          >
                            <Pencil size={13} /> 編輯
                          </button>
                          <ConfirmDeleteButton onConfirm={() => deleteMutation.mutate({ id: a.id })} />
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountFormRow({
  pending,
  initial,
  onSubmit,
  onCancel,
  error,
}: {
  pending: boolean;
  initial?: { company: string; number: string; amount: number; status: string; issuedAt: string | Date | null };
  onSubmit: (values: { company: string; number: string; amount: number; status: string; issuedAt?: string }) => void;
  onCancel: () => void;
  error: string | null;
}) {
  const [company, setCompany] = useState(initial?.company ?? '');
  const [number, setNumber] = useState(initial?.number ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [status, setStatus] = useState(initial?.status ?? '');
  const [issuedAt, setIssuedAt] = useState(initial?.issuedAt ? formatDate(initial.issuedAt) : '');

  return (
    <tr>
      <td colSpan={6} className="border-b border-slate-100 px-3 py-3">
        <form
          className="grid gap-2 md:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            const amt = Number(amount);
            if (!company.trim() || !number.trim() || Number.isNaN(amt) || !status.trim()) return;
            onSubmit({ company: company.trim(), number: number.trim(), amount: amt, status: status.trim(), issuedAt: issuedAt || undefined });
          }}
        >
          <input className={inputClass} placeholder="公司 *" value={company} onChange={(e) => setCompany(e.target.value)} required />
          <input className={inputClass} placeholder="編號 *" value={number} onChange={(e) => setNumber(e.target.value)} required />
          <input className={inputClass} placeholder="金額 *" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input className={inputClass} placeholder="狀態 *" value={status} onChange={(e) => setStatus(e.target.value)} required list="account-statuses" />
          <datalist id="account-statuses">
            <option value="已報" /><option value="待收" /><option value="已收" />
          </datalist>
          <input className={inputClass} type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} aria-label="日期" />
          <div className="flex items-center gap-2">
            <button type="submit" className={btnPrimaryClass} disabled={pending}>
              {pending ? '…' : '儲存'}
            </button>
            <button type="button" className="rounded-md border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50" onClick={onCancel} aria-label="取消">
              <X size={14} />
            </button>
          </div>
          {error && <div className="text-xs text-red-600 md:col-span-6">{error}</div>}
        </form>
      </td>
    </tr>
  );
}
