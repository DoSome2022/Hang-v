'use client';

// 申請頁：讀 localStorage（consult_apply {caseId,title}）→ 案例痛點勾選 → tRPC application.create
// 行銷風格（沿用前台 containerClass/sectionLabelClass 等設計語言）
// 表單放在 ApplyForm 子元件：痛點資料到齊先掛載，用 useState 初始值，避免 effect setState。

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { useStoredApply } from '@/lib/stored-apply';
import { CONSULT_APPLY_KEY } from '@/lib/storage-keys';
import { containerClass, sectionLabelClass, sectionLabelDotClass, buttonClass, buttonPrimaryClass } from '@/lib/ui';

const inputClass =
  'w-full rounded-[7px] border border-[#dfe5e1] bg-white p-[11px_14px] text-[14px] outline-none transition focus:border-green focus:ring-2 focus:ring-[rgb(0_156_111_/_12%)]';

export default function ApplyPage() {
  const apply = useStoredApply();
  const [submitted, setSubmitted] = useState(false);

  const detail = trpc.case.getPublic.useQuery({ id: apply?.caseId ?? '' }, { enabled: Boolean(apply?.caseId) });

  // —— 成功狀態 ——
  if (submitted) {
    return (
      <main id="main">
        <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_78%_40%,#f1f7ea_0,transparent_55%),#fff]">
          <div className={`${containerClass} pt-[30px] pb-[54px] max-[700px]:pt-[26px] max-[700px]:pb-11`}>
            <p className={sectionLabelClass}><span className={sectionLabelDotClass} />APPLICATION RECEIVED</p>
            <h1 className="mt-[20px] max-w-[840px] text-[clamp(34px,3.6vw,52px)] font-bold leading-[1.35] tracking-[-1.4px] max-[700px]:text-[clamp(28px,7.5vw,38px)]">
              申請已送出。
            </h1>
            <p className="mt-6 max-w-[640px] text-[14px] leading-[2.05] text-[#738266]">
              我哋會按你嘅現況同需要盡快跟進。想繼續了解其他案例，可以返去案例列表。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cases" className={`${buttonClass} ${buttonPrimaryClass} min-h-[45px] px-5 text-[12px]`}>
                瀏覽更多案例 <ArrowUpRight size={15} />
              </Link>
              <Link href="/" className={`${buttonClass} min-h-[45px] border-[#dfe5e1] bg-white px-5 text-[12px]`}>
                回到首頁
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // —— 無案例（直接開 /apply 或 localStorage 失效） ——
  if (!apply) {
    return (
      <main id="main">
        <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_78%_40%,#f1f7ea_0,transparent_55%),#fff]">
          <div className={`${containerClass} pt-[30px] pb-[54px] max-[700px]:pt-[26px] max-[700px]:pb-11`}>
            <p className={sectionLabelClass}><span className={sectionLabelDotClass} />APPLICATION</p>
            <h1 className="mt-[20px] max-w-[840px] text-[clamp(34px,3.6vw,52px)] font-bold leading-[1.35] tracking-[-1.4px] max-[700px]:text-[clamp(28px,7.5vw,38px)]">
              請先選擇案例。
            </h1>
            <p className="mt-6 max-w-[640px] text-[14px] leading-[2.05] text-[#738266]">
              申請流程由案例開始：喺案例列表揀一個你想了解嘅案例，再按「申請」，就可以填寫申請表。
            </p>
            <div className="mt-8">
              <Link href="/cases" className={`${buttonClass} ${buttonPrimaryClass} min-h-[45px] px-5 text-[12px]`}>
                前往真實案例 <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const caseMissing = detail.isFetched && !detail.data;

  return (
    <main id="main">
      <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_78%_40%,#f1f7ea_0,transparent_55%),#fff]">
        <div className={`${containerClass} pt-[30px] pb-[54px] max-[700px]:pt-[26px] max-[700px]:pb-11`}>
          <nav className="flex items-center gap-[11px] text-[12px] text-[#8c9686]" aria-label="麵包屑導覽">
            <Link href="/" className="hover:text-green-dark">首頁</Link>
            <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
            <Link href="/cases" className="hover:text-green-dark">真實案例</Link>
            <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
            <span aria-current="page" className="text-[#55694b]">申請合作</span>
          </nav>
          <p className={sectionLabelClass + ' mt-[28px]'}><span className={sectionLabelDotClass} />APPLICATION</p>
          <h1 className="mt-[20px] max-w-[840px] text-[clamp(34px,3.6vw,52px)] font-bold leading-[1.35] tracking-[-1.4px] max-[700px]:text-[clamp(28px,7.5vw,38px)]">
            申請合作
          </h1>
          <p className="mt-6 max-w-[640px] text-[14px] leading-[2.05] text-[#738266]">
            勾選你想解決嘅痛點，填低聯絡方式。我哋收到申請後會按你嘅現況跟進。
          </p>
        </div>
      </section>

      <section className="py-[64px] max-[1100px]:py-12">
        <div className={`${containerClass} max-w-[760px]`}>
          {caseMissing ? (
            <div className="rounded-xl border border-[#e7eddf] bg-white p-8 text-center">
              <h2 className="text-[20px] font-semibold">案例已不存在</h2>
              <p className="mt-3 text-[13px] leading-[2] text-[#7f8d72]">呢個案例可能已被移除，請重新選擇。</p>
              <Link href="/cases" className={`${buttonClass} ${buttonPrimaryClass} mt-6 min-h-[45px] px-5 text-[12px]`}>
                前往真實案例
              </Link>
            </div>
          ) : !detail.data ? (
            <p className="py-8 text-center text-[13px] text-[#8e9a81]">載入案例中…</p>
          ) : (
            <ApplyForm caseId={apply.caseId} caseTitle={detail.data.title} painPoints={detail.data.painPoints} onSubmitted={() => setSubmitted(true)} />
          )}
        </div>
      </section>
    </main>
  );
}

function ApplyForm({
  caseId,
  caseTitle,
  painPoints,
  onSubmitted,
}: {
  caseId: string;
  caseTitle: string;
  painPoints: { id: string; title: string }[];
  onSubmitted: () => void;
}) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  // 痛點預設全選（掛載時以 useState 初始值載入）
  const [selected, setSelected] = useState<string[]>(() => painPoints.map((p) => p.id));

  const createApplication = trpc.application.create.useMutation({
    onSuccess: () => {
      try {
        localStorage.removeItem(CONSULT_APPLY_KEY);
      } catch {
        // 忽略
      }
      onSubmitted();
    },
  });

  const togglePainPoint = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createApplication.isPending) return;
    createApplication.mutate({
      caseId,
      applicantName: name.trim(),
      applicantContact: contact.trim(),
      note: note.trim() || undefined,
      painPointIds: selected,
    });
  };

  return (
    <>
      {/* 案例卡 */}
      <div className="rounded-xl border border-[#e1e9d8] bg-[#fbfdf6] p-[24px_28px]">
        <span className="font-[Arial,sans-serif] text-[12px] tracking-[1.4px] text-[#8b9b7c]">申請案例</span>
        <strong className="mt-2 block text-[22px] font-bold tracking-[-0.4px]">{caseTitle}</strong>
      </div>

      <form onSubmit={onSubmit} className="mt-8">
        {/* 痛點勾選 */}
        <fieldset className="border-0 p-0">
          <legend className="mb-4 text-[16px] font-semibold">你想解決嘅痛點（可多選）</legend>
          {painPoints.length === 0 && (
            <p className="text-[13px] text-[#8e9a81]">呢個案例暫時冇可勾選嘅痛點。</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {painPoints.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-[13px_16px] text-[13px] transition ${
                  selected.includes(p.id) ? 'border-green bg-[#f0f7ec] text-[#3f5a38]' : 'border-[#e2e8dd] bg-white hover:border-[#c9dab8]'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-[16px] w-[16px] accent-[#009c6f]"
                  checked={selected.includes(p.id)}
                  onChange={() => togglePainPoint(p.id)}
                />
                {p.title}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 聯絡資料 */}
        <div className="mt-10 grid gap-5">
          <div>
            <label htmlFor="apply-name" className="mb-2 block text-[14px] font-medium">申請人名稱 *</label>
            <input
              id="apply-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              placeholder="點稱呼你？"
            />
          </div>
          <div>
            <label htmlFor="apply-contact" className="mb-2 block text-[14px] font-medium">聯絡方式 *</label>
            <input
              id="apply-contact"
              className={inputClass}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={180}
              required
              placeholder="電郵或電話"
            />
          </div>
          <div>
            <label htmlFor="apply-note" className="mb-2 block text-[14px] font-medium">備註</label>
            <textarea
              id="apply-note"
              className={`${inputClass} min-h-[110px] resize-y`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
              placeholder="補充你嘅現況（選填）"
            />
          </div>
        </div>

        {createApplication.isError && (
          <p role="alert" className="mt-5 rounded-lg border border-[#e8c9c9] bg-[#fdf3f3] p-[12px_16px] text-[13px] text-[#a34747]">
            {createApplication.error.message || '送出失敗，請稍後再試。'}
          </p>
        )}

        <button
          type="submit"
          disabled={createApplication.isPending}
          className={`${buttonClass} ${buttonPrimaryClass} mt-8 min-h-[49px] w-full px-6 text-[14px] disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {createApplication.isPending ? '送出中…' : '提交申請'}
        </button>
        <p className="mt-4 text-center text-[12px] text-[#8e9a81]">
          提交即代表你同意我哋按私隱政策處理你嘅聯絡資料。請勿附上機密資料。
        </p>
      </form>
    </>
  );
}
