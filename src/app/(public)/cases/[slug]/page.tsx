import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cases, getCase } from '@/lib/cases';
import { pageMetadata } from '@/lib/metadata';
import { company, siteUrl } from '@/lib/site';
import { ConsultButton } from '@/components/site-shell';
import { containerClass, sectionLabelClass, sectionLabelDotClass, buttonClass, buttonNavyClass } from '@/lib/ui';

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getCase(slug);
  if (!data) return {};
  return pageMetadata(`${data.title}｜真實案例`, data.summary, `/cases/${slug}`);
}

const h2Class = 'mt-[44px] mb-4 text-[26px] leading-[1.5] tracking-[-0.6px] max-[700px]:text-[23px]';
const pClass = 'mb-[18px] text-[15px] leading-[2.1] text-[#3f4a3a]';
const liClass =
  "relative mb-[10px] pl-[22px] text-[15px] leading-[1.9] text-[#3f4a3a] before:absolute before:left-[3px] before:top-3 before:h-[7px] before:w-[7px] before:rounded-full before:bg-green before:content-['']";

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getCase(slug);
  if (!data) notFound();

  const related = cases.filter((c) => c.slug !== slug).slice(0, 2);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: company.name, url: siteUrl, logo: `${siteUrl}/favicon.ico` },
      {
        '@type': 'Article',
        headline: data.title,
        description: data.summary,
        datePublished: data.date,
        dateModified: data.date,
        articleSection: data.category,
        author: { '@type': 'Organization', name: company.name, url: siteUrl },
        publisher: { '@type': 'Organization', name: company.name, logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.ico` } },
        mainEntityOfPage: `${siteUrl}/cases/${slug}`,
        keywords: data.tags.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: '真實案例', item: `${siteUrl}/cases` },
          { '@type': 'ListItem', position: 3, name: data.title },
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
              <Link href="/cases" className="hover:text-green-dark">真實案例</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">{data.title}</span>
            </nav>
            <span className="mt-[28px] inline-flex items-center rounded-[4px] border border-[#dce8c5] bg-[#eaf3da] p-[4px_10px] text-[12px] font-medium text-[#68854e]">
              {data.category}
            </span>
            <h1 className="mt-[20px] max-w-[840px] text-[clamp(34px,3.6vw,52px)] font-bold leading-[1.35] tracking-[-1.4px] max-[700px]:text-[clamp(28px,7.5vw,38px)]">
              {data.title}
            </h1>
            <p className="mt-6 max-w-[640px] text-[14px] leading-[2.05] text-[#738266]">{data.lead}</p>
            <div className="mt-[26px] flex flex-wrap items-center gap-[14px] text-[12px] text-[#8e9a81]">
              <span>{data.date}</span>
              <span>·</span>
              <span>{data.readTime}</span>
              <span className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <span key={tag} className="rounded-[4px] border border-[#e2ead8] bg-white p-[4px_9px] text-[12px] text-[#8b9b7c]">{tag}</span>
                ))}
              </span>
            </div>
          </div>
        </section>

        <section className="py-[104px] max-[1100px]:py-20">
          <div className={`${containerClass} max-w-[760px]`}>
            <article>
              {data.sections.map((section) => (
                <div key={section.heading}>
                  <h2 className={h2Class}>{section.heading}</h2>
                  {section.paragraphs.map((paragraph, i) => (
                    <p key={i} className={pClass}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul className="mb-6 list-none p-0">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className={liClass}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="mt-11 rounded-xl border border-[#d7e5bf] bg-[#fbfdf6] p-[28px_30px] max-[700px]:p-[22px]">
                <span className="font-[Arial,sans-serif] text-[12px] tracking-[1.4px] text-[#8b9b7c]">{data.result.label}</span>
                <strong className="mt-2 block text-[28px] font-bold tracking-[-0.6px] text-green-dark max-[700px]:text-[24px]">{data.result.value}</strong>
                <p className="mt-[10px] text-[13px] leading-[1.9] text-[#7f8d72]">{data.result.note}</p>
              </div>
            </article>
          </div>
        </section>

        <div className={`${containerClass} pb-12`}>
          <span className="mb-[15px] block text-[12px] text-[#8a997e]">更多真實案例</span>
          <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
            {related.map((item) => (
              <Link key={item.slug} href={`/cases/${item.slug}`} className="flex items-center justify-between gap-[10px] rounded-lg border border-[#e7eddf] p-[19px_20px] transition hover:border-[#cadcb5] hover:bg-[#f7faef]">
                <span>
                  <strong className="block text-[13px] font-medium">{item.title}</strong>
                  <small className="mt-1 block text-[12px] text-[#8e9c81]">{item.category} · {item.readTime}</small>
                </span>
                <ArrowUpRight size={17} className="text-[#8fa779]" />
              </Link>
            ))}
          </div>
        </div>

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
                <p className="mt-[17px] max-w-[435px] text-[12px] leading-[2] text-[#7e8b6e]">告訴我們你的現況，一起看看你的生意可以怎樣改變。</p>
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

        <div className="-mt-4 pb-9 text-center text-[12px] text-[#8e9e80]">
          <Link href="/cases" className="inline-flex items-center gap-[7px]">回到真實案例<ArrowUpRight size={13} /></Link>
        </div>
      </main>
    </>
  );
}
