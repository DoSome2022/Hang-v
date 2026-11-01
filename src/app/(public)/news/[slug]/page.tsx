import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/metadata';
import { company, siteUrl } from '@/lib/site';
import { formatDate } from '@/lib/format';
import { containerClass, onlineDotClass } from '@/lib/ui';
import { createCaller } from '@/server/api/caller';

// DB 驅動：build 唔打 DB
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const caller = await createCaller();
    const data = await caller.news.getPublicBySlug({ slug });
    if (!data) return {};
    return pageMetadata(`${data.title}｜最新資訊`, data.summary || data.title, `/news/${slug}`);
  } catch {
    return {};
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caller = await createCaller();
  const data = await caller.news.getPublicBySlug({ slug });
  if (!data) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: company.name, url: siteUrl, logo: `${siteUrl}/favicon.ico` },
      {
        '@type': 'Article',
        headline: data.title,
        description: data.summary || undefined,
        url: `${siteUrl}/news/${data.slug}`,
        datePublished: data.publishedAt ? formatDate(data.publishedAt) : undefined,
        keywords: data.tags.join(', ') || undefined,
        inLanguage: 'zh-Hant',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: '最新資訊', item: `${siteUrl}/news` },
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
              <Link href="/news" className="hover:text-green-dark">最新資訊</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">{data.title}</span>
            </nav>
            <p className="mb-[26px] mt-[28px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[13px] text-[#54624b]">
              <span className={onlineDotClass} />
              {data.category || '最新資訊'}
            </p>
            <h1 className="mt-[20px] max-w-[840px] text-[clamp(30px,3.2vw,46px)] font-bold leading-[1.4] tracking-[-1.2px] max-[700px]:text-[clamp(25px,7vw,34px)]">
              {data.title}
            </h1>
            <p className="mt-5 text-[13px] text-[#8c9686]">
              {formatDate(data.publishedAt)}
              {data.tags.length > 0 && <span>・{data.tags.join(' / ')}</span>}
            </p>
          </div>
        </section>

        <section className="py-[72px] max-[1100px]:py-14">
          <div className={containerClass}>
            <p className="mx-auto max-w-[720px] text-[15px] leading-[2.1] text-[#4a5742]">
              {data.summary}
            </p>
            <div className="mx-auto mt-8 max-w-[720px] whitespace-pre-line text-[14px] leading-[2.1] text-[#5d6b52]">
              {data.content}
            </div>
            <div className="mx-auto mt-12 max-w-[720px] border-t border-[#e7eddf] pt-6">
              <Link href="/news" className="inline-flex items-center gap-[7px] text-[13px] font-medium text-[#68864e] hover:text-green-dark">
                ← 返回最新資訊
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
