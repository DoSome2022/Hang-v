import Link from 'next/link';
import { ArrowUpRight, Check, Cloud, Code2, MessageSquareText, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { PageFAQ, PageHeading, PageSchema, RelatedSolutions } from '@/components/page-blocks';
import { ConsultButton } from '@/components/site-shell';
import { categories } from '@/lib/service-catalog';
import { categoryIcons } from '@/components/catalog-icons';
import { containerClass, sectionLabelClass, sectionLabelDotClass, textLinkClass } from '@/lib/ui';

const serviceFaqs = [
  { question: '可否只選取其中一項服務？', answer: '可以。我們會按你實際需要的範圍組合作業，不必一次過採用全部服務。' },
  { question: '是否提供免費試用或試點？', answer: '初步諮詢免費，正式開發、試點及培訓會另行報價。' },
];

const networkNodeClass = 'absolute flex items-center gap-[9px] rounded-[7px] border border-[#dfe8d5] bg-white p-3 text-[12px] text-[#6d8557] shadow-[0_7px_18px_-11px_#4c643021] max-[1100px]:p-[10px] max-[700px]:gap-[6px] max-[700px]:p-[10px_8px] max-[700px]:text-[13px]';

export default function ServicesPage() {
  return (
    <>
      <PageSchema
        title="服務介紹｜實瀚科技"
        description="由 AI、自動化、雲端、資訊保安到客製開發，實瀚科技為香港中小企與專業人士提供務實的科技服務。"
        path="/services"
        faqs={serviceFaqs}
        breadcrumb={[{ name: '首頁', path: '/' }, { name: '服務介紹' }]}
      />

      <main id="main">
        <section className="overflow-hidden border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_75%_50%,#f3f7ec,transparent_58%)]">
          <div className={containerClass}>
            <nav className="flex items-center gap-[11px] pt-[28px] text-[12px] text-[#8c9686]" aria-label="麵包屑導覽">
              <Link href="/" className="hover:text-green-dark">首頁</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">服務介紹</span>
            </nav>

            <div className="grid min-h-[472px] grid-cols-[1.15fr_1fr] items-center gap-10 py-[25px_35px] max-[1100px]:gap-[25px] max-[700px]:grid-cols-1 max-[700px]:py-[28px_30px]">
              <div>
                <p className="mb-5 flex items-center gap-[9px] font-[Arial,sans-serif] text-[12px] font-medium tracking-[2px] text-[#69756f]">
                  <span className="block h-[6px] w-[6px] rounded-[1px] bg-green" />
                  WHAT WE DO
                </p>
                <h1 className="text-[clamp(39px,3.65vw,51px)] font-bold leading-[1.5] tracking-[-1.5px] max-[1500px]:text-[51px] max-[1100px]:text-[46px] max-[900px]:text-[40px] max-[700px]:text-[34px]">
                  把複雜的科技，
                  <br />
                  <span className="relative inline-block text-green">做成你用得上的服務。</span>
                </h1>
                <p className="mt-6 max-w-[475px] text-[13px] leading-[2.1] text-[#78866c] max-[700px]:text-[12px]">
                  由 AI、自動化、雲端、資訊保安到客製開發，我們針對香港中小企與專業人士的實際需要，提供務實、可衡量的科技服務。
                </p>
                <div className="mt-[26px]">
                  <ConsultButton className="gap-[17px] text-[12px] max-[700px]:gap-3 max-[700px]:px-[15px] max-[700px]:text-[13px]" />
                </div>
              </div>

              <div className="relative isolate flex h-[365px] w-full items-center justify-center max-[700px]:h-[335px]">
                <div className="absolute z-[-1] h-[300px] w-[300px] -rotate-[30deg] scale-x-[1.15] rounded-full border border-[#dbe6ce] max-[1100px]:h-[270px] max-[1100px]:w-[270px] max-[700px]:h-[240px] max-[700px]:w-[240px]" aria-hidden="true" />
                <div className="absolute z-[-1] h-[204px] w-[204px] rounded-full border border-dashed border-[#dbe7ce] bg-[radial-gradient(#e9f3d9,transparent_68%)] max-[1100px]:h-[190px] max-[1100px]:w-[190px] max-[700px]:h-[175px] max-[700px]:w-[175px]" aria-hidden="true" />
                <div className="flex h-[145px] w-[145px] -rotate-[5deg] flex-col items-center justify-center gap-3 rounded-[25px] border border-[#d8e7c2] bg-[linear-gradient(135deg,#fff,#f0f7e5)] text-[#7da14c] shadow-[0_16px_28px_-20px_#5c7d3530] max-[700px]:h-[126px] max-[700px]:w-[126px] max-[700px]:rounded-[20px]">
                  <Sparkles size={34} strokeWidth={1.4} />
                  <strong className="text-[13px] font-medium text-[#5e7c3e]">實瀚科技</strong>
                  <small className="-mt-[7px] font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#9faf8b] max-[700px]:text-[13px]">HANGS TECH</small>
                </div>
                <span className={`${networkNodeClass} left-[8%] top-[30px] -rotate-[4deg] max-[700px]:left-[5%] max-[700px]:top-[31px]`}>
                  <Sparkles size={17} className="text-[#8eb46c]" />
                  AI 自動化
                </span>
                <span className={`${networkNodeClass} right-0 top-[95px] rotate-[3deg] text-[#859aaa] max-[700px]:right-[-3%] max-[700px]:top-[102px]`}>
                  <Cloud size={17} className="text-[#8eb46c]" />
                  雲端整合
                </span>
                <span className={`${networkNodeClass} bottom-[27px] right-[9%] -rotate-[3deg] max-[700px]:bottom-[35px]`}>
                  <Code2 size={17} className="text-[#8eb46c]" />
                  客製開發
                </span>
                <span className={`${networkNodeClass} bottom-[91px] left-[-3%] rotate-[4deg] text-[#85956e] max-[1100px]:left-[-2%] max-[700px]:bottom-[94px] max-[700px]:left-[-3%]`}>
                  <ShieldCheck size={17} className="text-[#8eb46c]" />
                  資訊保安
                </span>
                <span className="absolute bottom-[-1px] font-[Arial,sans-serif] text-[12px] tracking-[1.5px] text-[#a0ae93] max-[700px]:text-[13px] max-[700px]:tracking-[1px]">YOUR TECHNOLOGY PARTNER</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-5 pb-[27px]">
              <span className="text-[12px] text-[#7a8f69]">服務按需要組合，從小型專案到持續合作均可。</span>
              <span className="font-[Arial,sans-serif] text-[12px] tracking-[1.8px] text-[#9aa98c] max-[700px]:tracking-[1px]">SERVICES</span>
            </div>
          </div>
        </section>

        <section className="border-t border-[#dfe7d6] py-[104px]">
          <div className={containerClass}>
            <PageHeading eyebrow="OUR SERVICES" title={['五個服務分類，', '覆蓋你的日常營運。']} intro="由策略到落地，我們把每項服務拆成清晰的範圍，讓你知道會得到甚麼。" />
            <div>
              {categories.map((category, index) => {
                const Icon = categoryIcons[category.icon];
                return (
                  <div key={category.slug} className="relative grid grid-cols-[85px_1.25fr_1fr] items-center gap-[33px] border-b border-[#e6eddf] p-[37px_10px_37px_0] max-[1100px]:grid-cols-[70px_1.2fr_1fr] max-[1100px]:gap-[25px] max-[700px]:grid-cols-[53px_1.1fr_1fr] max-[700px]:gap-5">
                    <div className="flex flex-col items-start gap-[21px] self-start">
                      <span className="font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#a0b08d]">0{index + 1}</span>
                      <span className="flex h-[54px] w-[54px] items-center justify-center rounded-xl bg-[#f1f6ed] text-[#638443] max-[700px]:h-11 max-[700px]:w-11">
                        <Icon size={27} strokeWidth={1.4} />
                      </span>
                    </div>
                    <div>
                      <span className="font-[Arial,sans-serif] text-[12px] tracking-[1.5px] text-[#96a785]">{category.english}</span>
                      <h3 className="mt-[9px] text-[23px] font-[550] tracking-[-0.5px] max-[1100px]:text-[20px] max-[700px]:text-[18px]">{category.title}</h3>
                      <p className="mt-[13px] max-w-[430px] text-[12px] leading-[2] text-[#7f8d72]">{category.description}</p>
                      <Link href={`/services/${category.slug}`} className={`${textLinkClass} mt-4 text-[13px] text-[#69894d]`}>
                        查看此分類
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                    <ul className="ml-[28px] grid list-none gap-3 border-l border-[#e7edde] p-0 pl-[30px] max-[1100px]:ml-[15px] max-[1100px]:pl-[23px]">
                      {category.services.slice(0, 3).map((service) => (
                        <li key={service.slug} className="flex items-start gap-2 text-[13px] leading-[1.9] text-[#728762] max-[1100px]:text-[12px]">
                          <Check size={14} className="mt-1 text-[#8eb46c]" />
                          {service.title}
                        </li>
                      ))}
                    </ul>
                    <span className="absolute right-0 top-5 text-[#bdcbb0] max-[1100px]:hidden"><ArrowUpRight size={20} /></span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[#e7eddf] bg-[#f6f9f1] py-[104px]">
          <div className={`${containerClass} grid grid-cols-2 items-center gap-[85px] max-[1100px]:gap-[50px] max-[700px]:grid-cols-1`}>
            <div>
              <p className={sectionLabelClass}><span className={sectionLabelDotClass} />HOW WE DELIVER</p>
              <h2 className="text-[30px] leading-[1.6] tracking-[-0.7px]">交付與支援，<br />一樣重要。</h2>
              <p className="mt-[22px] max-w-[390px] text-[12px] leading-[2.1] text-[#7e8d71]">
                每項服務都附帶清晰的交付與支援安排，讓你知道每個階段會發生甚麼，遇到問題時找誰。
              </p>
              <a href="#contact" className={`${textLinkClass} mt-[25px] text-[#69894d]`}>
                了解合作方式
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="rounded-xl border border-[#e2ead7] bg-white p-[6px_25px] shadow-[0_12px_27px_-22px_#506a3340]">
              {[
                { icon: MessageSquareText, title: '免費初步諮詢', text: '了解你的現況與需要，判斷是否合適。' },
                { icon: Check, title: '方案與報價', text: '明確範圍、時程與費用，沒有隱藏收費。' },
                { icon: Sparkles, title: '開發與試點', text: '分階段推進，先用試點驗證價值。' },
                { icon: ShieldCheck, title: '持續支援', text: '上線後的維護、培訓與持續改善。' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="flex items-center gap-[17px] py-[22px] [&+article]:border-t [&+article]:border-[#edf1e6]">
                    <Icon size={26} className="text-[#90a975]" />
                    <div>
                      <h3 className="text-[13px] font-medium">{item.title}</h3>
                      <p className="mt-1 text-[12px] leading-[1.9] text-[#8a987d]">{item.text}</p>
                    </div>
                    <Check size={14} className="ml-auto w-[14px] text-[#90a975]" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <PageFAQ items={serviceFaqs} />
        <section className="pb-10">
          <div className={containerClass}>
            <RelatedSolutions current="" />
          </div>
        </section>
      </main>
    </>
  );
}
