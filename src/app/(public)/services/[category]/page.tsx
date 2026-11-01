import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/metadata';
import CategoryPage from '@/components/category-page';
import { createCaller } from '@/server/api/caller';

// DB 驅動：build 唔打 DB
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  try {
    const caller = await createCaller();
    const data = await caller.catalog.getCategory({ slug: category });
    if (!data) return {};
    return pageMetadata(`${data.title}｜服務介紹`, data.description, `/services/${category}`);
  } catch {
    return {};
  }
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const caller = await createCaller();
  const data = await caller.catalog.getCategory({ slug: category });
  if (!data) notFound();
  // 其他分類卡需要全部分類
  const allCategories = await caller.catalog.listCategories();
  return <CategoryPage category={data} allCategories={allCategories} />;
}
