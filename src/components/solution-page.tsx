import {
  ArrowDown,
  BrainCircuit,
  Workflow,
  Database,
  Check,
  FileText,
  ShieldCheck,
  LockKeyhole,
  Command,
  UserRound,
  Layers3,
  GraduationCap,
  CircleCheck,
} from 'lucide-react';
import type { Solution } from '@/lib/solutions';
import { ConsultButton } from './site-shell';
import {
  Breadcrumbs,
  Eyebrow,
  PageCTA,
  PageFAQ,
  PageHeading,
  PageProcess,
  PageSchema,
  RelatedSolutions,
} from './page-blocks';
import { containerClass, sectionClass, onlineDotClass } from '@/lib/ui';

const threeGridClass = 'grid grid-cols-3 gap-[22px] max-[1100px]:gap-[17px] max-[900px]:gap-[13px] max-[700px]:grid-cols-1';

function WorkflowVisual({ data }: { data: Solution }) {
  const icons = [Database, BrainCircuit, ShieldCheck];
  const isSolo = data.slug === 'solo';
  const isEnterprise = data.slug === 'enterprise';

  return (
    <div className={`relative isolate min-w-0 p-[40px_9px_43px_0] max-[900px]:pr-0 max-[700px]:mx-auto max-[700px]:w-[calc(100%-26px)] max-[700px]:max-w-[402px] max-[700px]:p-[40px_0_51px] max-[370px]:w-[calc(100%-14px)]`}>
      <div className="absolute left-1/2 top-1/2 z-[-1] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] scale-x-[1.1] rounded-full border border-[#d8e5ce80] max-[1100px]:h-[350px] max-[1100px]:w-[350px]" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 z-[-1] h-[285px] w-[350px] -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] scale-x-[1.35] rounded-full border border-[#d3e0c460] max-[1100px]:h-[255px] max-[1100px]:w-[310px]" aria-hidden="true" />

      <span className="absolute left-3 top-[14px] font-[Arial,sans-serif] text-[12px] tracking-[1.7px] text-[#99a98a] max-[900px]:text-[13px]">
        {isSolo ? 'YOUR EVERYDAY, REIMAGINED.' : isEnterprise ? 'GOVERNANCE BY DESIGN.' : 'FROM INFORMATION TO ACTION.'}
      </span>

      <div className="relative w-full -rotate-[1.7deg] rounded-[13px] border border-[#dee8d6] bg-white shadow-[0_26px_60px_-27px_#354d2633] max-[1500px]:max-w-[480px]">
        <div className="flex items-center justify-between gap-3 border-b border-[#eaf0e3] p-[13px_18px] max-[900px]:p-3 max-[700px]:px-[15px]">
          <span className="flex items-center gap-[7px] font-[Arial,sans-serif] text-[13px] text-[#587446] max-[900px]:text-[12px] max-[700px]:text-[12px]">
            {isSolo ? <UserRound size={16} /> : isEnterprise ? <LockKeyhole size={16} /> : <Command size={16} />}
            Hangs / {data.slug === 'sme' ? 'workflow' : isSolo ? 'my assistant' : 'enterprise'}
          </span>
          <span className="rounded-[4px] border border-[#e7ece3] p-[2px_6px] text-[13px] text-[#748274]">概念示意</span>
        </div>

        <div className="p-[22px] max-[1100px]:p-[18px] max-[900px]:p-[15px] max-[700px]:p-[19px]">
          <p className="text-[12px] tracking-[1.1px] text-[#92a080] max-[900px]:tracking-[0.8px] max-[700px]:tracking-[1px]">
            {isSolo ? 'YOUR PERSONAL WORKSPACE' : isEnterprise ? 'CONTROLLED INTELLIGENCE' : 'A MORE CONNECTED WAY TO WORK'}
          </p>
          <h2 className="mt-2 text-[19px] font-[550] leading-[1.5] tracking-[-0.5px] max-[1100px]:text-[17px] max-[900px]:text-[15px] max-[700px]:mt-[7px] max-[700px]:text-[17px] max-[370px]:text-[16px]">
            {data.workflow.title}
          </h2>

          <div className="mt-[19px] flex flex-wrap gap-[7px] pb-5 max-[1100px]:gap-[5px] max-[700px]:mt-4 max-[700px]:gap-[6px] max-[700px]:pb-[17px]">
            {data.workflow.sources.map((source) => (
              <span key={source} className="rounded-[4px] border border-[#e7eddf] bg-[#f4f7ef] p-[4px_9px] text-[13px] text-[#889878] max-[1100px]:text-[12px] max-[1100px]:p-[4px_7px] max-[700px]:p-[4px_8px]">
                {source}
              </span>
            ))}
          </div>

          <div>
            {data.workflow.steps.map((step, index) => {
              const StepIcon = icons[index];
              return (
                <div key={step.title}>
                  {index > 0 && (
                    <div className="flex flex-col items-center py-0 h-[23px] max-[700px]:h-[23px]" aria-hidden="true">
                      <ArrowDown size={12} className="text-[#b1bda5]" />
                    </div>
                  )}
                  <div className={`flex items-center gap-3 rounded-[8px] border border-[#e6ecdf] bg-[linear-gradient(100deg,#fafcf7,#fff)] p-[15px_13px] max-[1100px]:gap-[9px] max-[1100px]:p-[12px_10px] max-[900px]:gap-2 max-[900px]:p-[11px_9px] max-[700px]:gap-[10px] max-[700px]:p-[12px_10px] max-[370px]:gap-2`}>
                    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] bg-[#f1f5e9] text-[#8a9f72] max-[1100px]:h-[29px] max-[1100px]:w-[29px] max-[900px]:h-[26px] max-[900px]:w-[26px] max-[700px]:h-[29px] max-[700px]:w-[29px]">
                      <StepIcon size={21} strokeWidth={1.5} className="max-[1100px]:h-[19px] max-[900px]:h-[17px] max-[700px]:h-[19px]" />
                    </span>
                    <div>
                      <strong className="flex items-center gap-2 text-[13px] font-medium max-[1100px]:text-[12px] max-[900px]:gap-[5px] max-[900px]:text-[12px] max-[700px]:gap-[6px] max-[700px]:text-[12px]">
                        <span className="font-[Arial,sans-serif] text-[13px] text-[#9da78e]">0{index + 1}</span>
                        {step.title}
                      </strong>
                      <p className="text-[13px] leading-[1.9] text-[#8e9a81] max-[1100px]:text-[12px] max-[900px]:text-[12px] max-[700px]:mt-1 max-[700px]:text-[13px] max-[700px]:leading-[1.85] max-[370px]:text-[12px]">{step.text}</p>
                    </div>
                    {index === 1 && <span className={`${onlineDotClass} ml-auto hidden max-[700px]:block max-[370px]:hidden`} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-[17px] flex items-center gap-2 border-t border-[#eaf0e3] pt-[13px] max-[700px]:mt-[17px] max-[700px]:pt-[13px]">
            <CircleCheck size={14} className="text-green" />
            <p className="text-[13px] text-[#8e9a81] max-[900px]:text-[12px] max-[700px]:text-[12px]">{data.workflow.foot}</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[10%] right-[-3px] flex items-center gap-2 rounded-[9px] border border-[#e5ece0] bg-white p-[11px] text-[13px] shadow-[0_8px_26px_-12px_#263b1f2e] max-[900px]:p-[11px] max-[900px]:text-[12px] max-[700px]:bottom-[27px] max-[700px]:right-[-10px] max-[700px]:p-[11px_13px] max-[370px]:right-[-4px] max-[370px]:text-[13px]">
        {isEnterprise ? <ShieldCheck size={19} className="text-green" /> : isSolo ? <BrainCircuit size={19} className="text-green" /> : <GraduationCap size={20} className="text-green" />}
        <span>
          {isEnterprise ? '清晰權責，穩健擴展' : isSolo ? '重要的決定，仍然由你掌握' : '不只交付系統，更交付能力'}
          <small className="block font-[Arial,sans-serif] text-[13px] text-[#929b8d] max-[900px]:text-[13px] max-[700px]:text-[13px] max-[700px]:tracking-[0.7px]">
            {isEnterprise ? 'BUILT FOR YOUR ORGANIZATION' : isSolo ? 'HUMAN FIRST. AI ASSISTED.' : 'BUILD IT. UNDERSTAND IT. OWN IT.'}
          </small>
        </span>
        <Check size={15} className="text-green" />
      </div>
    </div>
  );
}

function ScenarioDiagram({ index, slug }: { index: number; slug: string }) {
  const labels =
    slug === 'sme'
      ? [['供應商資料', '報價草稿'], ['出貨文件', '異常清單'], ['內部文件', '知識查詢']]
      : slug === 'solo'
        ? [['會議筆記', '提案初稿'], ['品牌靈感', '內容大綱'], ['客戶查詢', '回覆草稿']]
        : [['授權文件', '來源答案'], ['業務事件', '審批流程'], ['版本變更', '受控部署']];

  return (
    <div className={`relative flex h-[165px] items-center justify-center gap-0 border-b border-[#e8efdf] p-[20px_25px_34px] bg-[radial-gradient(ellipse_at_center,#e8f0dc,transparent_70%),#f2f6eb] max-[900px]:h-[147px] max-[900px]:px-[13px] max-[370px]:px-[27px] ${index === 1 ? 'bg-[radial-gradient(ellipse_at_center,#e5edef,transparent_70%),#f0f4f5]' : ''} ${index === 2 ? 'bg-[radial-gradient(ellipse_at_100%_50%,#eceedd,transparent_70%),#f6f6ef]' : ''}`} aria-label={`${labels[index][0]}經 AI 輔助整理成${labels[index][1]}，概念示意`}>
      <span className={`flex min-w-[53px] flex-col items-center justify-center gap-[9px] rounded-[7px] border border-[#dce7cf] bg-[#fff9] p-[12px_9px] text-[#8ea278] max-[900px]:min-w-[43px] max-[900px]:p-[10px_6px] ${index === 1 ? 'border-[#d8e2e5] text-[#8a9ea5]' : ''}`}>
        <FileText size={19} strokeWidth={1.4} />
        <small className="whitespace-nowrap text-[12px]">{labels[index][0]}</small>
      </span>
      <span className="relative mx-0 h-px min-w-[10px] flex-1 max-w-[42px] bg-[linear-gradient(90deg,#d7e3ca,#a9c38e)] after:absolute after:right-0 after:top-[-2px] after:h-[4px] after:w-[4px] after:rotate-45 after:border-r after:border-t after:border-[#9caf8d] after:content-[''] max-[900px]:min-w-[6px]" />
      <span className={`flex h-[54px] w-[54px] shrink-0 -rotate-6 items-center justify-center rounded-[13px] border border-[#cddfb7] bg-[linear-gradient(120deg,#fff,#e3efcf)] text-[#7f9d58] shadow-[0_8px_19px_-12px_#536d3c33] max-[900px]:h-[43px] max-[900px]:w-[43px] max-[900px]:rounded-[10px] ${index === 1 ? 'border-[#cbdce0] bg-[linear-gradient(120deg,#fff,#e2edf0)] text-[#7d96a0]' : ''}`}>
        <BrainCircuit size={25} strokeWidth={1.4} />
      </span>
      <span className="relative mx-0 h-px min-w-[10px] flex-1 max-w-[42px] bg-[linear-gradient(90deg,#d7e3ca,#a9c38e)] after:absolute after:right-0 after:top-[-2px] after:h-[4px] after:w-[4px] after:rotate-45 after:border-r after:border-t after:border-[#9caf8d] after:content-[''] max-[900px]:min-w-[6px]" />
      <span className={`flex min-w-[53px] flex-col items-center justify-center gap-[9px] rounded-[7px] border border-[#dce7cf] bg-[#fff9] p-[12px_9px] text-[#8ea278] max-[900px]:min-w-[43px] max-[900px]:p-[10px_6px] ${index === 1 ? 'border-[#d8e2e5] text-[#8a9ea5]' : ''}`}>
        <Layers3 size={19} strokeWidth={1.4} />
        <small className="whitespace-nowrap text-[12px]">{labels[index][1]}</small>
      </span>
      <span className="absolute bottom-[14px] font-[Arial,sans-serif] text-[12px] tracking-[1.4px] text-[#a2af94]">ILLUSTRATIVE WORKFLOW</span>
    </div>
  );
}

export default function SolutionPage({ data }: { data: Solution }) {
  const icons = [Workflow, BrainCircuit, Database];

  return (
    <>
      <PageSchema title={`${data.label} AI 解決方案`} description={data.description} path={`/solutions/${data.slug}`} faqs={data.faqs} />

      <main id="main">
        <section className="overflow-hidden bg-[radial-gradient(ellipse_at_80%_44%,#f0f7e8_0,transparent_52%),#fff]">
          <div className={containerClass}>
            <Breadcrumbs label={data.label} solution />
            <div className="grid min-h-[586px] grid-cols-[1.1fr_1fr] items-center gap-[50px] max-[1500px]:min-h-[615px] max-[1500px]:gap-[70px] max-[1100px]:min-h-[560px] max-[1100px]:gap-8 max-[900px]:min-h-0 max-[900px]:grid-cols-2 max-[900px]:gap-[27px] max-[700px]:grid-cols-1 max-[700px]:gap-0 max-[700px]:pt-[35px]">
              <div className="pb-5 max-[700px]:pb-0 max-[700px]:text-center">
                <p className="mb-[25px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[12px] tracking-[.15px] text-[#54624b] max-[900px]:text-[13px] max-[900px]:p-[5px_7px] max-[700px]:mb-[22px] max-[700px]:p-[5px_9px]">
                  <span className={onlineDotClass} />
                  {data.eyebrow}
                </p>
                <h1 className="text-[clamp(39px,3.65vw,51px)] font-bold leading-[1.5] tracking-[-1.5px] max-[1500px]:text-[55px] max-[1100px]:text-[40px] max-[1100px]:tracking-[-1.3px] max-[900px]:text-[34px] max-[900px]:tracking-[-1px] max-[700px]:text-[clamp(30px,7.4vw,43px)] max-[700px]:leading-[1.55] max-[700px]:tracking-[-1.1px] max-[370px]:text-[29px]">
                  {data.title[0]}
                  <br />
                  <span className="relative inline-block text-green">
                    {data.title[1]}
                    <svg viewBox="0 0 420 18" preserveAspectRatio="none" aria-hidden="true" className="absolute bottom-[-8px] left-0 h-[11px] w-[98%] fill-none stroke-lime opacity-70 [stroke-width:4] [stroke-linecap:round] max-[700px]:bottom-[-6px] max-[700px]:h-[9px]">
                      <path d="M4 12Q203 1 414 10" />
                    </svg>
                  </span>
                </h1>
                <p className="mt-[29px] max-w-[465px] text-[13px] leading-[2.15] text-[#747f6d] max-[1500px]:text-[14px] max-[1100px]:text-[12px] max-[900px]:text-[13px] max-[700px]:mx-auto max-[700px]:mt-[25px] max-[700px]:max-w-[380px] max-[700px]:text-[12px] max-[700px]:leading-[2.05] max-[370px]:text-[13px]">
                  {data.description}
                </p>
                <div className="mt-[26px] flex items-center gap-[11px] max-[900px]:gap-[10px] max-[700px]:mt-6 max-[700px]:justify-center max-[700px]:gap-[10px]">
                  <ConsultButton className="gap-[17px] p-[13px_18px] text-[12px] max-[1100px]:px-[15px] max-[1100px]:gap-3 max-[900px]:min-h-[44px] max-[900px]:px-3 max-[900px]:gap-[10px] max-[900px]:text-[12px] max-[700px]:min-h-[45px] max-[700px]:px-4 max-[700px]:gap-3 max-[700px]:text-[13px] max-[370px]:px-3 max-[370px]:gap-[10px] max-[370px]:text-[12px]" />
                </div>
                <p className="mt-[17px] flex items-center gap-[6px] text-[12px] text-[#86937b] max-[900px]:text-[13px] max-[900px]:leading-[1.9] max-[700px]:justify-center max-[700px]:gap-[5px] max-[700px]:text-[13px] max-[370px]:text-[12px]">
                  <Check size={13} className="text-green max-[700px]:h-3" />
                  {data.note}
                </p>
              </div>

              <WorkflowVisual data={data} />
            </div>
          </div>
        </section>

        <div className="border-y border-line bg-white">
          <div className={`${containerClass} grid min-h-[81px] grid-cols-4 items-center gap-[15px] max-[900px]:min-h-[70px]`}>
            {data.promises.map((item, index) => (
              <span key={item} className={`flex items-center justify-center gap-[9px] text-[13px] text-[#6c7c5c] max-[900px]:gap-[6px] max-[900px]:text-[12px] max-[370px]:gap-[5px] max-[370px]:text-[13px] ${index > 0 ? 'border-l border-[#e6ecdf]' : ''}`}>
                <Check size={14} className="text-[#7ca45c]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <section id="solutions" className={sectionClass}>
          <div className={containerClass}>
            <PageHeading eyebrow="START WITH THE REAL PROBLEM" title={data.pillarsTitle} intro={data.pillarsIntro} />
            <div className={threeGridClass}>
              {data.pillars.map((item, index) => {
                const Icon = icons[index];
                return (
                  <article className="flex flex-col rounded-[11px] border border-[#e4eadf] bg-white p-[26px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c6d8b6] hover:shadow-[0_12px_24px_-17px_#3b56282a] max-[1100px]:p-[23px] max-[900px]:p-[19px_17px] max-[370px]:p-[23px]" key={item.title}>
                    <div className="mb-[25px] flex items-center justify-between gap-3 max-[900px]:items-start max-[900px]:gap-2">
                      <span className="flex h-[47px] w-[47px] items-center justify-center rounded-[10px] bg-[#f1f6ed] text-[#638443] max-[900px]:h-9 max-[900px]:w-9 max-[900px]:shrink-0">
                        <Icon size={25} strokeWidth={1.4} className="max-[900px]:h-[21px]" />
                      </span>
                      <span className="text-[13px] tracking-[0.5px] text-[#9aa58e] max-[1100px]:text-[12px] max-[900px]:max-w-[75px] max-[900px]:text-right max-[900px]:text-[12px] max-[900px]:tracking-[0]">0{index + 1} / {item.label}</span>
                    </div>
                    <h3 className="text-[19px] font-[550] leading-[1.65] tracking-[-0.5px] max-[1100px]:text-[17px] max-[900px]:text-[15px] max-[370px]:text-[20px]">{item.title}</h3>
                    <p className="mb-[25px] mt-[15px] text-[12px] leading-[2] text-[#7e8975] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[900px]:leading-[2]">{item.text}</p>
                    <div className="mt-auto border-t border-[#e9efe2] pt-[17px]">
                      <span className="mb-[7px] block text-[13px] text-[#97a387]">可由這些工作開始</span>
                      <strong className="text-[12px] font-[450] text-[#738660] max-[900px]:text-[12px]">{item.examples}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="scenarios" className="border-y border-[#eaf0e3] bg-[#f7f9f5] py-[104px]">
          <div className={containerClass}>
            <PageHeading eyebrow="DESIGNED AROUND YOUR EVERYDAY" title={data.casesTitle} intro={data.casesIntro} />
            <div className={threeGridClass}>
              {data.cases.map((item, index) => (
                <article className="overflow-hidden rounded-[12px] border border-[#e0e8d9] bg-white" key={item.industry}>
                  <ScenarioDiagram index={index} slug={data.slug} />
                  <div className="p-[26px_24px] max-[1100px]:p-[22px_20px] max-[900px]:p-[19px_16px] max-[370px]:p-[22px]">
                    <span className="mb-3 block text-[12px] text-[#869b70] max-[900px]:text-[13px]">{item.industry}</span>
                    <h3 className="text-[18px] font-[550] leading-[1.7] tracking-[-0.55px] max-[1100px]:text-[16px] max-[900px]:text-[15px] max-[370px]:text-[18px]">{item.title}</h3>
                    <p className="mt-3 text-[13px] leading-[1.95] text-[#838d7b] max-[900px]:text-[12px]">{item.text}</p>
                    <ul className="mt-3 flex list-none flex-col gap-2 p-0">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-[13px] leading-[1.8] text-[#5d7250] max-[1100px]:text-[12px] max-[900px]:text-[13px] max-[370px]:text-[12px]">
                          <Check size={13} className="mt-1 shrink-0 text-[#8db16c]" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-6 text-center text-[12px] text-[#8e9a81]">
              以上為應用示例，並非已完成客戶案例或成效保證。實際可行性、準確性及改善幅度，須按資料質素、系統限制與試點結果評估。
            </p>
          </div>
        </section>

        <section id="transfer" className="py-[83px]">
          <div className={containerClass}>
            <div className="grid grid-cols-2 items-center gap-20 max-[1100px]:gap-[55px] max-[900px]:gap-[35px] max-[700px]:grid-cols-1">
              <div>
                <Eyebrow>BUILD CAPABILITY, NOT DEPENDENCY</Eyebrow>
                <h2 className="text-[30px] tracking-[-0.8px]">
                  {data.transferTitle[0]}
                  <br />
                  <span className="text-green-dark">{data.transferTitle[1]}</span>
                </h2>
                {data.transferText.map((text) => (
                  <p key={text} className="mt-[21px] max-w-[475px] text-[12px] leading-[2.1] text-[#7d8972] max-[1100px]:text-[13px]">{text}</p>
                ))}
              </div>

              <div className="rounded-[13px] border border-[#233650] bg-[#172642] p-[25px] text-white shadow-[0_20px_40px_-27px_#17264240] max-[1100px]:p-[23px] max-[370px]:p-5">
                <div className="flex items-center justify-between gap-2 border-b border-[#ffffff14] pb-5">
                  <span className="flex items-center gap-2 text-[13px] text-[#d2dec8]">
                    <GraduationCap size={17} className="text-[#b4ce91]" />
                    {data.slug === 'enterprise' ? '從治理到承接' : '讓能力留在你的團隊'}
                  </span>
                  <small className="font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#839178] max-[1100px]:text-[13px] max-[370px]:text-[4px]">THE HANGS APPROACH</small>
                </div>
                {data.transfer.map((item, index) => (
                  <div className="flex items-center gap-[15px] border-b border-[#ffffff12] py-6" key={item.title}>
                    <span className="self-start pt-[2px] font-[Arial,sans-serif] text-[18px] font-normal leading-[1.3] text-[#b3ce89]">0{index + 1}</span>
                    <div>
                      <h3 className="text-[14px] font-[450] leading-[1.6] text-[#e9f0e2] max-[370px]:text-[12px]">{item.title}</h3>
                      <p className="mt-[7px] text-[12px] leading-[1.9] text-[#a0adc0] max-[370px]:text-[12px]">{item.text}</p>
                    </div>
                    <CircleCheck size={18} className="ml-auto w-4 text-[#a0b984]" />
                  </div>
                ))}
                <div className="mt-[19px] flex items-center gap-[6px] text-[13px] leading-[1.9] text-[#a1b195] max-[370px]:text-[12px]">
                  <ShieldCheck size={14} />
                  可自行處理與需技術支援的範圍，清楚約定。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="border-t border-[#e9efe2] py-[104px]">
          <div className={containerClass}>
            <PageHeading eyebrow="PROVE THE VALUE. THEN MOVE FORWARD." title={data.processTitle} intro={data.processIntro} />
            <PageProcess steps={data.steps} />
          </div>
        </section>

        <section id="engagement" className="border-y border-[#eaf0e4] bg-[#f8faf6] py-[104px]">
          <div className={containerClass}>
            <PageHeading eyebrow="A WAY OF WORKING THAT FITS YOU" title={data.modesTitle} intro={data.modesIntro} />
            <div className={threeGridClass}>
              {data.modes.map((mode, index) => (
                <article className={`relative flex flex-col rounded-[12px] border bg-white p-[27px] max-[1100px]:p-[23px] max-[370px]:p-[23px] ${index === 1 ? 'border-[#c4d9a4] bg-[linear-gradient(150deg,#edf5df,#f9fcf4)] shadow-[0_12px_27px_-22px_#50733040] before:absolute before:left-6 before:right-6 before:top-[-1px] before:h-[3px] before:rounded-[2px] before:bg-[linear-gradient(90deg,var(--color-green),var(--color-lime))] before:content-[\"\"]' : 'border-[#e2e9da]'}`} key={mode.title}>
                  <span className={`mb-5 self-start rounded-[4px] border border-[#e7eddf] bg-[#f7f9f3] p-[5px_8px] text-[12px] text-[#839571] ${index === 1 ? 'border-[#d8e8c3] bg-[#fff9] text-[#6b8950]' : ''}`}>{mode.label}</span>
                  <h3 className="text-[20px] font-[550] leading-[1.55] tracking-[-0.5px] max-[1100px]:text-[18px] max-[370px]:text-[20px]">{mode.title}</h3>
                  <p className="mt-[15px] text-[13px] leading-[2] text-[#839077]">{mode.text}</p>
                  <ul className="my-[25px] flex list-none flex-col gap-3 p-0">
                    {mode.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-[13px] leading-[1.8] text-[#728561] max-[1100px]:text-[12px]">
                        <Check size={14} className="mt-[3px] text-[#8bad67]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto border-t border-[#e3ecd8] pt-[17px]">
                    <span className="mb-4 block text-[12px] leading-[1.9] text-[#8b9b7d]">{mode.foot}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-[30px] flex items-center justify-between gap-[22px] border-t border-[#e4ecd9] pt-[23px]">
              <span className="text-[12px] text-[#8a9a7b]">按需要選用技術，而非為了技術而技術</span>
              <div className="flex flex-wrap gap-2">
                {data.technologies.map((tech) => (
                  <span key={tech} className="rounded-[4px] border border-[#e2ead8] bg-white p-[4px_8px] text-[13px] text-[#8b9b7c]">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PageFAQ items={data.faqs} />
        <PageCTA title={data.ctaTitle} text={data.ctaText} checklist={data.contactList} />
        <RelatedSolutions current={data.slug} />

      </main>
    </>
  );
}
