'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Modal, useHydrated } from '@/components/shared-ui';
import { useConsultation } from '@/components/site-shell';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Sparkles,
  BrainCircuit,
  Workflow,
  Cloud,
  ShieldCheck,
  Code2,
  LockKeyhole,
  Blocks,
  HeartHandshake,
  MessageSquareText,
  FileText,
  BarChart3,
  Database,
  CircleCheck,
  Command,
  Plus,
  Layers3,
  Globe2,
  Headphones,
  CheckCheck,
  CircleDot,
} from 'lucide-react';
import { faqs, services } from '@/lib/site';
import {
  containerClass,
  sectionClass,
  buttonClass,
  buttonPrimaryClass,
  buttonNavyClass,
  textLinkClass,
  sectionLabelClass,
  sectionLabelDotClass,
  onlineDotClass,
} from '@/lib/ui';

const serviceIcons = { sparkles: Sparkles, brain: BrainCircuit, workflow: Workflow, cloud: Cloud, shield: ShieldCheck };
type Service = (typeof services)[number];
type Audience = 'solo' | 'sme' | 'enterprise';

const audiences: Record<Audience, { label: string; title: string; subtitle: string; tasks: { icon: typeof FileText; name: string; note: string }[]; result: string }> = {
  solo: {
    label: '一人公司',
    title: '你專注創造，AI 處理日常。',
    subtitle: 'YOUR PERSONAL AI TEAM',
    tasks: [
      { icon: MessageSquareText, name: '客戶查詢', note: '整理問題・草擬回覆' },
      { icon: FileText, name: '內容與文件', note: '提取重點・產生草稿' },
      { icon: BarChart3, name: '營運日報', note: '彙整數據・掌握進度' },
    ],
    result: '一個人，也能有一個團隊的可能。',
  },
  sme: {
    label: '中小企業',
    title: '少一點重複，多一點協作。',
    subtitle: 'YOUR CONNECTED WORKSPACE',
    tasks: [
      { icon: Database, name: 'CRM 資料同步', note: '連接系統・減少輸入' },
      { icon: Workflow, name: '跨部門工作流', note: '自動分派・追蹤審批' },
      { icon: BarChart3, name: '業務數據整合', note: '彙整報表・協助決策' },
    ],
    result: '讓工具彼此連接，讓團隊更有默契。',
  },
  enterprise: {
    label: '企業團隊',
    title: '值得信賴，才能放心擴展。',
    subtitle: 'YOUR ENTERPRISE FOUNDATION',
    tasks: [
      { icon: LockKeyhole, name: '資料與存取權限', note: '分級授權・保留紀錄' },
      { icon: Cloud, name: '雲端與部署', note: '持續交付・彈性擴展' },
      { icon: ShieldCheck, name: '監控與維運', note: '觀測狀態・追蹤異常' },
    ],
    result: '從架構到維運，支援下一階段成長。',
  },
};

const serviceIconVariants = [
  'bg-[#f1f6ed] text-[#638443]',
  'bg-[#eaf6ef] text-[#219473]',
  'bg-[#f5f7ea] text-[#8b984b]',
  'bg-[#eef3f6] text-[#688596]',
  'bg-[#f0f1f7] text-[#68759d]',
];

const taskIconVariants = [
  'bg-[#eaf4e6] text-[#759642]',
  'bg-[#e9f3ed] text-[#388c74]',
  'bg-[#ecf0f8] text-[#6c7ba2]',
];

const serviceCardClass =
  'relative flex flex-col overflow-hidden rounded-[10px] border border-[#e4e9e4] bg-white p-[22px_19px_17px] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-[5px] hover:border-[#c0d6bd] hover:shadow-[0_12px_27px_-15px_#193b2626] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,var(--color-green),var(--color-lime))] after:transition-transform after:duration-300 after:content-[""] hover:after:scale-x-100 max-[1500px]:px-[22px] max-[1100px]:p-[18px_13px_15px] max-[900px]:p-[22px]';

function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`${sectionLabelClass} ${light ? 'text-[#afc5bb]' : ''}`}>
      <span className={sectionLabelDotClass} />
      {children}
    </p>
  );
}

function Workspace() {
  const ready = useHydrated();
  const [audience, setAudience] = useState<Audience>('solo');
  const current = audiences[audience];

  return (
    <div className="relative isolate flex h-[520px] items-center justify-center -mr-3 max-[1100px]:origin-center-right max-[1100px]:-ml-5 max-[1100px]:-mr-[10px] max-[1100px]:scale-[0.91] max-[900px]:-ml-[35px] max-[900px]:-mr-[15px] max-[900px]:scale-[0.83] before:absolute before:z-[-2] before:h-[440px] before:w-[440px] before:rounded-full before:bg-[radial-gradient(circle,#e1f0cf_0%,#edf6e8_38%,transparent_69%)] before:opacity-80 before:content-[''] after:absolute after:inset-[35px_-20px] after:z-[-1] after:[background-image:radial-gradient(#b6c1ac_.65px,transparent_.65px)] after:[background-size:20px_20px] after:[mask-image:radial-gradient(ellipse,#0007_0%,transparent_68%)] after:content-['']">
      <div className="absolute z-[-1] h-[460px] w-[460px] -rotate-[27deg] scale-x-[1.1] rounded-full border border-[#dce8d680] max-[1100px]:h-[405px] max-[1100px]:w-[405px]" aria-hidden="true" />
      <div className="absolute z-[-1] h-[330px] w-[540px] -rotate-[35deg] rounded-full border border-[#c9d9c060] max-[1100px]:h-[300px] max-[1100px]:w-[450px]" aria-hidden="true" />
      <div className="absolute left-5 top-[168px] h-2 w-2 rounded-full border-2 border-white bg-lime shadow-[0_0_0_5px_#a9ce4714]" aria-hidden="true" />
      <div className="absolute bottom-[134px] right-[29px] h-[6px] w-[6px] rounded-full border-2 border-white bg-green" aria-hidden="true" />

      <span className="absolute left-[70px] top-[22px] font-[Arial,sans-serif] text-[12px] tracking-[1.8px] text-[#889a87]" aria-hidden="true">
        INTELLIGENCE, CONNECTED.
      </span>

      <div className="relative z-[2] w-[386px] -rotate-2 rounded-[13px] border border-[#e2e9df] bg-white shadow-[0_26px_60px_-20px_#25391b24,0_4px_12px_#25391b05] animate-workspace-enter max-[1100px]:w-[358px] max-[900px]:min-w-[350px]">
        <div className="flex h-12 items-center justify-between border-b border-[#edf0eb] px-5">
          <div className="flex items-center gap-[7px] font-[Arial,sans-serif] text-[12px] font-semibold tracking-[-0.15px]">
            <Command size={18} className="text-green" />
            <span>Hangs workspace</span>
          </div>
          <span className="rounded-[4px] border border-[#e7ece3] p-[2px_6px] text-[13px] text-[#748274]">概念示意</span>
        </div>

        <div className="p-[21px]">
          <div className="flex gap-[2px] rounded-[6px] border border-[#ecefe8] bg-[#f3f5f2] p-[3px]">
            {(Object.keys(audiences) as Audience[]).map((key) => (
              <button
                disabled={!ready}
                key={key}
                aria-pressed={audience === key}
                className={`flex-1 rounded-[4px] bg-transparent p-[6px_4px] text-[12px] text-[#7b847d] transition-all duration-200 hover:text-green-dark ${audience === key ? 'bg-white font-medium text-green-dark shadow-[0_1px_4px_#1621440d]' : ''}`}
                onClick={() => setAudience(key)}
              >
                {audiences[key].label}
              </button>
            ))}
          </div>

          <div aria-live="polite" aria-atomic="true" key={audience} className="animate-appear">
            <p className="mt-[22px] font-[Arial,sans-serif] text-[13px] tracking-[1.5px] text-[#83907e]">{current.subtitle}</p>
            <h3 className="mt-[5px] text-[16px] leading-[1.6] tracking-[-0.3px]">{current.title}</h3>

            <div className="mt-[19px] flex flex-col gap-[9px]">
              {current.tasks.map((task, index) => (
                <div className="flex items-center gap-[11px] rounded-[7px] border border-[#e9ede6] bg-[linear-gradient(120deg,#fff,#fafcf8)] p-[11px]" key={task.name}>
                  <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-[8px] ${taskIconVariants[index] ?? taskIconVariants[0]}`}>
                    <task.icon size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <strong className="block text-[13px] font-medium leading-[1.5]">{task.name}</strong>
                    <small className="mt-[3px] block text-[13px] leading-[1.5] text-[#8c948b]">{task.note}</small>
                  </div>
                  <span className="ml-auto flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#eaf5e8] text-[#73a447]">
                    <Check size={13} />
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-[15px] flex items-center gap-2 rounded-[5px] bg-[#f2f7e9] p-[9px_11px] text-[12px] text-[#66804a]">
              <Sparkles size={15} />
              <span>{current.result}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#edf0eb] px-5 py-[11px] text-[13px] text-[#83907e]">
          <span className="flex items-center gap-[6px]">
            <span className={`${onlineDotClass} h-[4px] w-[4px] shadow-none`} />
            為你的業務而設計
          </span>
          <span className="font-[Arial,sans-serif] text-[12px] tracking-[1px]">HUMAN + AI</span>
        </div>
      </div>

      <span className="absolute bottom-4 right-[46px] font-[Arial,sans-serif] text-[12px] tracking-[1.8px] text-[#889a87]" aria-hidden="true">
        01 / DESIGNED FOR POSSIBILITIES
      </span>
    </div>
  );
}

export default function Home() {
  const ready = useHydrated();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { openConsult } = useConsultation();

  return (
    <>
      <main id="main">
        <section className="relative mx-[10px] overflow-hidden bg-[radial-gradient(ellipse_at_80%_42%,#f1f8ec_0%,#fbfdf9_27%,#fff_56%)]" id="hero" aria-labelledby="hero-title">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center py-6 md:pl-[--logo-offset] md:pl-6 lg:pl-8">
            {/* 文字區：手機置中，平板以上靠左對齊和Logo間距一致 */}
            <div className="relative pb-4 animate-appear text-center md:justify-center ">
              <h1 id="hero-title" className="text-[clamp(2rem,5vw,4vh)] font-[750]">
                少一點繁瑣，
                <br />
                <span className="relative whitespace-nowrap text-green inline-block">
                  多一點可能
                  <span className="text-green">。</span>
                  <svg viewBox="0 0 420 18" preserveAspectRatio="none" aria-hidden="true" className="absolute bottom-[-8px] left-0 h-3 w-[95%] fill-none stroke-lime opacity-70 [stroke-width:5] [stroke-linecap:round]">
                    <path d="M4 12Q203 1 414 10" />
                  </svg>
                </span>
              </h1>
              <p className="mt-[30px] text-[15px] font-normal leading-[2.05] text-[#6a7380]">
                從一人公司到企業團隊，
                <br className="hidden min-[900px]:inline" />
                以 AI、自動化與穩健 IT，把時間還給真正重要的事。
              </p>
              <div className="mt-[30px] flex items-center justify-center  gap-3 max-[1100px]:gap-[15px] max-[900px]:gap-3">
                <Link className={`${buttonClass} ${buttonPrimaryClass} max-[1100px]:gap-[15px] max-[1100px]:px-[17px] max-[1100px]:text-[12px] max-[900px]:gap-3 max-[900px]:px-[14px] max-[900px]:text-[13px]`} href="/services">
                  看看我們的服務
                  <ArrowUpRight size={18} />
                </Link>
              </div>
              <div className="mt-[23px] flex items-center justify-center gap-[19px] text-[12px] text-[#7c8489] max-[900px]:gap-[13px] max-[900px]:text-[12px]">
                <span className="flex items-center gap-[5px]">
                  <Check size={14} className="text-green" />
                  從真實需求出發
                </span>
                <span className="flex items-center gap-[5px]">
                  <Check size={14} className="text-green" />
                  為長遠成長而設
                </span>
              </div>
            </div>
            <div className="hidden md:flex">
              <Workspace />
            </div>
          </div>
          <div className="md:hidden mt-4 flex justify-center">
            <Workspace />
          </div>
        </section>

        <section id="trust" className="border-y border-line bg-white" aria-label="實瀚科技背景">
          <div className={`${containerClass} flex min-h-[125px] items-center justify-between gap-[30px] max-[1500px]:min-h-[132px] max-[1100px]:gap-5 max-[900px]:min-h-0 max-[900px]:grid max-[900px]:grid-cols-3 max-[900px]:gap-x-[10px] max-[900px]:gap-y-[23px] max-[900px]:py-[25px] max-[900px]:text-center`}>
            <p className="text-[14px] font-medium max-[1100px]:text-[12px] max-[900px]:col-span-3 max-[900px]:min-w-0 max-[900px]:text-[12px]">
              懂技術，更懂你的業務。
              <span className="mt-[5px] block text-[12px] font-normal text-[#90968e] max-[900px]:mt-[3px]">以經驗為基礎，讓創新踏實落地。</span>
            </p>
            <div className="flex min-w-[100px] flex-col max-[1100px]:min-w-[78px] max-[900px]:min-w-0 max-[900px]:border-l max-[900px]:border-[#e8ece4] max-[900px]:first:border-l-0">
              <strong className="font-[Arial,sans-serif] text-[31px] font-medium leading-[1.35] tracking-[-1.5px] max-[1100px]:text-[28px] max-[900px]:text-[29px] max-[900px]:tracking-[-1px]">
                15<span className="ml-[3px] text-[23px] text-green max-[900px]:text-[20px]">+</span>
              </strong>
              <span className="mt-[2px] text-[12px] text-[#7e8780] max-[900px]:mt-[5px]">團隊成員年資</span>
            </div>
            <div className="flex min-w-[100px] flex-col max-[1100px]:min-w-[78px] max-[900px]:min-w-0 max-[900px]:border-l max-[900px]:border-[#e8ece4]">
              <strong className="font-[Arial,sans-serif] text-[31px] font-medium leading-[1.35] tracking-[-1.5px] max-[1100px]:text-[28px] max-[900px]:text-[29px] max-[900px]:tracking-[-1px]">
                200<span className="ml-[3px] text-[23px] text-green max-[900px]:text-[20px]">+</span>
              </strong>
              <span className="mt-[2px] text-[12px] text-[#7e8780] max-[900px]:mt-[5px]">企業服務經驗</span>
            </div>
            <div className="flex min-w-[100px] flex-col max-[1100px]:min-w-[78px] max-[900px]:min-w-0 max-[900px]:border-l max-[900px]:border-[#e8ece4]">
              <strong className="font-[Arial,sans-serif] text-[31px] font-medium leading-[1.35] tracking-[-1.5px] max-[1100px]:text-[28px] max-[900px]:text-[29px] max-[900px]:tracking-[-1px]">
                2023
              </strong>
              <span className="mt-[2px] text-[12px] text-[#7e8780] max-[900px]:mt-[5px]">實瀚科技成立</span>
            </div>
            <div className="flex items-center gap-[11px] border-l border-line pl-[28px] text-[#7b8c78] max-[1100px]:pl-[19px] max-[900px]:hidden">
              <Globe2 size={25} strokeWidth={1.3} />
              <span className="text-[12px] leading-[1.9] text-[#82907c]">
                立足香港
                <br />
                <strong className="text-[12px] font-medium text-[#54654c]">連接更多可能</strong>
              </span>
            </div>
          </div>
        </section>

        <section className={`${sectionClass} pb-[81px]`} id="services" aria-labelledby="services-title">
          <div className={containerClass}>
            <div className="mb-[42px] flex items-end justify-between gap-[35px]">
              <div>
                <SectionLabel>OUR EXPERTISE</SectionLabel>
                <h2 id="services-title" className="text-[35px]">你的挑戰，我們的出發點。</h2>
              </div>
              <p className="pb-[5px] text-[13px] leading-[1.95] text-muted max-[1100px]:text-[12px]">
                不為技術而技術。
                <br />
                從一個工作難題，到一套完整的企業解決方案。
              </p>
            </div>

            <div className="grid grid-cols-5 gap-[13px] max-[1100px]:gap-[10px] max-[900px]:grid-cols-6 max-[900px]:gap-[15px] max-[700px]:grid-cols-2 max-[700px]:gap-[11px]">
              {services.map((service, index) => {
                const Icon = serviceIcons[service.icon];
                return (
                  <article className={`${serviceCardClass} max-[900px]:col-span-2 max-[900px]:[&:nth-child(n+4)]:col-span-3`} key={service.id}>
                    <div className="mb-[29px] flex items-center justify-between max-[900px]:mb-[21px]">
                      <span className={`flex h-[47px] w-[47px] items-center justify-center rounded-[10px] ${serviceIconVariants[index] ?? serviceIconVariants[0]} max-[1100px]:h-[42px] max-[1100px]:w-[42px]`}>
                        <Icon size={25} strokeWidth={1.5} />
                      </span>
                      <span className="mt-[3px] self-start font-[Arial,sans-serif] text-[12px] text-[#abb4a7]">{service.number}</span>
                    </div>
                    <p className="mb-2 whitespace-nowrap font-[Arial,sans-serif] text-[13px] tracking-[1.1px] text-[#91998c] max-[1100px]:text-[12px] max-[1100px]:tracking-[0.65px] max-[900px]:text-[13px]">{service.english}</p>
                    <h3 className="text-[15px] font-[550] tracking-[-0.3px] max-[1500px]:text-[16px] max-[1100px]:text-[13px] max-[900px]:text-[16px]">{service.title}</h3>
                    <p className="mt-[13px] min-h-[44px] max-w-[152px] text-[13px] leading-[1.9] text-[#7c837b] max-[1100px]:text-[12px] max-[900px]:mb-5 max-[900px]:min-h-0 max-[900px]:max-w-none max-[900px]:text-[13px]">{service.description}</p>
                    <div className="mt-[22px] flex items-center justify-between gap-[5px] border-t border-[#edf0e9] pt-[15px] max-[1100px]:gap-1 max-[900px]:mt-auto max-[900px]:pt-[14px]">
                      <span className="max-w-[103px] text-[13px] leading-[1.7] text-[#899082] max-[1100px]:text-[12px] max-[900px]:max-w-none max-[900px]:text-[12px]">{service.features[0]}</span>
                      <button
                        disabled={!ready}
                        className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-[#e5eae2] bg-white transition-all duration-200 hover:border-green hover:bg-green hover:text-white max-[900px]:h-[30px] max-[900px]:w-[30px]"
                        onClick={() => setSelectedService(service)}
                        aria-label={`了解${service.title}`}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-[27px] flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[13px] text-[#6c7c5c]">
                <CircleDot size={14} />
                不確定從哪裡開始？我們先聽你的需求。
              </span>
              <Link href="/services" aria-label="尋找更多適合的方向">
                <button disabled={!ready} className={textLinkClass}>
                  尋找更多適合的方向
                  <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-[#eef1eb] bg-[#f7f9f6] pb-[72px] pt-[84px] max-[700px]:pb-[51px] max-[700px]:pt-[61px]" id="featured" aria-labelledby="featured-title">
          <div className={containerClass}>
            <div className="mb-[42px] flex items-end justify-between gap-[35px]">
              <div>
                <SectionLabel>BUILT FOR YOUR EVERYDAY</SectionLabel>
                <h2 id="featured-title" className="text-[35px]">把日常，交給更好的方法。</h2>
              </div>
              <span className="flex items-center gap-[9px] pb-[10px] text-[12px] text-[#647169] max-[700px]:mt-[15px] max-[700px]:pb-0">
                <span className={onlineDotClass} />
                現時主打方案
              </span>
            </div>

            <div className="grid grid-cols-[1.13fr_1fr] gap-5 max-[1100px]:grid-cols-[1.08fr_1fr] max-[1100px]:gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-[15px]">
              <article className="relative flex flex-col overflow-hidden rounded-[14px] border border-[#dfe9d9] bg-[radial-gradient(ellipse_at_10%_20%,#e8f2d9,transparent_65%),#eff5e7] p-[32px_31px_0] max-[1100px]:p-[24px_24px_0] max-[700px]:min-h-[530px] max-[700px]:rounded-[12px] max-[700px]:p-[24px_23px_0] max-[370px]:px-[18px]">
                <div className="mb-[25px] flex items-center justify-between gap-[10px] max-[1100px]:gap-[5px] max-[700px]:mb-5">
                  <span className="inline-flex items-center gap-[7px] rounded-[4px] border border-[#dae5ce] bg-[#fff8] p-[5px_8px] text-[12px] text-[#5c7044] max-[1100px]:gap-[5px] max-[1100px]:text-[13px]">
                    <Sparkles size={13} />
                    一人公司・精簡團隊
                  </span>
                  <span className="whitespace-nowrap font-[Arial,sans-serif] text-[13px] tracking-[1px] text-[#8c9b7f] max-[1100px]:text-[12px] max-[1100px]:tracking-[0.5px] max-[900px]:hidden max-[700px]:block max-[700px]:text-[12px] max-[700px]:tracking-[0.5px]">01 / AI AT WORK</span>
                </div>
                <h3 className="text-[30px] font-semibold leading-[1.65] tracking-[-0.7px] max-[1500px]:text-[34px] max-[1100px]:text-[27px] max-[900px]:text-[25px] max-[700px]:text-[28px] max-[700px]:leading-[1.6] max-[370px]:text-[25px]">
                  你的一人公司，
                  <br />
                  不必一個人做所有事。
                </h3>
                <p className="mt-[15px] text-[12px] leading-[2] text-[#7a856e] max-[1100px]:text-[13px] max-[700px]:mt-[14px] max-[700px]:max-w-[285px]">
                  客服、文件、內容，讓 AI 成為你的得力助手。
                  <br className="max-[900px]:hidden max-[700px]:inline" />
                  把精力留給客戶，和你真正擅長的事。
                </p>

                <div className="mt-auto mb-[31px] ml-[13px] mr-[-2px] flex min-h-[252px] -rotate-[1.5deg] origin-bottom-left rounded-t-[10px] border border-b-0 border-[#dfe7d6] bg-white shadow-[0_9px_27px_#52762e0b] max-[1100px]:ml-0 max-[1100px]:mr-[-8px] max-[700px]:ml-[7px] max-[700px]:mr-[-6px] max-[700px]:min-h-[255px]" aria-label="AI 知識助手概念示意">
                  <div className="flex w-[49px] shrink-0 flex-col items-center gap-6 rounded-tl-[10px] border-r border-[#eff1eb] bg-[#fafcf8] p-[15px_0] text-[#a5afa0] max-[900px]:w-[35px] max-[900px]:gap-5 max-[700px]:w-[39px] max-[700px]:gap-[23px]" aria-hidden="true">
                    <span className="flex h-[29px] w-[29px] items-center justify-center rounded-[7px] bg-[#e9f2db] text-[#7a9c41]">
                      <Sparkles size={20} />
                    </span>
                    <MessageSquareText size={17} />
                    <FileText size={17} />
                    <Database size={17} />
                    <span className="mt-auto flex h-[21px] w-[21px] items-center justify-center rounded-full border border-[#e1e7db] font-[Arial,sans-serif] text-[12px]">H</span>
                  </div>
                  <div className="min-w-0 flex-1 p-[16px_18px_0] max-[1100px]:px-3 max-[900px]:px-[10px] max-[700px]:p-[13px_11px_0]">
                    <div className="flex items-center justify-between gap-[5px] border-b border-[#f0f2ec] pb-[11px] text-[12px]">
                      <span className="max-[900px]:text-[13px] max-[700px]:text-[13px]">你的企業知識助手</span>
                      <span className="text-[12px] text-[#9da596]">概念示意</span>
                    </div>
                    <div className="mt-[19px] flex items-center justify-end gap-[9px] text-[12px] text-[#72816b] max-[1100px]:text-[13px] max-[900px]:gap-1 max-[900px]:text-[12px] max-[700px]:mt-[15px] max-[700px]:gap-[7px] max-[700px]:text-[13px]">
                      幫我整理新客戶的服務查詢。
                      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#eff3e9] text-[13px]">你</span>
                    </div>
                    <div className="mt-[18px] flex gap-[9px] max-[900px]:gap-[5px] max-[700px]:mt-[17px] max-[700px]:gap-2">
                      <span className="flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[6px] bg-[#e9f4e1] text-[#7a9c41] max-[900px]:h-[19px] max-[900px]:w-[19px] max-[700px]:h-[21px] max-[700px]:w-[21px]">
                        <Sparkles size={14} />
                      </span>
                      <div>
                        <strong className="text-[12px] font-medium max-[1100px]:text-[12px] max-[900px]:text-[13px] max-[700px]:text-[12px]">先整理，再交由你作最後決定。</strong>
                        <p className="mt-[5px] text-[13px] text-[#98a08f] max-[900px]:text-[12px] max-[700px]:text-[12px]">我可以根據已授權的資料，協助你：</p>
                        <ul className="my-[9px] flex list-none flex-col gap-[5px] p-0">
                          <li className="flex items-center gap-[6px] text-[13px] text-[#7a8871] max-[900px]:gap-1 max-[900px]:text-[12px] max-[700px]:gap-[5px] max-[700px]:text-[12px]">
                            <CheckCheck size={13} className="text-[#87a263]" />
                            歸納查詢重點與客戶需求
                          </li>
                          <li className="flex items-center gap-[6px] text-[13px] text-[#7a8871] max-[900px]:gap-1 max-[900px]:text-[12px] max-[700px]:gap-[5px] max-[700px]:text-[12px]">
                            <CheckCheck size={13} className="text-[#87a263]" />
                            草擬回覆，供你審核
                          </li>
                          <li className="flex items-center gap-[6px] text-[13px] text-[#7a8871] max-[900px]:gap-1 max-[900px]:text-[12px] max-[700px]:gap-[5px] max-[700px]:text-[12px]">
                            <CheckCheck size={13} className="text-[#87a263]" />
                            標示需要人工跟進的問題
                          </li>
                        </ul>
                        <span className="inline-flex items-center gap-[3px] rounded-[3px] border border-[#e9ede2] bg-[#f5f7f1] p-[2px_5px] text-[12px] text-[#85957b]">
                          <FileText size={10} />
                          參考來源 · 企業知識庫
                        </span>
                      </div>
                    </div>
                    <div className="mb-3 mt-5 flex items-center justify-between gap-2 rounded-[6px] border border-[#e8ede0] p-[10px] text-[13px] text-[#a0aa95] max-[900px]:p-2 max-[900px]:text-[12px] max-[700px]:mt-[18px] max-[700px]:mb-[11px] max-[700px]:text-[12px]" aria-hidden="true">
                      <span>從一個問題，開始更有效率的一天</span>
                      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] bg-lime text-white max-[900px]:h-[19px] max-[900px]:w-[19px]">
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </article>

              <div className="grid grid-rows-[1.1fr_1fr] gap-5 max-[700px]:grid-rows-[auto_auto] max-[700px]:gap-[15px]">
                <article className="relative overflow-hidden rounded-[14px] bg-[#172442] p-[29px_29px_22px] text-white max-[1100px]:p-6 max-[700px]:min-h-[296px] max-[700px]:rounded-[12px] max-[700px]:p-6 before:absolute before:right-[-40px] before:top-[-95px] before:h-[260px] before:w-[260px] before:rounded-full before:border before:border-[#ffffff07] before:shadow-[0_0_0_30px_#ffffff02,0_0_0_60px_#ffffff02] before:content-[''] before:pointer-events-none">
                  <div className="mb-[18px] flex items-center justify-between gap-[10px] max-[1100px]:gap-[5px]">
                    <span className="inline-flex items-center gap-[7px] rounded-[4px] border border-[#ffffff16] bg-[#ffffff08] p-[5px_8px] text-[12px] text-[#aebacb] max-[1100px]:gap-[5px] max-[1100px]:text-[13px]">
                      <Workflow size={13} />
                      流程自動化
                    </span>
                    <span className="whitespace-nowrap font-[Arial,sans-serif] text-[13px] tracking-[1px] text-[#8591a8] max-[1100px]:text-[12px] max-[1100px]:tracking-[0.5px] max-[900px]:hidden max-[700px]:block max-[700px]:text-[12px] max-[700px]:tracking-[0.5px]">02 / CONNECT</span>
                  </div>
                  <h3 className="text-[25px] font-medium leading-[1.55] tracking-[-0.7px] max-[1500px]:text-[27px] max-[1100px]:text-[23px] max-[700px]:text-[25px]">
                    重複的流程，
                    <br />
                    就不必重複做。
                  </h3>
                  <p className="mt-3 text-[13px] leading-[1.9] text-[#a4b0c4] max-[900px]:text-[12px] max-[700px]:max-w-[270px] max-[700px]:text-[13px]">
                    串接工具與數據，讓查詢、訂單和報表
                    <br className="hidden min-[900px]:inline" />
                    沿著你設計的流程，自動走下一步。
                  </p>
                  <div className="mt-[21px] flex w-[80%] max-w-[295px] items-center max-[1100px]:w-[82%] max-[700px]:mt-[22px] max-[700px]:max-w-[268px] max-[700px]:w-[82%]" aria-label="查詢、自動處理、同步系統流程示意">
                    <span className="flex h-[63px] w-[64px] shrink-0 flex-col items-center justify-center gap-[7px] rounded-[8px] border border-[#ffffff12] bg-[#ffffff04] text-[#9caec7] max-[1100px]:w-[55px] max-[900px]:h-[55px] max-[900px]:w-[47px] max-[700px]:h-[58px] max-[700px]:w-[56px]">
                      <MessageSquareText size={18} />
                      <small className="text-[12px]">客戶查詢</small>
                    </span>
                    <i className="relative h-px w-full bg-[linear-gradient(90deg,#ffffff16,#a9ce4750)] after:absolute after:right-0 after:top-[-2px] after:h-[4px] after:w-[4px] after:rotate-45 after:border-r after:border-t after:border-[#90a47e] after:content-['']" />
                    <span className="flex h-[63px] w-[64px] shrink-0 flex-col items-center justify-center gap-[7px] rounded-[8px] border border-[#a9ce4740] bg-[#a9ce4712] text-[#c0d991] max-[1100px]:w-[55px] max-[900px]:h-[55px] max-[900px]:w-[47px] max-[700px]:h-[58px] max-[700px]:w-[56px]">
                      <Workflow size={20} />
                      <small className="text-[12px]">自動處理</small>
                    </span>
                    <i className="relative h-px w-full bg-[linear-gradient(90deg,#ffffff16,#a9ce4750)] after:absolute after:right-0 after:top-[-2px] after:h-[4px] after:w-[4px] after:rotate-45 after:border-r after:border-t after:border-[#90a47e] after:content-['']" />
                    <span className="flex h-[63px] w-[64px] shrink-0 flex-col items-center justify-center gap-[7px] rounded-[8px] border border-[#ffffff12] bg-[#ffffff04] text-[#9caec7] max-[1100px]:w-[55px] max-[900px]:h-[55px] max-[900px]:w-[47px] max-[700px]:h-[58px] max-[700px]:w-[56px]">
                      <Database size={18} />
                      <small className="text-[12px]">同步系統</small>
                    </span>
                  </div>
                </article>

                <article className="relative grid grid-cols-[1.1fr_1fr] gap-[3px] overflow-hidden rounded-[14px] border border-[#e1e6e9] bg-[#edf1f5] p-[27px_0_26px_29px] max-[1100px]:pl-6 max-[900px]:grid-cols-[1.2fr_1fr] max-[700px]:min-h-[249px] max-[700px]:grid-cols-[1.1fr_1fr] max-[700px]:rounded-[12px] max-[700px]:p-[26px_0_26px_24px] max-[370px]:pl-5">
                  <div>
                    <span className="text-[13px] tracking-[1.2px] text-[#8c98a5]">03 / BUILT TO SCALE</span>
                    <h3 className="mt-3 text-[25px] font-[550] leading-[1.55] tracking-[-0.7px] max-[1500px]:text-[27px] max-[1100px]:text-[23px] max-[900px]:text-[22px] max-[700px]:text-[25px] max-[370px]:text-[23px]">
                      業務向前，
                      <br />
                      架構跟得上。
                    </h3>
                    <p className="mt-[10px] text-[13px] leading-[1.9] text-[#88919c] max-[900px]:whitespace-nowrap max-[900px]:text-[12px] max-[700px]:text-[13px] max-[370px]:text-[12px]">
                      雲端、DevOps 與技術維運，
                      <br />
                      從穩定運作，走向從容擴展。
                    </p>
                    <button disabled={!ready} className={`${textLinkClass} mt-[18px] text-[13px]`} onClick={() => setSelectedService(services[3])}>
                      打造穩健基礎
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                  <div className="relative isolate flex items-center justify-center max-[1100px]:origin-center max-[1100px]:scale-[0.85] max-[900px]:-ml-7 max-[900px]:scale-[0.7] max-[700px]:ml-0 max-[700px]:scale-[0.86] max-[370px]:-ml-[10px] max-[370px]:scale-[0.73]" aria-hidden="true">
                    <div className="absolute z-[-1] h-[195px] w-[195px] rounded-full border border-[#dde3e9] bg-[radial-gradient(#dee7ed80,transparent_67%)] after:absolute after:inset-[22px] after:rounded-full after:border after:border-dashed after:border-[#d9e1e8] after:content-['']" />
                    <div className="mt-[10px] flex w-[119px] -rotate-[9deg] flex-col gap-[7px]">
                      <div className="flex h-[35px] items-center gap-[5px] rounded-[5px] border border-[#d0dbe0] bg-[linear-gradient(120deg,#fff,#e6edf0)] p-[0_12px] shadow-[4px_6px_0_#d1dde34d]">
                        <span className="h-2 w-[3px] rounded-[1px] bg-[#afbcc5]" />
                        <span className="h-2 w-[3px] rounded-[1px] bg-[#afbcc5]" />
                        <i className="ml-auto h-[4px] w-[4px] rounded-full bg-[#85b26a] shadow-[0_0_6px_#a9ce4750]" />
                      </div>
                      <div className="flex h-[35px] items-center gap-[5px] rounded-[5px] border border-[#d0dbe0] bg-[linear-gradient(120deg,#fff,#e6edf0)] p-[0_12px] shadow-[4px_6px_0_#d1dde34d]">
                        <span className="h-2 w-[3px] rounded-[1px] bg-[#afbcc5]" />
                        <span className="h-2 w-[3px] rounded-[1px] bg-[#afbcc5]" />
                        <i className="ml-auto h-[4px] w-[4px] rounded-full bg-[#85b26a] shadow-[0_0_6px_#a9ce4750]" />
                      </div>
                      <div className="flex h-[35px] items-center gap-[5px] rounded-[5px] border border-[#d0dbe0] bg-[linear-gradient(120deg,#fff,#e6edf0)] p-[0_12px] shadow-[4px_6px_0_#d1dde34d]">
                        <span className="h-2 w-[3px] rounded-[1px] bg-[#afbcc5]" />
                        <span className="h-2 w-[3px] rounded-[1px] bg-[#afbcc5]" />
                        <i className="ml-auto h-[4px] w-[4px] rounded-full bg-[#85b26a] shadow-[0_0_6px_#a9ce4750]" />
                      </div>
                    </div>
                    <span className="absolute bottom-6 left-1/2 flex -translate-x-1/2 -rotate-[9deg] items-center gap-[7px] whitespace-nowrap rounded-[4px] border border-[#dce4e4] bg-[#fff9] p-[5px_8px] font-[Arial,sans-serif] text-[12px] tracking-[0.7px] text-[#728579] max-[700px]:bottom-[10px]">
                      <span className={`${onlineDotClass} h-[4px] w-[4px] shadow-none`} />
                      READY TO GROW
                      <Cloud className="absolute right-[14px] top-[14px] text-[#94a7b6]" size={31} strokeWidth={1.3} />
                    </span>
                  </div>
                </article>
              </div>
            </div>

            <p className="mt-6 text-center text-[12px] tracking-[0.3px] text-[#90998a] max-[700px]:mx-auto max-[700px]:mt-[19px] max-[700px]:max-w-[290px] max-[700px]:text-[13px] max-[700px]:leading-[1.9]">
              每個方案，從你的實際流程開始。功能、部署及服務範圍按項目需求確認。
            </p>
          </div>
        </section>

        <section className={`${sectionClass} pb-[95px]`} id="why" aria-labelledby="why-title">
          <div className={containerClass}>
            <div className="mb-[42px] flex items-end justify-between gap-[35px]">
              <div>
                <SectionLabel>WHY HANGS</SectionLabel>
                <h2 id="why-title">
                  不只是交付，
                  <br className="hidden" />
                  更是值得信賴的同行。
                </h2>
              </div>
              <p className="pb-[5px] text-[13px] leading-[1.95] text-muted">
                好的技術夥伴，
                <br />
                讓你看得懂、用得好，也走得遠。
              </p>
            </div>

            <div className="grid grid-cols-4 gap-0 max-[900px]:grid-cols-2 max-[900px]:gap-x-10 max-[900px]:gap-y-[33px] max-[700px]:gap-x-[22px] max-[700px]:gap-y-[30px]">
              {[
                { icon: Code2, title: '自主擁有，不被綁定', text: '源碼、帳號與交付文件的權責清楚約定，讓你保有選擇和持續發展的空間。', tag: 'YOUR BUSINESS. YOUR CONTROL.' },
                { icon: LockKeyhole, title: '資料保密，從設計開始', text: '從資料流向、存取權限到部署方式，按你的安全要求規劃，而非事後補救。', tag: 'PRIVACY BY DESIGN.' },
                { icon: HeartHandshake, title: '懂你的問題，才寫程式', text: '先了解業務流程與真正的困難，再定義解法。不堆疊功能，不讓需求迷失。', tag: 'BUSINESS BEFORE TECHNOLOGY.' },
                { icon: Headphones, title: '上線之後，繼續同行', text: '提供可約定的維運、培訓與駐場支援，讓團隊接得住，系統也持續進步。', tag: 'SUPPORT BEYOND LAUNCH.' },
              ].map((item, index) => (
                <article className="border-l border-line px-[27px] first:border-l-0 first:pl-0 last:pr-0 max-[1100px]:px-5 max-[900px]:border-0 max-[900px]:p-0" key={item.title}>
                  <div className="mb-[23px] flex items-center justify-between text-[#6c8c59] max-[1100px]:mb-[14px] max-[700px]:mb-[15px]">
                    <item.icon size={25} strokeWidth={1.4} className="max-[700px]:h-[23px] max-[700px]:w-[23px]" />
                    <span className="font-[Arial,sans-serif] text-[12px] text-[#afb8a7] max-[700px]:text-[13px]">0{index + 1}</span>
                  </div>
                  <h3 className="text-[16px] font-[550] tracking-[-0.2px] max-[1100px]:text-[14px] max-[900px]:text-[16px] max-[700px]:text-[13px] max-[700px]:leading-[1.6]">{item.title}</h3>
                  <p className="mt-[13px] text-[12px] leading-[1.95] text-[#858b82] max-[1100px]:text-[13px] max-[900px]:max-w-[300px] max-[900px]:text-[12px] max-[700px]:mt-[10px] max-[700px]:leading-[2]">{item.text}</p>
                  <span className="mt-[22px] block font-[Arial,sans-serif] text-[12px] tracking-[1.1px] text-[#a0aa94] max-[1100px]:tracking-[0.6px] max-[900px]:mt-[14px] max-[900px]:tracking-[1px] max-[700px]:mt-[13px] max-[700px]:leading-[1.7] max-[700px]:tracking-[0.7px]">{item.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#eef0e9] bg-[#f9faf7] py-[89px] max-[700px]:py-[63px_77px]" id="about" aria-labelledby="about-title">
          <div className={`${containerClass} grid grid-cols-2 items-center gap-[108px] max-[1100px]:gap-[65px] max-[900px]:gap-[38px] max-[700px]:grid-cols-1 max-[700px]:gap-[39px]`}>
            <div>
              <SectionLabel>EXPERIENCE MEETS WHAT’S NEXT</SectionLabel>
              <h2 id="about-title" className="text-[33px] leading-[1.65] tracking-[-1px] max-[1100px]:text-[29px] max-[900px]:text-[27px] max-[700px]:text-[28px]">
                技術在變，
                <br />
                把事情做好的初心不變。
              </h2>
              <p className="mt-5 max-w-[467px] text-[12px] leading-[2.15] text-[#7e867b] max-[900px]:text-[13px] max-[700px]:mt-[17px] max-[700px]:max-w-none max-[700px]:leading-[2.1]">
                實瀚科技成立於 2023 年。團隊成員均擁有 15 年以上系統開發經驗，結合逾 200 家企業的服務經驗，深知數位轉型不只是換一套系統，而是讓業務真正向前。
              </p>
              <p className="mt-5 max-w-[467px] text-[12px] leading-[2.15] text-[#7e867b] max-[900px]:text-[13px] max-[700px]:mt-[17px] max-[700px]:max-w-none max-[700px]:leading-[2.1]">
                我們以現代化全棧架構，連接前端體驗、業務流程與底層數據。從需求梳理、UML 架構設計到開發與維運，讓每個技術決定，都有業務上的理由。
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-[11px] max-[700px]:mt-6 max-[700px]:gap-[9px]">
                <span className="h-px w-[25px] bg-lime max-[700px]:w-[18px]" />
                <span className="text-[13px] tracking-[1px] text-[#5c6f4f] max-[700px]:text-[12px]">實在解題，瀚見可能。</span>
                <small className="font-[Arial,sans-serif] text-[12px] tracking-[1.1px] text-[#9ca792] max-[900px]:hidden max-[700px]:inline max-[700px]:text-[12px] max-[700px]:tracking-[0.6px]">THE HANGS APPROACH</small>
              </div>
            </div>

            <div className="relative rounded-[13px] border border-[#e2e8dc] bg-white p-6 shadow-[0_12px_38px_-25px_#2e431e2e] max-[1100px]:p-5 max-[900px]:p-[17px] max-[700px]:w-full max-[700px]:max-w-[460px] max-[700px]:justify-self-center max-[700px]:rounded-[11px] max-[700px]:p-5 max-[370px]:p-4">
              <div className="mb-[25px] flex items-center justify-between gap-[10px] border-b border-[#edf0e8] pb-[19px] max-[1100px]:gap-[7px] max-[700px]:mb-[21px] max-[700px]:pb-[17px]">
                <span className="flex items-center gap-2 text-[13px] text-[#66735d] max-[1100px]:text-[12px] max-[700px]:text-[12px]">
                  <Layers3 size={17} className="text-[#8da276]" />
                  為長遠而設的技術底座
                </span>
                <span className="text-[12px] tracking-[0.9px] text-[#a1ab94] max-[1100px]:tracking-[0.5px] max-[900px]:hidden max-[700px]:block max-[700px]:text-[12px] max-[370px]:text-[13px]">FULL-STACK / 01</span>
              </div>

              <div className="flex items-center gap-[15px] rounded-[8px] border border-[#e4e9e0] bg-[linear-gradient(110deg,#f8faf5,#fff)] p-[15px_17px] max-[1100px]:gap-[11px] max-[1100px]:p-[14px_11px] max-[900px]:gap-2 max-[900px]:px-[11px] max-[700px]:gap-[13px] max-[700px]:p-[15px_13px]">
                <span className="self-start pt-[3px] font-[Arial,sans-serif] text-[12px] text-[#a3af97]">01</span>
                <div>
                  <small className="block font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#98a38b] max-[900px]:text-[12px] max-[700px]:text-[12px]">EXPERIENCE</small>
                  <strong className="mt-1 block text-[12px] font-medium text-[#61724f] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[700px]:text-[12px] max-[370px]:text-[13px]">流暢的使用體驗</strong>
                </div>
                <span className="ml-auto text-[#a7b795]"><Globe2 size={21} strokeWidth={1.4} className="max-[900px]:h-[19px] max-[900px]:w-[19px] max-[700px]:h-[21px] max-[700px]:w-[21px]" /></span>
              </div>
              <div className="relative flex h-[38px] items-center justify-center gap-2 font-[Arial,sans-serif] text-[13px] tracking-[0.2px] text-[#a1ac96] max-[1100px]:text-[12px] max-[900px]:gap-[6px] max-[700px]:h-[35px] max-[700px]:gap-2">
                <span className="absolute bottom-0 left-[22px] top-0 w-px border-l border-dashed border-[#cad6bf] after:absolute after:bottom-0 after:left-[-3px] after:h-[4px] after:w-[4px] after:rotate-45 after:border-b after:border-r after:border-[#cad6bf] after:content-['']" />
                React.js
                <span className="text-[13px] text-[#d0d7c8]">/</span>
                Next.js
                <span className="text-[13px] text-[#d0d7c8]">/</span>
                TypeScript
              </div>

              <div className="flex items-center gap-[15px] rounded-[8px] border border-[#d8e5c7] bg-[#eef5e5] p-[15px_17px] max-[1100px]:gap-[11px] max-[1100px]:p-[14px_11px] max-[900px]:gap-2 max-[900px]:px-[11px] max-[700px]:gap-[13px] max-[700px]:p-[15px_13px]">
                <span className="self-start pt-[3px] font-[Arial,sans-serif] text-[12px] text-[#a3af97]">02</span>
                <div>
                  <small className="block font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#98a38b] max-[900px]:text-[12px] max-[700px]:text-[12px]">INTELLIGENCE & LOGIC</small>
                  <strong className="mt-1 block text-[12px] font-medium text-[#4c702c] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[700px]:text-[12px] max-[370px]:text-[13px]">貼合業務的智慧與流程</strong>
                </div>
                <span className="ml-auto text-[#809e58]"><BrainCircuit size={22} strokeWidth={1.4} className="max-[900px]:h-[19px] max-[900px]:w-[19px] max-[700px]:h-[21px] max-[700px]:w-[21px]" /></span>
              </div>
              <div className="relative flex h-[38px] items-center justify-center gap-2 font-[Arial,sans-serif] text-[13px] tracking-[0.2px] text-[#a1ac96] max-[1100px]:text-[12px] max-[900px]:gap-[6px] max-[700px]:h-[35px] max-[700px]:gap-2">
                <span className="absolute bottom-0 left-[22px] top-0 w-px border-l border-dashed border-[#cad6bf] after:absolute after:bottom-0 after:left-[-3px] after:h-[4px] after:w-[4px] after:rotate-45 after:border-b after:border-r after:border-[#cad6bf] after:content-['']" />
                Python
                <span className="text-[13px] text-[#d0d7c8]">/</span>
                API
                <span className="text-[13px] text-[#d0d7c8]">/</span>
                AI Integration
              </div>

              <div className="flex items-center gap-[15px] rounded-[8px] border border-[#e4e9e0] bg-[linear-gradient(110deg,#f8faf5,#fff)] p-[15px_17px] max-[1100px]:gap-[11px] max-[1100px]:p-[14px_11px] max-[900px]:gap-2 max-[900px]:px-[11px] max-[700px]:gap-[13px] max-[700px]:p-[15px_13px]">
                <span className="self-start pt-[3px] font-[Arial,sans-serif] text-[12px] text-[#a3af97]">03</span>
                <div>
                  <small className="block font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#98a38b] max-[900px]:text-[12px] max-[700px]:text-[12px]">FOUNDATION</small>
                  <strong className="mt-1 block text-[12px] font-medium text-[#61724f] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[700px]:text-[12px] max-[370px]:text-[13px]">安全可靠的數據與基礎設施</strong>
                </div>
                <span className="ml-auto text-[#a7b795]"><Database size={21} strokeWidth={1.4} className="max-[900px]:h-[19px] max-[900px]:w-[19px] max-[700px]:h-[21px] max-[700px]:w-[21px]" /></span>
              </div>

              <div className="mt-[21px] flex justify-center gap-[23px] border-t border-[#edf0e8] pt-[23px] max-[900px]:gap-[10px] max-[700px]:mt-[18px] max-[700px]:gap-5 max-[700px]:pt-[18px] max-[370px]:gap-[13px]">
                <span className="flex items-center gap-[5px] text-[12px] text-[#909e83] max-[900px]:text-[13px] max-[700px]:text-[12px]">
                  <Blocks size={14} />
                  UML 架構先行
                </span>
                <span className="flex items-center gap-[5px] text-[12px] text-[#909e83] max-[900px]:text-[13px] max-[700px]:text-[12px]">
                  <ShieldCheck size={14} />
                  安全與效能並重
                </span>
              </div>
              <span className="absolute -bottom-[25px] left-0 right-0 text-center font-[Arial,sans-serif] text-[12px] tracking-[1.5px] text-[#9daa92] max-[700px]:-bottom-6 max-[700px]:tracking-[1.3px]" aria-hidden="true">
                DESIGNED WITH CLARITY. BUILT WITH PURPOSE.
              </span>
            </div>
          </div>
        </section>

        <section className={`${sectionClass} pb-[92px]`} id="process" aria-labelledby="process-title">
          <div className={containerClass}>
            <div className="mb-[42px] flex items-end justify-between gap-[35px]">
              <div>
                <SectionLabel>HOW WE WORK TOGETHER</SectionLabel>
                <h2 id="process-title">先理解你，再一起走。</h2>
              </div>
              <p className="pb-[5px] text-[13px] leading-[1.95] text-muted">
                你不需要帶著完整的規格書來。
                <br />
                帶著問題，我們一起找到答案。
              </p>
            </div>

            <ol className="grid list-none grid-cols-4 gap-[35px] p-0 m-0 max-[1100px]:gap-[25px] max-[900px]:gap-[19px] max-[700px]:grid-cols-2 max-[700px]:gap-x-[23px] max-[700px]:gap-y-8">
              {[
                { title: '聊清楚真正的問題', english: 'DISCOVER', description: '了解你的業務、現有流程與痛點，先確認甚麼值得解決。', deliver: '需求訪談・流程梳理' },
                { title: '把想法變成可見方案', english: 'DEFINE', description: '以原型與架構釐清方向，對齊範圍、預算和驗收標準。', deliver: '方案建議・原型與 UML' },
                { title: '小步實作，一起驗證', english: 'BUILD', description: '分階段開發與展示，讓使用者提早參與，及時調整。', deliver: '迭代開發・測試與回饋' },
                { title: '安心上線，持續改善', english: 'EVOLVE', description: '完成部署、交接與培訓，按約定持續維運和優化。', deliver: '系統交付・培訓與支援' },
              ].map((step, index) => (
                <li key={step.english}>
                  <div className="mb-[25px] flex items-center gap-[17px] max-[700px]:mb-4 max-[700px]:gap-3">
                    <span className="font-[Arial,sans-serif] text-[30px] font-normal tracking-[-1.5px] text-[#9eaf8f] max-[700px]:text-[28px]">0{index + 1}</span>
                    <span className="h-px flex-1 bg-[#e4eadd]" />
                    <ArrowRight size={15} className="text-[#b1bda5] max-[700px]:hidden" />
                  </div>
                  <span className="text-[13px] tracking-[1.8px] text-[#9aa78f] max-[700px]:text-[12px] max-[700px]:tracking-[1.5px]">{step.english}</span>
                  <h3 className="mt-[9px] text-[16px] font-[550] tracking-[-0.2px] max-[1100px]:text-[14px] max-[900px]:text-[13px] max-[700px]:mt-2 max-[700px]:text-[13px] max-[700px]:leading-[1.75]">{step.title}</h3>
                  <p className="mt-[13px] max-w-[230px] text-[12px] leading-[1.95] text-[#858e7e] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[700px]:mt-[9px] max-[700px]:max-w-none max-[700px]:leading-[2]">{step.description}</p>
                  <span className="mt-[21px] flex max-w-[220px] items-center gap-[5px] border-t border-[#edf0e8] pt-[14px] text-[12px] text-[#74896a] max-[900px]:gap-[3px] max-[900px]:text-[13px] max-[700px]:max-w-none max-[700px]:gap-1 max-[700px]:pt-3">
                    <Check size={13} className="max-[700px]:w-[11px]" />
                    {step.deliver}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-line pb-[91px] pt-[82px] max-[1100px]:pb-20 max-[1100px]:pt-20" id="faq" aria-labelledby="faq-title">
          <div className={`${containerClass} grid grid-cols-[1fr_1.65fr] gap-[87px] max-[1100px]:grid-cols-[1fr_1.6fr] max-[1100px]:gap-[55px] max-[900px]:grid-cols-[1fr_1.6fr] max-[900px]:gap-[35px] max-[700px]:grid-cols-1 max-[700px]:gap-[28px]`}>
            <div>
              <SectionLabel>A LITTLE MORE CLARITY</SectionLabel>
              <h2 id="faq-title" className="text-[30px] tracking-[-0.8px] max-[1100px]:text-[27px] max-[900px]:text-[24px] max-[700px]:text-[26px]">你可能也想知道。</h2>
              <p className="mt-[19px] text-[13px] leading-[1.95] text-[#858d81] max-[700px]:mt-3">
                把疑問說清楚，
                <br className="max-[700px]:hidden" />
                才是合作的好開始。
              </p>
              <div className="relative mt-9 flex h-[100px] w-[128px] items-center justify-center bg-[radial-gradient(#eef5e5,transparent_68%)] text-[#a6bb92] max-[700px]:hidden" aria-hidden="true">
                <MessageSquareText size={47} strokeWidth={1} className="-rotate-[10deg]" />
                <span className="absolute right-2 top-0 flex h-[30px] w-[30px] rotate-[12deg] items-center justify-center rounded-full border border-[#e1e9d7] bg-white font-[Arial,sans-serif] text-[18px]">?</span>
                <i className="absolute left-[15px] top-[17px] h-[4px] w-[4px] rounded-full bg-lime" />
              </div>
            </div>

            <div className="border-t border-[#dfe6d8]">
              {faqs.map((faq, index) => (
                <details className="group border-b border-[#e8ede2]" key={faq.question}>
                  <summary className="group/summary flex cursor-pointer list-none items-center gap-4 py-[21px] [&::-webkit-details-marker]:hidden max-[900px]:gap-3 max-[700px]:gap-[11px] max-[700px]:py-[19px]">
                    <span className="self-start pt-1 font-[Arial,sans-serif] text-[12px] text-[#a1ae92]">0{index + 1}</span>
                    <h3 className="flex-1 text-[13px] font-[450] leading-[1.9] text-wrap-[initial] group-open:text-green-dark group-hover/summary:text-green-dark max-[900px]:text-[12px]">{faq.question}</h3>
                    <Plus size={18} className="text-[#89987c] transition-transform duration-200 group-open:rotate-45 group-open:text-green" />
                  </summary>
                  <div className="px-8 pb-[23px] group-open:[animation:appear_.25s_both]">
                    <p className="text-[12px] leading-[2.1] text-[#7f8877]">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-[83px]" aria-labelledby="cta-title">
          <div className={containerClass}>
            <div className="relative flex min-h-[369px] items-center justify-between overflow-hidden rounded-[16px] border border-[#e1eacb] bg-[linear-gradient(105deg,#f0f6e5_0%,#edf5dc_55%,#e6f0cc_100%)] p-[48px_54px] max-[1100px]:p-[43px] max-[900px]:p-[38px]">
              <div className="relative z-[2]">
                <SectionLabel>YOUR NEXT CHAPTER STARTS HERE</SectionLabel>
                <h2 id="cta-title" className="text-[37px] font-[650] leading-[1.5] tracking-[-1px] max-[1100px]:text-[34px] max-[900px]:text-[33px]">
                  下一個可能，
                  <br />
                  從一次對話開始。
                </h2>
                <p className="mt-[17px] text-[12px] leading-[2] text-[#7e8b6e] max-[900px]:text-[13px]">
                  無論是第一個 AI 應用，還是下一階段的企業系統，
                  <br className="hidden min-[900px]:inline" />
                  我們先聽你的想法。
                </p>
                <button disabled={!ready} className={`${buttonClass} ${buttonNavyClass} mt-[25px] min-h-[45px] gap-[31px] px-5 text-[12px]`} onClick={() => openConsult()}>
                  預約免費諮詢
                  <ArrowUpRight size={18} />
                </button>
                <span className="mt-[11px] block text-[12px] text-[#929e80]">先了解需求，再決定下一步。</span>
              </div>
              <div className="absolute right-[4%] top-1/2 flex h-[360px] w-[415px] -translate-y-1/2 items-center justify-center max-[1100px]:right-0 max-[1100px]:scale-90 max-[900px]:right-[-60px] max-[900px]:scale-[0.78]" aria-hidden="true">
                <div className="absolute h-[320px] w-[320px] -rotate-[32deg] scale-x-[1.27] rounded-full border border-[#b9cd8d50]" />
                <div className="absolute h-[240px] w-[240px] -rotate-[32deg] scale-x-[1.27] rounded-full border border-[#b0c77c50]" />
                <div className="absolute h-[155px] w-[155px] -rotate-[32deg] scale-x-[1.27] rounded-full border border-[#b0c77c60] bg-[#c7dd9630] shadow-[0_0_50px_#b2ce6f20]" />
                <span className="absolute font-[Arial,sans-serif] text-[18px] font-light text-[#89a956]">+</span>
                <span className="absolute bottom-0 font-[Arial,sans-serif] text-[18px] font-light text-[#89a956]">+</span>
                <div className="flex h-[94px] w-[94px] -rotate-[12deg] items-center justify-center rounded-[25px] border border-[#c9dba9] bg-[linear-gradient(135deg,#fcfff5cc,#dfedc380)] text-[#82a149] shadow-[0_18px_30px_-17px_#7a993c45,inset_1px_1px_0_#fff8]">
                  <svg viewBox="0 0 80 80" fill="none" className="h-[57px] w-[57px] rotate-[12deg]">
                    <path d="M18 57L58 17M20 17h38v38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="absolute bottom-[2px] text-center font-[Arial,sans-serif] text-[12px] leading-[2] tracking-[2px] text-[#95a777]">
                  HUMAN IDEAS.
                  <br />
                  <strong className="font-medium text-[#6f8751]">GREATER POSSIBILITIES.</strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedService && (
        <Modal title={selectedService.title} onClose={() => setSelectedService(null)}>
          <span className="mt-[9px] block font-[Arial,sans-serif] text-[12px] tracking-[1.7px] text-[#94a380]">{selectedService.english}</span>
          <p className="mt-[14px] text-[12px] leading-[2] text-[#7b8573]">{selectedService.detail}</p>
          <h3 className="mt-[23px] text-[13px]">我們可以協助你</h3>
          <ul className="my-[14px] flex list-none flex-col gap-3 p-0 mb-[23px]">
            {selectedService.features.map((feature) => (
              <li key={feature} className="flex items-center gap-[9px] text-[12px] text-[#697f57] max-[700px]:text-[13px]">
                <CircleCheck size={18} className="text-green" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="rounded-[8px] border border-[#e4ecd9] bg-[#f3f7ed] p-[17px]">
            <strong className="text-[12px] font-[550]">適合誰？</strong>
            <p className="mt-[5px] text-[12px] leading-[1.9] text-[#7b896e] max-[700px]:text-[13px]">{selectedService.fit}</p>
          </div>
          <p className="mb-[21px] mt-[17px] text-[12px] leading-[1.9] text-[#98a08f]">
            實際功能、交付範圍、資料處理及服務承諾，將在需求評估後於合約中確認。
          </p>
          <button
            className={`${buttonClass} ${buttonPrimaryClass}`}
            onClick={() => {
              setSelectedService(null);
              openConsult();
            }}
          >
            討論我的需求
            <ArrowUpRight size={17} />
          </button>
        </Modal>
      )}
    </>
  );
}
