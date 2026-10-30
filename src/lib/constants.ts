// 申請狀態（與 prisma ApplicationStatus enum 一致）：
// value 用 enum value 傳 API，label 只做顯示。

export const APPLICATION_STATUS_META = {
  pending: { label: '申請中', variant: 'gray' },
  quoted: { label: '報左價', variant: 'blue' },
  developing: { label: '開發中', variant: 'orange' },
  completed: { label: '已完成', variant: 'green' },
  cancelled: { label: '取消', variant: 'red' },
} as const;

export type ApplicationStatus = keyof typeof APPLICATION_STATUS_META;

export const APPLICATION_STATUSES = Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[];

export const PENDING_STATUSES: ApplicationStatus[] = ['pending'];
export const PROCESSING_STATUSES: ApplicationStatus[] = ['quoted', 'developing'];

export const STATUS_OPTIONS = APPLICATION_STATUSES.map((value) => ({
  value,
  label: APPLICATION_STATUS_META[value].label,
}));

export const PAGE_SIZE = 5;
