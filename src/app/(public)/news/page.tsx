import Link from 'next/link';
import { pageMetadata } from '@/lib/metadata';
import { company, siteUrl } from '@/lib/site';
import { formatDate } from '@/lib/format';
import { containerClass, onlineDotClass } from '@/lib/ui';
import { createCaller } from '@/server/api/caller';
import NewsList from './_components/news-list';

// DB 驅動：build 唔打 DB
export const dynamic = 'force-dynamic';

const description = '實瀚科技最新資訊：AI 應用、流程自動化、雲端與資安趨勢觀察，以及中小企數碼轉型實戰分享。';

export const metadata = pageMetadata('最新資訊｜實瀚科技', description, '/news');

export default async function NewsPage() {
  const caller = await createCaller();
  const news = await caller.news.listPublic();

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: company.name, url: siteUrl, logo: `${siteUrl}/favicon.ico` },
      {
        '@type': 'CollectionPage',
        name: '最新資訊',
        description,
        url: `${siteUrl}/news`,
        mainEntity: news.map((item) => ({
          '@type': 'Article',
          headline: item.title,
          url: `${siteUrl}/news/${item.slug}`,
          datePublished: item.publishedAt ? formatDate(item.publishedAt) : undefined,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: '最新資訊', item: `${siteUrl}/news` },
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
              <span aria-current="page" className="text-[#55694b]">最新資訊</span>
            </nav>
            <p className="mb-[26px] mt-[28px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[13px] text-[#54624b]">
              <span className={onlineDotClass} />
              NEWS & INSIGHTS
            </p>
            <h1 className="mt-[20px] max-w-[840px] text-[clamp(34px,3.6vw,52px)] font-bold leading-[1.35] tracking-[-1.4px] max-[700px]:text-[clamp(28px,7.5vw,38px)]">
              最新資訊，
              <br />
              一起睇住趨勢走。
            </h1>
            <p className="mt-6 max-w-[640px] text-[14px] leading-[2.05] text-[#738266]">
              AI 應用、流程自動化同中小企數碼轉型嘅觀察與實戰分享，不定期更新。
            </p>
          </div>
        </section>

        <section className="py-[104px] max-[1100px]:py-20">
          <div className={containerClass}>
            <NewsList items={news} />
          </div>
        </section>
      </main>
    </>
  );
}
