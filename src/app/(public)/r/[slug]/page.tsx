import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { pageMetadata } from '@/lib/metadata';
import { company, siteUrl } from '@/lib/site';
import { PageCTA } from '@/components/page-blocks';
import { ApplyLink } from '@/app/_components/apply-link';
import { formatDate } from '@/lib/format';
import { containerClass, sectionLabelClass, sectionLabelDotClass, onlineDotClass } from '@/lib/ui';
import { createCaller } from '@/server/api/caller';

// DB 驅動：build 唔打 DB（force-dynamic + request-time 查詢）
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const caller = await createCaller();
    const data = await caller.region.getPublicBySlug({ slug });
    if (!data) return {};
    const introText = data.intros
      .map((intro) => intro.content)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const description = (introText || company.description).slice(0, 160);
    return pageMetadata(`${data.name}｜區域服務`, description, `/r/${data.slug}`);
  } catch {
    return {};
  }
}

const cardClass =
  'flex flex-col rounded-[12px] border border-[#e1e9d8] bg-white p-[26px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c6d8b6] hover:shadow-[0_14px_28px_-18px_#3b56282a]';

const chipClass =
  'inline-flex items-center rounded-[6px] border border-[#dce8c5] bg-[#f4f9e8] px-[14px] py-[7px] text-[13px] text-[#68854e]';

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caller = await createCaller();
  const data = await caller.region.getPublicBySlug({ slug });
  if (!data) notFound();

  const description =
    data.intros.map((intro) => intro.content).join(' ').replace(/\s+/g, ' ').trim() || company.description;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: company.name, url: siteUrl, logo: `${siteUrl}/favicon.ico` },
      {
        '@type': 'CollectionPage',
        name: data.name,
        description,
        url: `${siteUrl}/r/${data.slug}`,
        inLanguage: 'zh-Hant',
        mainEntity: data.cases.map((item) => ({
          '@type': 'Article',
          headline: item.title,
          url: `${siteUrl}/cases/${item.slug}`,
          datePublished: item.publishedAt ? formatDate(item.publishedAt) : undefined,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: data.name },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <main id="main">
        {/* HERO */}
        <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_78%_40%,#f1f7ea_0,transparent_55%),#fff]">
          <div className={`${containerClass} pt-[30px] pb-[54px] max-[700px]:pt-[26px] max-[700px]:pb-11`}>
            <nav className="flex items-center gap-[11px] text-[12px] text-[#8c9686]" aria-label="麵包屑導覽">
              <Link href="/" className="hover:text-green-dark">首頁</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">{data.name}</span>
            </nav>
            <p className="mb-[26px] mt-[28px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[13px] text-[#54624b]">
              <span className={onlineDotClass} />
              REGION SERVICES
            </p>
            <h1 className="mt-[20px] max-w-[840px] text-[clamp(34px,3.6vw,52px)] font-bold leading-[1.35] tracking-[-1.4px] max-[700px]:text-[clamp(28px,7.5vw,38px)]">
              {data.name}
            </h1>
            <p className="mt-[20px] flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#8c9686]">
              <span>{data.cases.length} 個案例</span>
              <span aria-hidden="true">·</span>
              <span>{data.painPoints.length} 個常見痛點</span>
            </p>
          </div>
        </section>

        {/* 公司介紹 */}
        <section className="py-[72px] max-[1100px]:py-14">
          <div className={containerClass}>
            <p className={sectionLabelClass}><span className={sectionLabelDotClass} />ABOUT THIS REGION</p>
            {data.intros.length === 0 ? (
              <p className="max-w-[720px] text-[14px] leading-[2.05] text-[#738266]">{company.description}</p>
            ) : (
              <div className="space-y-8">
                {data.intros.map((intro) => (
                  <article key={intro.id}>
                    <h2 className="text-[24px] font-semibold leading-[1.5] tracking-[-0.5px] text-[#33402a] max-[700px]:text-[21px]">
                      {intro.title}
                    </h2>
                    <p className="mt-3 max-w-[820px] whitespace-pre-line text-[14px] leading-[2.05] text-[#738266]">
                      {intro.content}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 區內案例 */}
        <section className="pb-[72px] max-[1100px]:pb-14">
          <div className={containerClass}>
            <p className={sectionLabelClass}><span className={sectionLabelDotClass} />CASES IN THIS REGION</p>
            <h2 className="text-[32px] font-[650] leading-[1.5] tracking-[-1px] text-[#2c3a25] max-[700px]:text-[27px]">
              呢個區域嘅真實案例
            </h2>
            {data.cases.length === 0 ? (
              <p className="mt-6 py-12 text-center text-[14px] text-[#8e9a81]">呢個區域暫時未有公開案例，請稍後再來。</p>
            ) : (
              <div className="mt-9 grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[700px]:grid-cols-1">
                {data.cases.map((item) => (
                  <article className={cardClass} key={item.slug}>
                    <span className="mb-4 inline-flex w-fit items-center rounded-[4px] border border-[#dce8c5] bg-[#eaf3da] p-[4px_10px] text-[12px] font-medium text-[#68854e]">
                      {item.category || '案例'}
                    </span>
                    <h3 className="text-[20px] font-semibold leading-[1.55] tracking-[-0.4px] max-[900px]:text-[19px] max-[700px]:text-[22px]">
                      <Link href={`/cases/${item.slug}`} className="hover:text-green-dark">{item.title}</Link>
                    </h3>
                    <p className="mt-3 text-[13px] leading-[2] text-[#7f8d72] max-[900px]:text-[12px] max-[700px]:text-[13px]">{item.excerpt || item.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-[14px] text-[12px] text-[#9aa58e]">
                      <span>{formatDate(item.publishedAt)}</span>
                      <span>·</span>
                      <span>{item.readTime}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-[18px]">
                      <Link href={`/cases/${item.slug}`} className="inline-flex items-center gap-[7px] text-[13px] font-medium text-[#68864e] hover:text-green-dark">
                        閱讀案例
                        <ArrowUpRight size={15} />
                      </Link>
                      <ApplyLink
                        caseId={item.id}
                        title={item.title}
                        label="申請"
                        className="inline-flex items-center rounded-[6px] border border-green bg-green px-[14px] py-[7px] text-[12px] font-medium text-white transition hover:bg-green-dark"
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 痛點 */}
        {data.painPoints.length > 0 && (
          <section className="pb-[72px] max-[1100px]:pb-14">
            <div className={containerClass}>
              <p className={sectionLabelClass}><span className={sectionLabelDotClass} />PAIN POINTS</p>
              <h2 className="text-[24px] font-[650] leading-[1.5] tracking-[-0.8px] text-[#2c3a25]">常見痛點</h2>
              <ul className="mt-5 flex flex-wrap gap-[10px]">
                {data.painPoints.map((p) => (
                  <li key={p.id} className={chipClass}>{p.title}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* CTA */}
        <PageCTA
          title={['睇完案例，想知下一步？', '由你嘅情況開始。']}
          text={'呢個區域嘅案例同方案只係參考；實際做法會按你嘅流程、資料同限制調整。'}
          checklist={['你目前最花時間嘅流程', '現有系統／工具', '希望改善嘅結果']}
        />
      </main>
    </>
  );
}
