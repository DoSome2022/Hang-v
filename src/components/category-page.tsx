import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type { ServiceCategory } from '@/lib/service-catalog';
import { categories } from '@/lib/service-catalog';
import { ConsultButton } from './site-shell';
import { categoryIcons } from './catalog-icons';
import { PageHeading, PageFAQ, PageCTA, PageSchema, PageProcess } from './page-blocks';
import { containerClass, sectionClass, buttonClass, buttonSecondaryClass, onlineDotClass } from '@/lib/ui';

const categoryFaqs = [
  { question: '這個分類下的服務可以混合選用嗎？', answer: '可以。分類是為了方便你瀏覽，實際方案常結合多項能力。我們會先了解你的工作流程，再建議真正需要的組合，而非硬套單一服務。' },
  { question: '如何決定先從哪一項服務開始？', answer: '從最花時間、規則最清晰、有負責人的工作開始，成效較易衡量。免費諮詢可以協助你判斷優先順序。' },
  { question: '收費是否包括第三方平台及長期維護？', answer: '報價會列明開發、配置、培訓、雲端、模型用量及第三方訂閱的包含範圍。長期維護與支援通常按需求另行約定。' },
];

const catalogCardClass =
  'flex flex-col rounded-[12px] border border-[#e1e9d8] bg-white p-[31px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c6d8b6] hover:shadow-[0_15px_28px_-20px_#3c582824] max-[1100px]:p-[26px] max-[900px]:p-[22px] max-[700px]:p-[25px]';

export default function CategoryPage({ category }: { category: ServiceCategory }) {
  const Icon = categoryIcons[category.icon];
  const otherCategories = categories.filter((item) => item.slug !== category.slug);

  return (
    <>
      <PageSchema
        title={`${category.title}｜服務介紹`}
        description={category.description}
        path={`/services/${category.slug}`}
        faqs={categoryFaqs}
        breadcrumb={[{ name: '首頁', path: '/' }, { name: '服務介紹', path: '/services' }, { name: category.title }]}
      />

      <main id="main">
        <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_78%_46%,#f1f7ea_0,transparent_54%),#fff]">
          <div className={containerClass}>
            <nav className="flex items-center gap-[11px] pt-[28px] text-[12px] text-[#8c9686]" aria-label="麵包屑導覽">
              <Link href="/" className="hover:text-green-dark">首頁</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <Link href="/services" className="hover:text-green-dark">服務介紹</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">{category.title}</span>
            </nav>

            <div className="grid grid-cols-[1.25fr_1fr] items-center gap-[55px] p-[34px_0_54px] max-[1100px]:gap-[38px] max-[900px]:gap-[27px] max-[700px]:grid-cols-1 max-[700px]:gap-[26px] max-[700px]:p-[30px_0_40px] max-[700px]:text-center">
              <div>
                <p className="mb-[27px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[11px] tracking-[.2px] text-[#54624b]">
                  <span className={onlineDotClass} />
                  {category.english}
                </p>
                <h1 className="flex items-center gap-[19px] text-[clamp(38px,3.3vw,48px)] font-bold leading-[1.4] tracking-[-1.4px] max-[1100px]:text-[38px] max-[900px]:gap-[15px] max-[900px]:text-[33px] max-[700px]:justify-center max-[700px]:gap-[14px] max-[700px]:text-[clamp(28px,7vw,40px)]">
                  <span className="inline-flex h-[63px] w-[63px] shrink-0 items-center justify-center rounded-[14px] border border-[#dbe8c5] bg-[linear-gradient(135deg,#fff,#eaf3da)] text-[#7ca04f] max-[1100px]:h-[54px] max-[1100px]:w-[54px] max-[900px]:h-[48px] max-[900px]:w-[48px] max-[700px]:h-[46px] max-[700px]:w-[46px]">
                    <Icon size={30} strokeWidth={1.4} />
                  </span>
                  {category.title}
                </h1>
                <p className="mt-[27px] max-w-[520px] text-[14px] leading-[2.05] text-[#738266] max-[1100px]:text-[13px] max-[900px]:text-[12px] max-[700px]:mx-auto max-[700px]:mt-[22px] max-[700px]:max-w-[390px] max-[700px]:text-[13px] max-[700px]:leading-[2]">
                  {category.intro}
                </p>
                <div className="mt-[29px] flex items-center gap-3 max-[700px]:mt-[25px] max-[700px]:justify-center">
                  <ConsultButton className="gap-[17px] p-[14px_19px] text-[12px]" />
                  <a href="#service-list" className={`${buttonClass} ${buttonSecondaryClass} gap-[17px] p-[14px_19px] text-[12px]`}>
                    查看服務項目
                    <ArrowDown size={16} />
                  </a>
                </div>
              </div>

              <div className="rounded-[12px] border border-[#dfe8d3] bg-white p-[26px] shadow-[0_20px_45px_-28px_#3c582929] max-[1100px]:p-[22px] max-[900px]:p-[18px] max-[700px]:text-left">
                <span className="mb-[17px] block font-[Arial,sans-serif] text-[9px] tracking-[1.8px] text-[#93a381]">IN THIS CATEGORY</span>
                <ul className="m-0 list-none p-0">
                  {category.services.map((service, index) => (
                    <li key={service.slug} className="flex items-center gap-[13px] border-b border-[#eef2e7] py-3 last:border-b-0">
                      <span className="font-[Arial,sans-serif] text-[11px] text-[#b2bfa2] max-[900px]:text-[10px]">0{index + 1}</span>
                      <Link href={`/services/${category.slug}/${service.slug}`} className="flex flex-1 items-center justify-between gap-3 text-[13px] text-[#4d6140] hover:text-green-dark max-[900px]:text-[12px]">
                        {service.title}
                        <ArrowUpRight size={14} className="shrink-0 text-[#8da776]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="service-list" className={sectionClass}>
          <div className={containerClass}>
            <PageHeading
              eyebrow="WHAT WE CAN DELIVER"
              title={['這類服務，包含以下項目。', '點選了解實際做法與導入流程。']}
              intro="每一項服務都能獨立進行，也可互相搭配。詳情頁會說明它能解決甚麼、包含甚麼及如何導入。"
            />
            <div className="grid grid-cols-2 gap-[22px] max-[1100px]:gap-[15px] max-[900px]:gap-[15px] max-[700px]:grid-cols-1">
              {category.services.map((service, index) => (
                <Link className={`${catalogCardClass} group`} key={service.slug} href={`/services/${category.slug}/${service.slug}`}>
                  <span className="mb-[22px] font-[Arial,sans-serif] text-[11px] tracking-[1.5px] text-[#a2b28f]">0{index + 1}</span>
                  <div>
                    <span className="font-[Arial,sans-serif] text-[8px] tracking-[1.5px] text-[#96a785]">{service.english}</span>
                    <h3 className="mt-[11px] text-[24px] font-[550] leading-[1.55] tracking-[-0.6px] max-[1100px]:text-[21px] max-[900px]:text-[19px] max-[700px]:text-[22px]">{service.title}</h3>
                    <p className="mt-[15px] text-[13px] leading-[2] text-[#7f8d72] max-[1100px]:text-[12px] max-[900px]:text-[11px] max-[700px]:text-[13px]">{service.intro}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-[14px] border-t border-[#e9efe2] pt-[21px] max-[900px]:flex-wrap">
                    <span className="text-[12px] text-[#71875f] max-[1100px]:text-[11px] max-[900px]:text-[10px] max-[700px]:text-[11px]">{service.tagline}</span>
                    <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[#dbe6cb] text-[#83a263] transition-colors group-hover:border-green group-hover:bg-green group-hover:text-white">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <PageHeading
              eyebrow="HOW WE THINK ABOUT THIS"
              title={['先把方法說清楚，', '再談怎麼做。']}
              intro="同一個分類，做法也要貼合你的實際情況。這是我們進入合作前會先確認的事。"
            />
            <div className="grid grid-cols-3 gap-[22px] border-t border-[#e1e8d8] pt-[30px] max-[1100px]:gap-[17px] max-[700px]:grid-cols-1 max-[700px]:gap-6">
              {category.approach.map((item, index) => (
                <article key={item} className="flex items-start gap-[18px]">
                  <span className="font-[Arial,sans-serif] text-[30px] leading-[1] text-[#cfe0bc] max-[900px]:text-[25px] max-[700px]:text-[28px]">0{index + 1}</span>
                  <div>
                    <h3 className="text-[17px] font-[550] leading-[1.6] tracking-[-0.4px] max-[900px]:text-[15px] max-[700px]:text-[17px]">{item.split('：')[0]}</h3>
                    <p className="mt-[9px] text-[13px] leading-[2] text-[#7f8d72] max-[900px]:text-[12px] max-[700px]:text-[13px]">{item.split('：')[1]}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className={containerClass}>
            <PageHeading
              eyebrow="A PRACTICAL WAY FORWARD"
              title={['怎麼開始？', '由了解需求到持續支援。']}
              intro="以下是這類服務一般的導入步驟，實際節奏會按你的項目範圍調整。"
            />
            <PageProcess
              steps={[
                { title: '需求梳理', text: '了解工作流程、資料來源與想改善的結果。', output: '問題與初步範圍' },
                { title: '方案與報價', text: '釐清範圍、介面、限制及驗收標準。', output: '方案建議與費用' },
                { title: '實作與驗證', text: '分階段開發或試點，以真實資料驗證。', output: '可驗證的成果' },
                { title: '交接與支援', text: '完成文件、教學及後續支援安排。', output: '正式交付與承接' },
              ]}
            />
          </div>
        </section>

        <PageFAQ items={categoryFaqs} />
        <PageCTA
          title={['需要這一類服務？', '先聊你想改善的工作。']}
          text={category.description + ' 告訴我們你的現況，我們一起判斷哪些服務真正用得上。'}
          checklist={category.checklist}
        />

        <div className={`${containerClass} pb-12`}>
          <span className="mb-[15px] block text-[12px] text-[#8a997e]">其他服務分類</span>
          <div className="grid grid-cols-3 gap-4">
            {otherCategories.map((item) => (
              <Link key={item.slug} href={`/services/${item.slug}`} className="flex items-center justify-between gap-[10px] rounded-[8px] border border-[#e7eddf] p-5 transition-[background,border-color] duration-200 hover:border-[#cadcb5] hover:bg-[#f7faef]">
                <span>
                  <strong className="block text-[12px] font-medium">{item.title}</strong>
                  <small className="mt-1 block text-[12px] text-[#8e9c81]">{item.description}</small>
                </span>
                <ArrowUpRight size={17} className="text-[#8fa779]" />
              </Link>
            ))}
          </div>
        </div>

        <div className="-mt-4 pb-9 text-center text-[12px] text-[#8e9e80]">
          <Link href="/services" className="inline-flex items-center gap-[7px]">回到服務介紹<ArrowUpRight size={13} /></Link>
        </div>
      </main>
    </>
  );
}
