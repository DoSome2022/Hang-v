'use client';

// 服務編輯：等資料到齊先掛載表單（useState 初始值 pattern）
import { use } from 'react';
import { trpc } from '@/trpc/react';
import ServiceForm from '../../_components/service-form';

export default function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const existing = trpc.catalog.adminGetService.useQuery({ id });
  if (existing.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  if (existing.isError || !existing.data) return <p className="py-8 text-center text-sm text-slate-400">服務不存在</p>;
  return <ServiceForm serviceId={id} initial={existing.data} />;
}
