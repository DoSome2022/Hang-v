import { notFound } from 'next/navigation';
import { categories, getCategory, getService } from '@/lib/service-catalog';
import { pageMetadata } from '@/lib/metadata';
import ServiceDetailPage from '@/components/service-detail-page';

export const dynamicParams = false;
export function generateStaticParams() { return categories.flatMap(category => category.services.map(service => ({ category: category.slug, service: service.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ category: string; service: string }> }) {
  const { category, service } = await params;
  const categoryData = getCategory(category);
  if (!categoryData) notFound();
  const data = getService(categoryData, service);
  if (!data) notFound();
  return pageMetadata(`${data.title}｜${categoryData.title}｜實瀚科技`, data.intro, `/services/${category}/${service}`);
}
export default async function Page({ params }: { params: Promise<{ category: string; service: string }> }) {
  const { category, service } = await params;
  const categoryData = getCategory(category);
  if (!categoryData) notFound();
  const data = getService(categoryData, service);
  if (!data) notFound();
  return <ServiceDetailPage category={categoryData} service={data} />;
}
