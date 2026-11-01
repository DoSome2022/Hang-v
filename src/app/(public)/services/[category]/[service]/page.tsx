import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/metadata';
import ServiceDetailPage from '@/components/service-detail-page';
import { createCaller } from '@/server/api/caller';

// DB 驅動：build 唔打 DB
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ category: string; service: string }> }) {
  const { category, service } = await params;
  try {
    const caller = await createCaller();
    const data = await caller.catalog.getService({ categorySlug: category, serviceSlug: service });
    if (!data) return {};
    return pageMetadata(`${data.title}｜${data.category.title}｜實瀚科技`, data.intro, `/services/${category}/${service}`);
  } catch {
    return {};
  }
}

export default async function Page({ params }: { params: Promise<{ category: string; service: string }> }) {
  const { category, service } = await params;
  const caller = await createCaller();
  const data = await caller.catalog.getService({ categorySlug: category, serviceSlug: service });
  if (!data) notFound();
  return <ServiceDetailPage category={data.category} service={data} />;
}
