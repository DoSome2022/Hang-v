import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cases } from '@/lib/cases';
import { pageMetadata } from '@/lib/metadata';
import { company, siteUrl } from '@/lib/site';
import { ConsultButton } from '@/components/site-shell';
import { containerClass, sectionLabelClass, sectionLabelDotClass, buttonClass, buttonNavyClass, onlineDotClass } from '@/lib/ui';

const description =
  '實瀚科技真實客戶案例：補習社管理系統、裝修工程項目管理、五金店電商。了解香港中小企如何用 AI、自動化與客製系統解決實際業務問題。';

export const metadata = pageMetadata('真實案例｜成功案例與數碼轉型實錄', description, '/cases');

const cardClass =
  'flex flex-col rounded-[12px] border border-[#e1e9d8] bg-white p-[26px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c6d8b6] hover:shadow-[0_14px_28px_-18px_#3b56282a]';

export default function CasesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: company.name, url: siteUrl, logo: `${siteUrl}/favicon.ico` },
      {
        '@type': 'CollectionPage',
        name: '真實案例',
        description,
        url: `${siteUrl}/cases`,
        mainEntity: cases.map((item) => ({ '@type': 'Article', headline: item.title, url: `${siteUrl}/cases/${item.slug}`, datePublished: item.date })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: '真實案例', item: `${siteUrl}/cases` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <main id="main">
        <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_78%_40%,#f1f7ea_0,transparent_55%),#fff]">
          <div className={`${containerClass} pt-[30px] pb-[54px] max-[700px]:pt-[26px] max-[700px]:pb-11`}>
            <nav className="flex items-center gap-[11px] text-[12px] text-[#8c9686]" aria-label="麵包屑導覽">
              <Link href="/" className="hover:text-green-dark">首頁</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">真實案例</span>
            </nav>
            <p className="mb-[26px] mt-[28px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[13px] text-[#54624b]">
              <span className={onlineDotClass} />
              REAL PROJECTS, REAL OUTCOMES
            </p>
            <h1 className="mt-[20px] max-w-[840px] text-[clamp(34px,3.6vw,52px)] font-bold leading-[1.35] tracking-[-1.4px] max-[700px]:text-[clamp(28px,7.5vw,38px)]">
              真實案例，
              <br />
              實實在在的改變。
            </h1>
            <p className="mt-6 max-w-[640px] text-[14px] leading-[2.05] text-[#738266]">
              不談空泛的概念，只講我們與客戶一起解決過的實際問題。每個案例，都是一個真實的流程、一組真實的數字。
            </p>
          </div>
        </section>

        <section className="py-[104px] max-[1100px]:py-20">
          <div className={containerClass}>
            <div className="grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[700px]:grid-cols-1">
              {cases.map((item) => (
                <article className={cardClass} key={item.slug}>
                  <span className="mb-4 inline-flex w-fit items-center rounded-[4px] border border-[#dce8c5] bg-[#eaf3da] p-[4px_10px] text-[12px] font-medium text-[#68854e]">
                    {item.category}
                  </span>
                  <h3 className="text-[20px] font-semibold leading-[1.55] tracking-[-0.4px] max-[900px]:text-[19px] max-[700px]:text-[22px]">
                    <Link href={`/cases/${item.slug}`} className="hover:text-green-dark">{item.title}</Link>
                  </h3>
                  <p className="mt-3 text-[13px] leading-[2] text-[#7f8d72] max-[900px]:text-[12px] max-[700px]:text-[13px]">{item.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-[14px] text-[12px] text-[#9aa58e]">
                    <span>{item.date}</span>
                    <span>·</span>
                    <span>{item.readTime}</span>
                  </div>
                  <Link href={`/cases/${item.slug}`} className="mt-auto inline-flex items-center gap-[7px] pt-[18px] text-[13px] font-medium text-[#68864e] hover:text-green-dark">
                    閱讀案例
                    <ArrowUpRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-[83px]">
          <div className={containerClass}>
            <div className="relative flex min-h-[369px] items-center justify-between overflow-hidden rounded-2xl border border-[#e1eacb] bg-[linear-gradient(105deg,#f0f6e5_0%,#edf5dc_55%,#e6f0cc_100%)] p-[48px_54px] max-[1100px]:p-[40px] max-[900px]:p-[30px] max-[700px]:min-h-0 max-[700px]:flex-col max-[700px]:p-[28px]">
              <div className="relative z-[2]">
                <p className={sectionLabelClass}><span className={sectionLabelDotClass} />START WITH YOUR OWN CASE</p>
                <h2 className="text-[37px] font-[650] leading-[1.5] tracking-[-1px] max-[1100px]:text-[30px] max-[900px]:text-[25px] max-[700px]:text-[27px]">
                  下一個案例，
                  <br />
                  由你的故事開始。
                </h2>
                <p className="mt-[17px] text-[12px] leading-[2] text-[#7e8b6e]">
                  每個生意都有自己值得解決的問題。告訴我們你的現況，一起看看可以怎樣開始。
                </p>
                <ConsultButton className={`${buttonClass} ${buttonNavyClass} mt-[25px] min-h-[45px] gap-[31px] px-5 text-[12px]`} />
                <span className="mt-[11px] block text-[12px] text-[#929e80]">先了解需求，再決定下一步。</span>
              </div>
              <div className="relative h-[230px] w-[260px] max-[900px]:h-[190px] max-[900px]:w-[220px] max-[700px]:mt-6" aria-hidden="true">
                <div className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#c3d9a6]" />
                <div className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c3d9a6]" />
                <div className="absolute left-1/2 top-1/2 flex h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[18px] bg-[#fff] text-[#7da14c] shadow-[0_12px_24px_-12px_#5c7d3540]">
                  <svg viewBox="0 0 80 80" fill="none"><path d="M18 57L58 17M20 17h38v38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="absolute left-[13px] top-[24px] text-[20px] text-[#a9ce47]">+</span>
                <span className="absolute bottom-[30px] right-[20px] text-[20px] text-[#a9ce47]">+</span>
                <span className="absolute bottom-[15px] left-1/2 -translate-x-1/2 font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#9fb08c]">
                  HUMAN IDEAS.<br /><strong className="text-[#7e9a63]">GREATER POSSIBILITIES.</strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
