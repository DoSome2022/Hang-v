import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Plus,
  ShieldCheck,
  MessageSquareText
} from 'lucide-react';
import { ConsultButton } from './site-shell';
import { company, siteUrl } from '@/lib/site';
import type { FAQ } from '@/lib/solutions';
import {
  containerClass,
  sectionLabelClass,
  sectionLabelDotClass,
  miniLabelClass,
  buttonClass,
  buttonNavyClass
} from '@/lib/ui';

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className={sectionLabelClass}>
      <span className={sectionLabelDotClass} />
      {children}
    </p>
  );
}

export function PageHeading({
  eyebrow,
  title,
  intro
}: {
  eyebrow: string;
  title: [string, string];
  intro: string;
}) {
  return (
    <div className="mb-[42px] flex items-end justify-between gap-[35px]">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>
          {title[0]}
          <br />
          {title[1]}
        </h2>
      </div>
      <p className="max-w-[355px] pb-[5px] text-[13px] leading-[2.05] text-[#77816f]">
        {intro}
      </p>
    </div>
  );
}

export function Breadcrumbs({
  label,
  solution = false
}: {
  label: string;
  solution?: boolean;
}) {
  return (
    <nav
      className="flex items-center gap-[11px] pt-[28px] text-[12px] text-[#8c9686]"
      aria-label="麵包屑導覽"
    >
      <Link href="/" className="hover:text-green-dark">
        首頁
      </Link>
      <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">
        /
      </span>
      {solution && (
        <>
          <span>解決方案</span>
          <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">
            /
          </span>
        </>
      )}
      <span aria-current="page" className="text-[#55694b]">
        {label}
      </span>
    </nav>
  );
}

export function PageSchema({
  title,
  description,
  path,
  faqs,
  breadcrumb
}: {
  title: string;
  description: string;
  path: string;
  faqs: readonly FAQ[];
  breadcrumb?: { name: string; path?: string }[];
}) {
  const url = siteUrl ? `${siteUrl}${path}` : undefined;
  const providerId = siteUrl ? `${siteUrl}/#organization` : '/#organization';
  const crumbs = breadcrumb ?? [
    { name: '首頁', path: '/' },
    { name: title }
  ];

  const graph = [
    {
      '@type': 'Organization',
      '@id': providerId,
      name: company.name,
      alternateName: company.englishName,
      foundingDate: '2023',
      ...(siteUrl ? { url: siteUrl, logo: `${siteUrl}/icon.svg` } : {})
    },
    {
      '@type': 'WebPage',
      name: title,
      description,
      inLanguage: 'zh-Hant',
      ...(url ? { url } : {}),
      publisher: { '@id': providerId }
    },
    {
      '@type': 'Service',
      name: title,
      description,
      areaServed: 'Hong Kong',
      provider: { '@id': providerId },
      ...(url ? { url } : {})
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        ...(crumb.path && siteUrl ? { item: `${siteUrl}${crumb.path}` } : {})
      }))
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph
        }).replace(/</g, '\\u003c')
      }}
    />
  );
}

export function PageFAQ({ items }: { items: readonly FAQ[] }) {
  return (
    <section
      id="faq"
      className="border-t border-line pb-[91px] pt-[82px] max-[1100px]:pb-20 max-[1100px]:pt-20"
    >
      <div
        className={`${containerClass} grid grid-cols-[1fr_1.65fr] gap-[87px] max-[1100px]:grid-cols-[1fr_1.6fr] max-[1100px]:gap-[55px] max-[900px]:grid-cols-[1fr_1.6fr] max-[900px]:gap-[35px] max-[700px]:grid-cols-1 max-[700px]:gap-[28px]`}
      >
        <div className="faq-heading">
          <Eyebrow>A LITTLE MORE CLARITY</Eyebrow>
          <h2 className="text-[30px] tracking-[-0.8px] max-[1100px]:text-[27px] max-[900px]:text-[24px] max-[700px]:text-[26px]">
            開始之前，
            <br />
            你可能想知道。
          </h2>
          <p className="mt-[19px] text-[13px] leading-[1.95] text-[#858d81] max-[700px]:mt-[12px]">
            先說清楚範圍、責任與限制，
            <br className="max-[700px]:hidden" />
            合作才更容易落地。
          </p>
          <div
            className="relative mt-[36px] flex h-[100px] w-[128px] items-center justify-center bg-[radial-gradient(#eef5e5,transparent_68%)] text-[#a6bb92] max-[700px]:hidden"
            aria-hidden="true"
          >
            <MessageSquareText size={47} strokeWidth={1} className="-rotate-[10deg]" />
            <span className="absolute right-2 top-0 flex h-[30px] w-[30px] rotate-[12deg] items-center justify-center rounded-full border border-[#e1e9d7] bg-white font-[Arial,sans-serif] text-[18px]">
              ?
            </span>
            <i className="absolute left-[15px] top-[17px] h-[4px] w-[4px] rounded-full bg-lime" />
          </div>
        </div>

        <div className="border-t border-[#dfe6d8]">
          {items.map((faq, index) => (
            <details className="group border-b border-[#e8ede2]" key={faq.question}>
              <summary className="group/summary flex cursor-pointer list-none items-center gap-[16px] py-[21px] [&::-webkit-details-marker]:hidden max-[900px]:gap-[12px] max-[700px]:gap-[11px] max-[700px]:py-[19px]">
                <span className="self-start pt-1 font-[Arial,sans-serif] text-[12px] text-[#a1ae92]">
                  0{index + 1}
                </span>
                <h3 className="flex-1 text-[13px] font-[450] leading-[1.9] text-wrap-[initial] group-open:text-green-dark group-hover/summary:text-green-dark max-[900px]:text-[12px]">
                  {faq.question}
                </h3>
                <Plus
                  size={18}
                  className="text-[#89987c] transition-transform duration-200 group-open:rotate-45 group-open:text-green"
                />
              </summary>
              <div className="px-8 pb-[23px] group-open:[animation:appear_.25s_both]">
                <p className="text-[12px] leading-[2.1] text-[#7f8877]">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageCTA({
  title,
  text,
  checklist
}: {
  title: [string, string];
  text: string;
  checklist: string[];
}) {
  return (
    <section id="contact" className="pb-[40px] max-[370px]:pb-[30px]">
      <div className={containerClass}>
        <div className="grid grid-cols-[1.1fr_1fr] items-center gap-[70px] rounded-[16px] border border-[#e1eacb] bg-[linear-gradient(105deg,#f0f6e5_0%,#edf5dc_55%,#e6f0cc_100%)] p-[48px] max-[1100px]:gap-[43px] max-[1100px]:p-[38px] max-[900px]:gap-[30px] max-[900px]:p-[31px] max-[700px]:grid-cols-1 max-[700px]:gap-[29px] max-[700px]:px-6 max-[700px]:py-[30px] max-[370px]:px-5 max-[370px]:py-[27px]">
          <div className="relative z-[2]">
            <Eyebrow>ONE CONVERSATION. A CLEARER NEXT STEP.</Eyebrow>
            <h2 className="text-[32px] font-[650] leading-[1.5] tracking-[-1px] max-[1100px]:text-[28px] max-[900px]:text-[25px] max-[700px]:text-[27px] max-[700px]:leading-[1.6] max-[370px]:text-[23px]">
              {title[0]}
              <br />
              {title[1]}
            </h2>
            <p className="mt-[17px] max-w-[435px] text-[12px] leading-[2] text-[#7e8b6e] max-[1100px]:text-[13px] max-[700px]:max-w-none">
              {text}
            </p>
            <ConsultButton className={`${buttonClass} ${buttonNavyClass} mt-[25px] min-h-[45px] gap-[31px] px-5 text-[12px]`} />
            <span className="mt-[11px] block max-w-[400px] text-[13px] leading-[1.9] text-[#929e80] max-[700px]:mt-[17px]">
              初步諮詢免費；開發、試點及培訓另行評估報價。
            </span>
          </div>

          <aside className="relative rounded-[10px] border border-[#d7e5bf] bg-[#fcfff78c] p-[26px]">
            <span className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-[#eaf3db] text-[#81a453]">
              <MessageSquareText size={22} strokeWidth={1.4} />
            </span>
            <h3 className="text-[13px] font-medium">初步聯絡，可以先告訴我們</h3>
            <ol className="my-4 flex list-none flex-col gap-3 p-0">
              {checklist.map((item, index) => (
                <li key={item} className="flex items-center gap-3 text-[13px] leading-[1.8] text-[#768665]">
                  <span className="font-[Arial,sans-serif] text-[13px] text-[#a0b387]">
                    0{index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <p className="flex items-start gap-[6px] border-t border-[#dfe9cc] pt-[14px] text-[13px] leading-[1.9] text-[#92a080]">
              <ShieldCheck size={14} className="mt-[1px]" />
              請勿附上個人資料、帳戶密碼或機密文件。
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function PageProcess({
  steps
}: {
  steps: { title: string; text: string; output?: string }[];
}) {
  return (
    <ol className="grid list-none grid-cols-4 gap-[35px] p-0 m-0 max-[1100px]:gap-[25px] max-[900px]:gap-[19px] max-[700px]:grid-cols-2 max-[700px]:gap-x-[23px] max-[700px]:gap-y-8">
      {steps.map((step, index) => (
        <li className="process-step" key={step.title}>
          <div className="mb-[25px] flex items-center gap-[17px] max-[700px]:mb-4 max-[700px]:gap-3">
            <span className="font-[Arial,sans-serif] text-[30px] font-normal tracking-[-1.5px] text-[#9eaf8f] max-[700px]:text-[28px]">
              0{index + 1}
            </span>
            <span className="h-px flex-1 bg-[#e4eadd]" />
            <ArrowRight size={15} className="text-[#b1bda5] max-[700px]:hidden" />
          </div>
          <span className={`${miniLabelClass} text-[13px] tracking-[1.8px] text-[#9aa78f] max-[700px]:text-[12px] max-[700px]:tracking-[1.5px]`}>
            STEP 0{index + 1}
          </span>
          <h3 className="mt-[9px] text-[16px] font-[550] tracking-[-0.2px] max-[1100px]:text-[14px] max-[900px]:text-[13px] max-[700px]:mt-2 max-[700px]:text-[13px] max-[700px]:leading-[1.75]">
            {step.title}
          </h3>
          <p className="mt-[13px] max-w-[230px] text-[12px] leading-[1.95] text-[#858e7e] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[700px]:mt-[9px] max-[700px]:max-w-none max-[700px]:leading-[2]">
            {step.text}
          </p>
          {step.output && (
            <span className="mt-[21px] flex max-w-[220px] items-center gap-[5px] border-t border-[#edf0e8] pt-[14px] text-[12px] text-[#74896a] max-[900px]:text-[13px] max-[900px]:gap-[3px] max-[700px]:max-w-none max-[700px]:gap-1 max-[700px]:pt-3">
              <Check size={13} className="max-[700px]:w-[11px]" />
              {step.output}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function RelatedSolutions({ current }: { current?: string }) {
  const links = [
    { slug: 'solo', label: '一人公司', text: '讓 AI 成為你的日常助手' },
    { slug: 'sme', label: '中小企業', text: '接通流程，培養團隊能力' },
    { slug: 'enterprise', label: '企業團隊', text: '把治理與擴展一起規劃' }
  ];

  return (
    <div className={`${containerClass} pb-12`}>
      <span className="mb-[15px] block text-[12px] text-[#8a997e]">
        另一個起點，也可能適合你。
      </span>
      <div className="grid grid-cols-3 gap-4">
        {links
          .filter((item) => item.slug !== current)
          .map((item) => (
            <Link
              key={item.slug}
              href={`/solutions/${item.slug}`}
              className="flex items-center justify-between gap-[10px] rounded-[8px] border border-[#e7eddf] p-5 transition-[background,border-color] duration-200 hover:border-[#cadcb5] hover:bg-[#f7faef]"
            >
              <span>
                <strong className="block text-[12px] font-medium">{item.label}</strong>
                <small className="mt-1 block text-[12px] text-[#8e9c81]">{item.text}</small>
              </span>
              <ArrowUpRight size={17} className="text-[#8fa779]" />
            </Link>
          ))}

        {current && (
          <Link
            href="/services"
            className="flex items-center justify-between gap-[10px] rounded-[8px] border border-[#e7eddf] p-5 transition-[background,border-color] duration-200 hover:border-[#cadcb5] hover:bg-[#f7faef]"
          >
            <span>
              <strong className="block text-[12px] font-medium">服務介紹</strong>
              <small className="mt-1 block text-[12px] text-[#8e9c81]">從技術到交付，一次了解</small>
            </span>
            <ArrowUpRight size={17} className="text-[#8fa779]" />
          </Link>
        )}
      </div>
    </div>
  );
}
