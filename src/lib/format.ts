// 日期格式化：tRPC 冇接 transformer，HTTP 回傳的 Date 實際是 ISO 字串，
// 呢度統一容錯處理（string | Date），client/server 共用。

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '—';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(d)} ${hh}:${mm}`;
}

// Date → <input type="date"> 的 "YYYY-MM-DD" 值
export function toDateInputValue(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? formatDate(d) : '';
}

// "YYYY-MM-DD" → Date（UTC 午夜，避免時區偏移）
export function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}
