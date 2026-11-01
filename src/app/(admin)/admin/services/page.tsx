'use client';

// 服務目錄管理：分類卡（編輯/刪除/新增服務）+ 服務列表（編輯/刪除）
import Link from 'next/link';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import { trpc } from '@/trpc/react';
import {
  btnPrimaryClass,
  cardClass,
  ConfirmDeleteButton,
  ErrorNote,
} from '../_components/admin-ui';

export default function ServicesPage() {
  const utils = trpc.useUtils();
  const list = trpc.catalog.adminList.useQuery();
  const categoryDelete = trpc.catalog.categoryDelete.useMutation({
    onSuccess: () => {
      void utils.catalog.adminList.invalidate();
    },
  });
  const serviceDelete = trpc.catalog.serviceDelete.useMutation({
    onSuccess: () => {
      void utils.catalog.adminList.invalidate();
    },
  });

  const error = categoryDelete.isError
    ? categoryDelete.error.message
    : serviceDelete.isError
      ? serviceDelete.error.message
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/services/category/new" className={btnPrimaryClass}>
          <Plus size={16} /> 新增分類
        </Link>
        <p className="text-xs text-slate-400">改動會即時反映喺公開 /services 頁（快取失效）</p>
      </div>
      <ErrorNote message={error} />
      {list.isLoading ? (
        <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
      ) : (
        <div className="space-y-4">
          {(list.data ?? []).map((category) => (
            <div key={category.id} className={cardClass}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  {category.title}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {category.slug}・{category.services.length} 個服務
                  </span>
                  <span
                    className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                      category.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {category.status === 'published' ? '已發佈' : '草稿'}
                  </span>
                </h2>
                <div className="flex shrink-0 gap-1">
                  <Link
                    href={`/admin/services/category/${category.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    <Pencil size={13} /> 編輯分類
                  </Link>
                  <Link
                    href={`/admin/services/new?category=${category.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    <Plus size={13} /> 新增服務
                  </Link>
                  <ConfirmDeleteButton
                    onConfirm={() => categoryDelete.mutate({ id: category.id })}
                    confirmText={`確定刪除分類「${category.title}」？分類下所有服務會一併刪除，公開 URL 會失效。`}
                  />
                </div>
              </div>
              {category.services.length === 0 ? (
                <p className="text-sm text-slate-400">未有服務</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {category.services.map((service) => (
                        <tr key={service.id} className="border-t border-slate-100">
                          <td className="py-2 pr-3 font-medium text-slate-700">{service.title}</td>
                          <td className="py-2 pr-3 font-mono text-xs text-slate-400">{service.slug}</td>
                          <td className="py-2 pr-3 text-xs text-slate-500">{service.english}</td>
                          <td className="py-2 pr-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs ${
                                service.status === 'published'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {service.status === 'published' ? '已發佈' : '草稿'}
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/services/${category.slug}/${service.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50"
                              >
                                <ExternalLink size={13} /> 查看公開頁
                              </Link>
                              <Link
                                href={`/admin/services/${service.id}/edit`}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50"
                              >
                                <Pencil size={13} /> 編輯
                              </Link>
                              <ConfirmDeleteButton
                                onConfirm={() => serviceDelete.mutate({ id: service.id })}
                                confirmText={`確定刪除服務「${service.title}」？公開 URL 會失效。`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          {(list.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">未有分類</p>
          )}
        </div>
      )}
    </div>
  );
}
