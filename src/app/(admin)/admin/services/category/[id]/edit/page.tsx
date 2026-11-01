'use client';

// 分類編輯：等資料到齊先掛載表單（useState 初始值 pattern）
import { use } from 'react';
import { trpc } from '@/trpc/react';
import CategoryForm from '../../../_components/category-form';

export default function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const list = trpc.catalog.adminList.useQuery();
  if (list.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  const category = (list.data ?? []).find((c) => c.id === id);
  if (!category) return <p className="py-8 text-center text-sm text-slate-400">分類不存在</p>;
  return <CategoryForm categoryId={id} initial={category} />;
}
