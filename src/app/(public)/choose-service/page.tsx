import { pageMetadata } from '@/lib/metadata';
import ChooseService from '@/components/choose-service';
import { createCaller } from '@/server/api/caller';

// DB 驅動：build 唔打 DB
export const dynamic = 'force-dynamic';

export const metadata = pageMetadata(
  '選擇我們的服務｜實瀚科技',
  '從五大服務類別挑選你感興趣的方向，全選或逐項選取，實瀚科技幫你找到適合的起步方式。',
  '/choose-service',
);

export default async function Page() {
  const caller = await createCaller();
  const categories = await caller.catalog.listCategories();
  return <ChooseService categories={categories} />;
}
