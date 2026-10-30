'use client';

import Link from 'next/link';
import Image from 'next/image';
// Logo 放喺 repo root 的 public/image/（Docker standalone 會打包）
const logo = '/image/HangsLogo.png';

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check, X, LockKeyhole, CircleCheck, Copy } from 'lucide-react';
import { services } from '@/lib/site';


const subscribeToHydration = () => () => {};
const hydratedSnapshot = () => true;
const serverSnapshot = () => false;
export function useHydrated() {
  return useSyncExternalStore(subscribeToHydration, hydratedSnapshot, serverSnapshot);
}

const fieldClass =
  'mt-[7px] block w-full min-h-[42px] rounded-[6px] border border-[#dfe6d9] bg-white px-3 py-[11px] text-[12px] leading-[1.6] text-navy shadow-none transition-colors duration-200 placeholder:text-[#a3ac99] focus:border-green focus:outline-2 focus:outline-offset-1 focus:outline-[#009c6f24] max-[700px]:min-h-[44px] max-[700px]:px-[10px] max-[700px]:py-[10px] max-[700px]:text-[16px] max-[700px]:placeholder:text-[12px]';

const labelClass =
  'block text-[13px] font-medium';

const buttonClass =
  'inline-flex items-center justify-center gap-[23px] min-h-[49px] rounded-[7px] border border-transparent px-[22px] py-[13px] text-[13px] font-medium leading-[1.5] transition-[background,transform,box-shadow] duration-200 [&>svg]:transition-transform [&>svg]:duration-200 hover:[&>svg]:translate-x-0.5 hover:[&>svg]:-translate-y-px';

const buttonPrimaryClass =
  'bg-green text-white shadow-[0_4px_10px_rgb(0_156_111_/_8%)] hover:bg-green-dark hover:shadow-[0_6px_18px_rgb(0_156_111_/_15%)] hover:-translate-y-0.5';

const buttonSecondaryClass =
  'bg-white border-[#dfe5e1] hover:bg-[#f6f9f6] hover:border-[#bccfc0]';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center gap-[11px]" aria-label="實瀚科技首頁">
      {/* <svg
        width={compact ? 32 : 38}
        height={compact ? 32 : 38}
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
        className={compact ? 'max-[700px]:h-[30px] max-[700px]:w-[30px]' : 'max-[700px]:h-[28px] max-[700px]:w-[28px] max-[370px]:h-[26px] max-[370px]:w-[26px]'}
      >
        <path d="M5 5h9v13h16V5h9v34h-9V26H14v13H5z" fill="currentColor" />
        <path d="M14 18h16v8H14z" fill="#a9ce47" />
        <path d="M30 5h9v13h-9z" fill="#009c6f" />
      </svg> */}
      <Image
        src={logo}
        alt="實瀚科技 HANGS TECHNOLOGY Logo"
        width={70}
        height={70}
        style={{ width: '100%', height: 'auto' }}
      />
      <span
        className={`font-[750] leading-[1.4] ${compact ? 'text-[16px] tracking-[2.4px]' : 'text-[20px] tracking-[3px] max-[700px]:text-[16px] max-[700px]:tracking-[2px] max-[370px]:text-[15px] max-[370px]:tracking-[1.3px]'}`}
      >
        HANGS
        <span
          className={`mt-[2px] block font-[Arial,sans-serif] font-semibold ${compact ? 'text-[12px] tracking-[1.8px]' : 'text-[13px] tracking-[1.65px] max-[700px]:tracking-[1.4px]'}`}
        >
          實瀚科技
        </span>
      </span>
    </Link>
  );
}

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = originalOverflow;
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`
        open:animate-modal-enter
        [&::backdrop]:bg-[#1621446b]
        [&::backdrop]:backdrop-blur-[7px]
        /* 核心：grid 置中 */
        grid place-items-center
        w-full h-full
        max-w-none
        p-0
        border-0
        bg-transparent
      `}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // 點擊 backdrop（dialog 本身）才關閉，點內容區不觸發
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 內容卡片：這層才設定寬高、邊框、背景、滾動 */}
      <div
        className={`
          w-[calc(100%-36px)]
          max-h-[calc(100dvh-48px)]
          max-w-[560px]
          overflow-y-auto
          overscroll-contain
          rounded-[18px]
          border border-[#e0e7dc]
          bg-white
          p-[30px]
          text-navy
          shadow-[0_30px_100px_#101d3340]
          max-[700px]:w-[calc(100%-26px)]
          max-[700px]:max-h-[calc(100dvh-28px)]
          max-[700px]:rounded-[13px]
          max-[700px]:p-[23px]
          ${wide ? 'max-w-[665px]' : ''}
        `}
      >
        <div className="mb-[14px] flex items-center justify-between gap-[15px] max-[700px]:mb-[11px]">
          <span className="font-[Arial,sans-serif] text-[13px] font-medium tracking-[1.5px] text-[#859778] max-[700px]:text-[12px] max-[700px]:tracking-[1px]">
            LET’S BUILD SOMETHING BETTER
          </span>
          <button
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-transparent hover:bg-[#edf4ed]"
            aria-label="關閉視窗"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="modal-title" className="text-[27px] leading-[1.5] tracking-[-0.6px] max-[700px]:text-[24px]">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}


type SubmitState =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'success' }
  | { phase: 'error'; message: string };

export function Consultation({
  onClose,
  prefill,
}: {
  onClose: () => void;
  prefill?: { message?: string; service?: string };
}) {
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ phase: 'idle' });
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (summary) summaryRef.current?.focus();
  }, [summary]);

  function buildSummary(data: FormData): string {
    return `實瀚科技｜諮詢需求摘要\n\n稱呼：${String(data.get('name')).trim()}\n公司／團隊：${String(data.get('company')).trim() || '未填寫'}\n電郵：${data.get('email')}\n團隊規模：${data.get('size')}\n感興趣的服務：${data.get('service')}\n\n想解決的問題：\n${String(data.get('message')).trim()}\n\n`;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState.phase === 'submitting') return;
    const data = new FormData(event.currentTarget);
    const baseSummary = buildSummary(data);
    setSubmitState({ phase: 'submitting' });
    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        body: data,
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) {
        setSummary(baseSummary + '此摘要已送出至實瀚科技，排入處理佇列。');
        setSubmitState({ phase: 'success' });
        return;
      }
      const retryAfter = Number(response.headers.get('Retry-After'));
      const minutes = Number.isFinite(retryAfter) ? Math.max(1, Math.ceil(retryAfter / 60)) : 10;
      const message =
        response.status === 429
          ? `送出次數過多，請約 ${minutes} 分鐘後再試。`
          : response.status === 400
            ? '提交資料有誤，請檢查後再試。'
            : '服務暫時無法接收，請稍後再試；你仍可複製摘要。';
      setSummary(baseSummary + '此摘要由前端頁面產生，尚未傳送至實瀚科技。');
      setSubmitState({ phase: 'error', message });
    } catch {
      setSummary(baseSummary + '此摘要由前端頁面產生，尚未傳送至實瀚科技。');
      setSubmitState({ phase: 'error', message: '網絡連線不穩，未能送出；你仍可複製摘要。' });
    }
  }

  function reset() {
    setSummary('');
    setCopied(false);
    setCopyError(false);
    setSubmitState({ phase: 'idle' });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError(false);
    } catch {
      summaryRef.current?.focus();
      summaryRef.current?.select();
      setCopyError(true);
    }
  }

  return (
    <Modal title={summary ? '好的合作，從理解開始。' : '聊聊你的下一步。'} onClose={onClose} wide>
      {!summary ? (
        <>
          <p className="mt-[14px] text-[12px] leading-[2] text-[#7b8573] max-[700px]:text-[13px]">
            不需要先懂技術。告訴我們你想改善的工作，就從那裡開始。
          </p>

          <div className="mt-[18px] flex items-start gap-2 rounded-[6px] border border-[#e6ecd8] bg-[#f4f7ef] px-[13px] py-[11px] text-[12px] leading-[1.8] text-[#7b8e68] max-[700px]:gap-[7px] max-[700px]:px-[10px] max-[700px]:py-[10px]">
            <LockKeyhole size={15} className="mt-[2px]" />
            <span>送出後，內容會傳送至實瀚科技並排入處理佇列；如暫時無法接收，你仍可複製摘要。</span>
          </div>

          <form onSubmit={submit} className="mt-[22px] flex flex-col gap-[17px] max-[700px]:mt-[19px] max-[700px]:gap-[15px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-[17px] max-[700px]:grid-cols-1 max-[700px]:gap-[15px]">
              <label className={labelClass}>
                你的稱呼 <span className="text-green">*</span>
                <input autoComplete="name" name="name" required maxLength={80} pattern=".*\S.*" placeholder="怎樣稱呼你？" className={fieldClass} />
              </label>
              <label className={labelClass}>
                公司／團隊名稱
                <input autoComplete="organization" name="company" maxLength={120} placeholder="一人公司也歡迎" className={fieldClass} />
              </label>
              <label className={labelClass}>
                聯絡電郵 <span className="text-green">*</span>
                <input type="email" autoComplete="email" name="email" required maxLength={180} placeholder="you@company.com" className={fieldClass} />
              </label>
              <label className={labelClass}>
                團隊規模
                <select name="size" defaultValue="一人公司" className={fieldClass}>
                  <option>一人公司</option>
                  <option>2–20 人</option>
                  <option>21–100 人</option>
                  <option>100 人以上</option>
                </select>
              </label>
            </div>

            <label className={labelClass}>
              你感興趣的方向
              <select name="service" defaultValue={prefill?.service ?? '還未確定，想先聽聽建議'} className={fieldClass}>
                <option>還未確定，想先聽聽建議</option>
                {services.map((service) => (
                  <option key={service.id}>{service.title}</option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              目前最想解決甚麼問題？ <span className="text-green">*</span>
              <textarea
                name="message"
                rows={3}
                required
                maxLength={2000}
                defaultValue={prefill?.message}
                placeholder="例如：每天要花很多時間回覆重複查詢，想用 AI 協助處理……"
                className={`${fieldClass} min-h-[100px] resize-y`}
              />
            </label>

            <button type="submit" disabled={submitState.phase === 'submitting'} className={`${buttonClass} ${buttonPrimaryClass} self-start disabled:cursor-wait disabled:opacity-70 max-[700px]:w-full max-[700px]:text-[12px]`}>
              {submitState.phase === 'submitting' ? '正在送出…' : '送出諮詢需求'}
              <ArrowRight size={17} />
            </button>

            <p className="-mt-2 text-[12px] font-normal leading-[1.8] text-[#919d85]">
              送出後會排入處理佇列；如系統暫時不可用，仍可複製摘要備份。
            </p>
          </form>
        </>
      ) : (
        <div className="mt-[20px]">
          {submitState.phase === 'success' ? (
            <div role="status" className="mb-[17px] flex items-center gap-[10px] text-[12px] text-green-dark max-[700px]:text-[13px]">
              <CircleCheck size={22} />
              <span>已接收，排入處理佇列。</span>
            </div>
          ) : submitState.phase === 'error' ? (
            <div role="alert" className="mb-[17px] flex items-center gap-[10px] text-[12px] text-[#b3541e] max-[700px]:text-[13px]">
              <X size={20} />
              <span>{submitState.message}</span>
            </div>
          ) : null}

          <textarea
            ref={summaryRef}
            aria-label="諮詢需求摘要，可選取複製"
            className="min-h-[230px] w-full resize-y rounded-[9px] border border-[#e1e8da] bg-[#f8faf5] p-[17px] text-[12px] leading-[1.9] text-[#647756]"
            readOnly
            value={summary}
            rows={12}
          />

          <div className="mb-3 mt-[18px] flex flex-wrap gap-[10px]">
            <button className={`${buttonClass} ${buttonPrimaryClass} gap-[9px] px-4 text-[12px] max-[700px]:px-[13px] max-[700px]:text-[13px]`} onClick={copy}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? '已複製摘要' : '複製需求摘要'}
            </button>
            <button
              className={`${buttonClass} ${buttonSecondaryClass} gap-[9px] px-4 text-[12px] max-[700px]:px-[13px] max-[700px]:text-[13px]`}
              onClick={reset}
            >
              重新填寫
            </button>
          </div>

          <p className="text-[12px] leading-[1.8] text-[#919d85]">
            {copyError ? '無法自動複製，請選取上方文字並手動複製。' : '複製後可貼到 WhatsApp／電郵備份。'}
          </p>
        </div>
      )}
    </Modal>
  );
}
