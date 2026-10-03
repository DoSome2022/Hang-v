"use client";

// localStorage key 統一前綴 consult_
const STORAGE_KEY = "consult_apply";

// 點擊後把案例資料存進 localStorage，再前往申請表
export function ApplyLink({
  caseId,
  title,
  label = "申請",
}: {
  caseId: string;
  title: string;
  label?: string;
}) {
  return (
    <a
      href="/apply"
      onClick={() =>
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ caseId, title }))
      }
    >
      {label}
    </a>
  );
}
