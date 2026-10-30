import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, CircleCheck } from 'lucide-react';
import type { ServiceCategory, ServiceDetail } from '@/lib/service-catalog';
import { ConsultButton } from './site-shell';
import { PageFAQ, PageSchema, PageProcess } from './page-blocks';
import { categoryIcons } from './catalog-icons';
import { containerClass, sectionClass, buttonClass, buttonSecondaryClass, buttonNavyClass, sectionLabelClass, sectionLabelDotClass, onlineDotClass } from '@/lib/ui';

const serviceFaqs = [
  { question: '這項服務如何報價？', answer: '報價按範圍、資料質素、整合難度、培訓及支援要求制定。免費諮詢後會提供方案與費用，進入實作前再確認詳細範圍。' },
  { question: '免費諮詢是否包括試做或培訓？', answer: '免費諮詢用於初步了解需求與方向，不等於免費開發、試點或正式培訓。實作、試點及培訓會另行報價。' },
];

const sectionGridClass =
  'grid grid-cols-[340px_1fr] gap-[70px] max-[1100px]:gap-[45px] max-[900px]:grid-cols-[280px_1fr] max-[900px]:gap-[35px] max-[700px]:grid-cols-1 max-[700px]:gap-[22px]';

export default function ServiceDetailPage({ category, service }: { category: ServiceCategory; service: ServiceDetail }) {
  const Icon = categoryIcons[category.icon];
  const siblings = category.services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <PageSchema
        title={`${service.title}｜${category.title}｜實瀚科技`}
        description={service.intro}
        path={`/services/${category.slug}/${service.slug}`}
        faqs={[...service.faqs, ...serviceFaqs]}
        breadcrumb={[{ name: '首頁', path: '/' }, { name: '服務介紹', path: '/services' }, { name: category.title, path: `/services/${category.slug}` }, { name: service.title }]}
      />

      <main id="main">
        <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_78%_44%,#f1f7ea_0,transparent_54%),#fff]">
          <div className={containerClass}>
            <nav className="flex items-center gap-[11px] pt-[28px] text-[12px] text-[#8c9686]" aria-label="麵包屑導覽">
              <Link href="/" className="hover:text-green-dark">首頁</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <Link href="/services" className="hover:text-green-dark">服務介紹</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <Link href={`/services/${category.slug}`} className="hover:text-green-dark">{category.title}</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">{service.title}</span>
            </nav>

            <div className="grid grid-cols-[1.3fr_1fr] items-center gap-[55px] p-[36px_0_58px] max-[1100px]:gap-[38px] max-[900px]:gap-[27px] max-[700px]:grid-cols-1 max-[700px]:gap-[26px] max-[700px]:p-[30px_0_44px] max-[700px]:text-center">
              <div>
                <p className="mb-[26px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[11px] text-[#54624b]">
                  <span className={onlineDotClass} />
                  {service.english}
                </p>
                <h1 className="flex items-center gap-[18px] text-[clamp(37px,3.2vw,46px)] font-bold leading-[1.4] tracking-[-1.3px] max-[1100px]:text-[37px] max-[900px]:gap-[14px] max-[900px]:text-[32px] max-[700px]:justify-center max-[700px]:gap-[14px] max-[700px]:text-[clamp(27px,6.8vw,38px)]">
                  <span className="inline-flex h-[63px] w-[63px] shrink-0 items-center justify-center rounded-[14px] border border-[#dbe8c5] bg-[linear-gradient(135deg,#fff,#eaf3da)] text-[#7ca04f] max-[1100px]:h-[54px] max-[1100px]:w-[54px] max-[900px]:h-[48px] max-[900px]:w-[48px] max-[700px]:h-[46px] max-[700px]:w-[46px]">
                    <Icon size={30} strokeWidth={1.4} />
                  </span>
                  {service.title}
                </h1>
                <p className="mt-[22px] text-[16px] font-medium text-[#5c7a41] max-[900px]:text-[14px] max-[700px]:mt-[18px] max-[700px]:text-[15px]">{service.tagline}</p>
                <p className="mt-[27px] max-w-[520px] text-[14px] leading-[2.05] text-[#738266] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[700px]:text-left max-[700px]:text-[13px]">{service.intro}</p>
                <div className="mt-[29px] flex items-center gap-3 max-[700px]:justify-center">
                  <ConsultButton className="gap-[17px] p-[14px_19px] text-[12px]" />
                  <a href="#capabilities" className={`${buttonClass} ${buttonSecondaryClass} gap-[17px] p-[14px_19px] text-[12px]`}>
                    了解服務內容
                    <ArrowDown size={16} />
                  </a>
                </div>
              </div>

              <aside className="rounded-[12px] border border-[#dfe8d3] bg-white p-[29px] shadow-[0_20px_45px_-28px_#3c582929] max-[1100px]:p-[24px] max-[900px]:p-5 max-[700px]:p-6 max-[700px]:text-left">
                <span className="font-[Arial,sans-serif] text-[8px] tracking-[1.5px] text-[#96a785]">AT A GLANCE</span>
                <h2 className="mt-[9px] text-[19px] font-[550] leading-[1.6] tracking-[-0.4px] max-[900px]:text-[17px] max-[700px]:text-[18px]">它主要解決的問題</h2>
                <p className="mt-[13px] text-[13px] leading-[2] text-[#7f8d72] max-[900px]:text-[12px] max-[700px]:text-[13px]">{service.problem}</p>
                <ul className="mt-[19px] flex list-none flex-col gap-[11px] border-t border-[#e9efe2] p-0 pt-[18px]">
                  {service.benefits.slice(0, 3).map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-[13px] leading-[1.9] text-[#6d825d] max-[900px]:text-[12px] max-[700px]:text-[13px]">
                      <Check size={14} className="mt-[4px] shrink-0 text-[#8db16c]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <div className={sectionGridClass}>
              <div>
                <p className={sectionLabelClass}><span className={sectionLabelDotClass} />WHAT YOU GAIN</p>
                <h2 className="text-[30px] leading-[1.6] tracking-[-0.7px] max-[900px]:text-[26px] max-[700px]:text-[28px]">它能為你帶來甚麼？</h2>
                <p className="mt-4 max-w-[300px] text-[14px] leading-[2] text-[#7f8d72] max-[700px]:max-w-none max-[700px]:text-[13px]">不是多一個工具，而是可衡量的工作改善。</p>
              </div>
              <ul className="grid list-none grid-cols-2 gap-4 p-0 max-[1100px]:gap-3 max-[900px]:grid-cols-1 max-[700px]:gap-3">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-[14px] rounded-[9px] border border-[#e1e9d8] bg-white p-5 max-[1100px]:p-[17px] max-[700px]:p-[18px]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eaf3da] text-[#7fa650] max-[700px]:h-9 max-[700px]:w-9">
                      <CircleCheck size={18} />
                    </span>
                    <p className="text-[13px] leading-[1.85] text-[#5d7250] max-[900px]:text-[12px] max-[700px]:text-[13px]">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="capabilities" className="border-y border-[#e9efe2] bg-[#f7f9f5] py-[104px]">
          <div className={containerClass}>
            <div className={sectionGridClass}>
              <div>
                <p className={sectionLabelClass}><span className={sectionLabelDotClass} />WHAT WE CAN DO</p>
                <h2 className="text-[30px] leading-[1.6] tracking-[-0.7px] max-[900px]:text-[26px] max-[700px]:text-[28px]">這項服務包含甚麼？</h2>
                <p className="mt-4 max-w-[300px] text-[14px] leading-[2] text-[#7f8d72] max-[700px]:max-w-none max-[700px]:text-[13px]">範圍會按你的實際需要組合，並非每次都全部採用。</p>
              </div>
              <div className="grid grid-cols-2 gap-[14px] max-[700px]:grid-cols-1">
                {service.capabilities.map((capability) => (
                  <article className="flex items-center gap-[14px] rounded-[9px] border border-[#e1e9d8] bg-white p-[21px] max-[1100px]:p-[17px] max-[700px]:p-[19px]" key={capability}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eef4e5] text-[#81a356]">
                      <Icon size={19} strokeWidth={1.5} />
                    </span>
                    <p className="text-[13px] leading-[1.75] text-[#5d7250] max-[900px]:text-[12px] max-[700px]:text-[13px]">{capability}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <div className={sectionGridClass}>
              <div>
                <p className={sectionLabelClass}><span className={sectionLabelDotClass} />HOW IT ROLLS OUT</p>
                <h2 className="text-[30px] leading-[1.6] tracking-[-0.7px] max-[900px]:text-[26px] max-[700px]:text-[28px]">導入流程與節奏</h2>
                <p className="mt-4 max-w-[300px] text-[14px] leading-[2] text-[#7f8d72] max-[700px]:max-w-none max-[700px]:text-[13px]">先理解、再驗證、後接手，避免一次過投入造成風險。</p>
              </div>
            </div>
            <div className="mt-[30px]">
              <PageProcess steps={service.workflow} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <div className={sectionGridClass}>
              <div>
                <p className={sectionLabelClass}><span className={sectionLabelDotClass} />WHO IT FITS</p>
                <h2 className="text-[30px] leading-[1.6] tracking-[-0.7px] max-[900px]:text-[26px] max-[700px]:text-[28px]">它適合誰？</h2>
                <p className="mt-4 max-w-[300px] text-[14px] leading-[2] text-[#7f8d72] max-[700px]:max-w-none max-[700px]:text-[13px]">如果符合以下情況，這項服務對你較容易產生價值。</p>
              </div>
              <ul className="flex list-none flex-col gap-[14px] p-0">
                {service.fit.map((item) => (
                  <li key={item} className="flex items-center gap-[10px] text-[14px] leading-[1.8] text-[#5d7250] max-[900px]:text-[13px] max-[700px]:text-[14px]">
                    <Check size={14} className="shrink-0 text-[#8db16c]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <PageFAQ items={[...service.faqs, ...serviceFaqs]} />

        <section className="pb-[40px] max-[370px]:pb-[30px]">
          <div className={containerClass}>
            <div className="grid grid-cols-[1.1fr_1fr] items-center gap-[70px] rounded-[16px] border border-[#e1eacb] bg-[linear-gradient(105deg,#f0f6e5_0%,#edf5dc_55%,#e6f0cc_100%)] p-[48px] max-[1100px]:gap-[43px] max-[1100px]:p-[38px] max-[900px]:gap-[30px] max-[900px]:p-[31px] max-[700px]:grid-cols-1 max-[700px]:gap-[29px] max-[700px]:px-6 max-[700px]:py-[30px] max-[370px]:px-5 max-[370px]:py-[27px]">
              <div className="relative z-[2]">
                <p className={sectionLabelClass}><span className={sectionLabelDotClass} />TAKE THE NEXT STEP</p>
                <h2 className="text-[32px] font-[650] leading-[1.5] tracking-[-1px] max-[1100px]:text-[28px] max-[900px]:text-[25px] max-[700px]:text-[27px] max-[700px]:leading-[1.6] max-[370px]:text-[23px]">
                  想了解{service.title}，
                  <br />
                  我們先聽你的想法。
                </h2>
                <p className="mt-[17px] max-w-[435px] text-[12px] leading-[2] text-[#7e8b6e] max-[1100px]:text-[13px] max-[700px]:max-w-none">
                  把問題說清楚，一起判斷這項服務是否適合，或需要結合其他能力。
                </p>
                <ConsultButton className={`${buttonClass} ${buttonNavyClass} mt-[25px] min-h-[45px] gap-[31px] px-5 text-[12px]`} />
                <span className="mt-[11px] block max-w-[400px] text-[13px] leading-[1.9] text-[#929e80]">初步諮詢免費；開發、試點及培訓另行評估報價。</span>
              </div>

              <aside className="relative rounded-[10px] border border-[#d7e5bf] bg-[#fcfff78c] p-[26px]">
                <span className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-[#eaf3db] text-[#81a453]">
                  <Icon size={22} strokeWidth={1.4} />
                </span>
                <h3 className="text-[13px] font-medium">初步聯絡，可以先告訴我們</h3>
                <ol className="my-4 flex list-none flex-col gap-3 p-0">
                  {category.checklist.map((item, index) => (
                    <li key={item} className="flex items-center gap-3 text-[13px] leading-[1.8] text-[#768665]">
                      <span className="font-[Arial,sans-serif] text-[13px] text-[#a0b387]">0{index + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
                <p className="flex items-start gap-[6px] border-t border-[#dfe9cc] pt-[14px] text-[13px] leading-[1.9] text-[#92a080]">
                  <Check size={14} className="mt-[1px]" />
                  請勿附上個人資料、帳戶密碼或機密文件。
                </p>
              </aside>
            </div>
          </div>
        </section>

        <div className={`${containerClass} pb-12`}>
          <span className="mb-[15px] block text-[12px] text-[#8a997e]">同類其他服務</span>
          <div className="grid grid-cols-3 gap-4">
            {siblings.map((item) => (
              <Link key={item.slug} href={`/services/${category.slug}/${item.slug}`} className="flex items-center justify-between gap-[10px] rounded-[8px] border border-[#e7eddf] p-5 transition-[background,border-color] duration-200 hover:border-[#cadcb5] hover:bg-[#f7faef]">
                <span>
                  <strong className="block text-[12px] font-medium">{item.title}</strong>
                  <small className="mt-1 block text-[12px] text-[#8e9c81]">{item.tagline}</small>
                </span>
                <ArrowUpRight size={17} className="text-[#8fa779]" />
              </Link>
            ))}
            {siblings.length < 2 && (
              <Link href={`/services/${category.slug}`} className="flex items-center justify-between gap-[10px] rounded-[8px] border border-[#e7eddf] p-5 transition-[background,border-color] duration-200 hover:border-[#cadcb5] hover:bg-[#f7faef]">
                <span>
                  <strong className="block text-[12px] font-medium">回到{category.title}</strong>
                  <small className="mt-1 block text-[12px] text-[#8e9c81]">查看此分類所有服務</small>
                </span>
                <ArrowUpRight size={17} className="text-[#8fa779]" />
              </Link>
            )}
          </div>
        </div>

        <div className="-mt-4 pb-9 text-center text-[12px] text-[#8e9e80]">
          <Link href={`/services/${category.slug}`} className="inline-flex items-center gap-[7px]">回到{category.title}<ArrowUpRight size={13} /></Link>
        </div>
      </main>
    </>
  );
}
