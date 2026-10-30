import { notFound } from 'next/navigation';
import { categories, getCategory } from '@/lib/service-catalog';
import { pageMetadata } from '@/lib/metadata';
import CategoryPage from '@/components/category-page';

export const dynamicParams = false;
export function generateStaticParams() { return categories.map(category => ({ category: category.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = getCategory(category);
  if (!data) notFound();
  return pageMetadata(`${data.title}｜服務介紹`, data.description, `/services/${category}`);
}
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = getCategory(category);
  if (!data) notFound();
  return <CategoryPage category={data} />;
}
