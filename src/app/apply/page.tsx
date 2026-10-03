"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/trpc/react";

const STORAGE_KEY = "consult_apply";

export default function ApplyPage() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [painPointIds, setPainPointIds] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // 讀取 localStorage 中點擊的案例
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { caseId?: string; title?: string };
        setCaseId(parsed.caseId ?? null);
        setTitle(parsed.title ?? "");
      } catch {
        setCaseId(null);
      }
    }
  }, []);

  const detail = trpc.case.getPublic.useQuery(
    { id: caseId ?? "" },
    { enabled: !!caseId },
  );

  // A+B：自動帶入該 Case 關聯的痛點（預設全勾，用戶可取消）
  useEffect(() => {
    if (detail.data) {
      setPainPointIds(detail.data.painPoints.map((p) => p.id));
    }
  }, [detail.data]);

  const create = trpc.application.create.useMutation({
    onSuccess: () => {
      localStorage.removeItem(STORAGE_KEY);
      setDone(true);
    },
    onError: (e) => setError(e.message),
  });

  if (done) {
    return (
      <main>
        <h1>申請已送出</h1>
        <a href="/">回到首頁</a>
      </main>
    );
  }

  if (!caseId) {
    return (
      <main>
        <h1>申請</h1>
        <p>請先從案例列表選擇要申請的案例。</p>
        <a href="/">回到首頁</a>
      </main>
    );
  }

  const toggle = (id: string) =>
    setPainPointIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <main>
      <h1>申請：{title}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          create.mutate({
            caseId,
            applicantName: String(fd.get("applicantName") ?? ""),
            applicantContact: String(fd.get("applicantContact") ?? ""),
            note: String(fd.get("note") ?? "") || undefined,
            painPointIds,
          });
        }}
      >
        <div>
          <label>
            姓名 <input name="applicantName" required />
          </label>
        </div>
        <div>
          <label>
            聯絡方式 <input name="applicantContact" required />
          </label>
        </div>
        <div>
          <label>
            備註 <textarea name="note" />
          </label>
        </div>
        <p>痛點（可勾選）：</p>
        {detail.data?.painPoints.map((p) => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={painPointIds.includes(p.id)}
              onChange={() => toggle(p.id)}
            />
            {p.title}
          </label>
        ))}
        <div>
          <button type="submit">送出申請</button>
        </div>
        {error && <p>{error}</p>}
      </form>
    </main>
  );
}
