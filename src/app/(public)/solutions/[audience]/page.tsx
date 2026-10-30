import { notFound } from 'next/navigation';
import { solutions } from '@/lib/solutions';
import { pageMetadata } from '@/lib/metadata';
import SolutionPage from '@/components/solution-page';

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(solutions).map(audience => ({ audience })); }
export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  const data = Object.hasOwn(solutions, audience) ? solutions[audience] : undefined;
  if (!data) notFound();
  return pageMetadata(`${data.label} AI 解決方案`, data.description, `/solutions/${audience}`);
}
export default async function Page({ params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  const data = Object.hasOwn(solutions, audience) ? solutions[audience] : undefined;
  if (!data) notFound();
  return <SolutionPage data={data} />;
}
