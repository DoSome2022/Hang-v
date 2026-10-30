'use client';

// 後台共用 UI：卡片、狀態 badge、表單欄位
import Badge from '@/components/Badge';
import { APPLICATION_STATUS_META, type ApplicationStatus } from '@/lib/constants';

export const cardClass = 'bg-white border border-slate-200 rounded-xl p-4';

export const tableClass = 'w-full text-left text-sm';
export const thClass = 'sticky top-0 border-b border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500';
export const tdClass = 'border-b border-slate-100 px-3 py-3 align-top text-slate-700';

export const btnPrimaryClass =
  'inline-flex items-center gap-2 rounded-md bg-[#0d3b66] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0a2f52] disabled:cursor-not-allowed disabled:opacity-60';
export const btnSecondaryClass =
  'inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50';
export const btnDangerClass =
  'inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50';
export const btnSmallClass =
  'inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50';

export const inputClass =
  'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#1a936f] focus:ring-2 focus:ring-[#1a936f33]';
export const labelClass = 'block text-[13px] font-medium text-slate-600';

export function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass} htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: ApplicationStatus | string }) {
  const meta = APPLICATION_STATUS_META[status as ApplicationStatus];
  const variant = (meta?.variant ?? 'gray') as 'blue' | 'green' | 'orange' | 'purple' | 'gray' | 'cyan' | 'amber' | 'red';
  return <Badge variant={variant}>{meta?.label ?? status}</Badge>;
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
      {message}
    </p>
  );
}

export function ConfirmDeleteButton({
  onConfirm,
  children = '刪除',
  confirmText = '確定刪除？此操作無法復原。',
  disabled = false,
}: {
  onConfirm: () => void;
  children?: React.ReactNode;
  confirmText?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={btnDangerClass}
      disabled={disabled}
      onClick={() => {
        if (window.confirm(confirmText)) onConfirm();
      }}
    >
      {children}
    </button>
  );
}
