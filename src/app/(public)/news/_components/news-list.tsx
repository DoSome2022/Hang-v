'use client';

// 公開 /news 列表：半自動搜尋（日期/標題/內容/標籤）+ 排列順序 + 分頁
// 資料由 server component 傳入，SSR 首屏直接有內容（唔使 client fetch）
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { useDebouncedValue } from '@/lib/use-debounced-value';

export type NewsCardItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  tags: string[];
};

type SortKey = 'created-desc' | 'created-asc' | 'tag-asc' | 'tag-desc';

// 3 欄 grid，6 筆一頁
const PAGE_SIZE = 6;

const cardClass =
  'flex flex-col rounded-[12px] border border-[#e1e9d8] bg-white p-[26px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c6d8b6] hover:shadow-[0_14px_28px_-18px_#3b56282a]';

const controlClass =
  'rounded-[8px] border border-[#e1e9d8] bg-white px-3 py-2 text-[13px] text-[#54624b] outline-none focus:border-[#a8c58f]';

export default function NewsList({ items }: { items: NewsCardItem[] }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [sort, setSort] = useState<SortKey>('created-desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const qDate = debouncedQuery.trim();
    const matched = q
      ? items.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q)) ||
            formatDate(n.createdAt).includes(qDate) ||
            formatDate(n.publishedAt).includes(qDate),
        )
      : items;
    const tagKey = (n: NewsCardItem) => n.tags.join('、');
    return [...matched].sort((a, b) => {
      switch (sort) {
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'tag-asc':
          return tagKey(a).localeCompare(tagKey(b), 'zh-Hant');
        case 'tag-desc':
          return tagKey(b).localeCompare(tagKey(a), 'zh-Hant');
        default: // created-desc
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [items, debouncedQuery, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-[14px] text-[#8e9a81]">暫時未有公開資訊，請稍後再來。</p>
    );
  }

  return (
    <div>
      {/* 工具列：半自動搜尋 + 排列順序 */}
      <div className="mb-9 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-[360px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a9b59c]" />
          <input
            className={`${controlClass} w-full pl-9`}
            placeholder="搜尋標題 / 內容 / 標籤 / 日期"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className={controlClass}
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            setPage(1);
          }}
          aria-label="排列順序"
        >
          <option value="created-desc">建立日期（新 → 舊）</option>
          <option value="created-asc">建立日期（舊 → 新）</option>
          <option value="tag-asc">標籤（A → Z）</option>
          <option value="tag-desc">標籤（Z → A）</option>
        </select>
        <span className="text-[13px] text-[#8e9a81]">共 {filtered.length} 篇</span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-[#8e9a81]">搵唔到符合嘅資訊。</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[700px]:grid-cols-1">
            {pageItems.map((item) => (
              <article className={cardClass} key={item.slug}>
                <span className="mb-4 inline-flex w-fit items-center rounded-[4px] border border-[#dce8c5] bg-[#eaf3da] p-[4px_10px] text-[12px] font-medium text-[#68854e]">
                  {item.category || '最新資訊'}
                </span>
                <h2 className="text-[20px] font-semibold leading-[1.55] tracking-[-0.4px] max-[900px]:text-[19px] max-[700px]:text-[22px]">
                  <Link href={`/news/${item.slug}`} className="hover:text-green-dark">{item.title}</Link>
                </h2>
                <p className="mt-3 text-[13px] leading-[2] text-[#7f8d72] max-[900px]:text-[12px] max-[700px]:text-[13px]">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-[14px] text-[12px] text-[#9aa58e]">
                  <span>{formatDate(item.publishedAt)}</span>
                  {item.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{item.tags.slice(0, 3).join(' / ')}</span>
                    </>
                  )}
                </div>
                <div className="mt-auto pt-[18px]">
                  <Link href={`/news/${item.slug}`} className="inline-flex items-center gap-[7px] text-[13px] font-medium text-[#68864e] hover:text-green-dark">
                    閱讀全文
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between text-[13px] text-[#8e9a81]">
              <span>第 {safePage} / {totalPages} 頁</span>
              <div className="flex gap-2">
                <button
                  className={`${controlClass} disabled:opacity-40`}
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                >
                  上一頁
                </button>
                <button
                  className={`${controlClass} disabled:opacity-40`}
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                >
                  下一頁
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
