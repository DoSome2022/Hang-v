'use client';

// 分類表單（新增/編輯共用）：外層 query gate 後掛載，state 由 initial 直接初始化
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import type { CatalogCategory } from '@/server/api/routers/catalog';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  ErrorNote,
  Field,
  inputClass,
} from '../../_components/admin-ui';
import { LinesField } from '../../_components/content-fields';

const ICON_OPTIONS = [
  { value: 'brain', label: 'AI（brain）' },
  { value: 'workflow', label: '流程（workflow）' },
  { value: 'cloud', label: '雲端（cloud）' },
  { value: 'shield', label: '資安（shield）' },
  { value: 'code', label: '客製（code）' },
  { value: 'training', label: '培訓（training）' },
];

const linesJoin = (items: string[]) => items.join('\n');
const linesSplit = (text: string) =>
  text.split('\n').map((t) => t.trim()).filter(Boolean);

export default function CategoryForm({
  categoryId,
  initial,
}: {
  categoryId?: string;
  initial?: CatalogCategory;
}) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const createMutation = trpc.catalog.categoryCreate.useMutation({
    onSuccess: () => {
      void utils.catalog.adminList.invalidate();
      router.push('/admin/services');
    },
  });
  const updateMutation = trpc.catalog.categoryUpdate.useMutation({
    onSuccess: () => {
      void utils.catalog.adminList.invalidate();
      router.push('/admin/services');
    },
  });

  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [english, setEnglish] = useState(initial?.english ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'code');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [intro, setIntro] = useState(initial?.intro ?? '');
  const [approach, setApproach] = useState(linesJoin(initial?.approach ?? []));
  const [checklist, setChecklist] = useState(linesJoin(initial?.checklist ?? []));
  const [sortOrderText, setSortOrderText] = useState(
    initial ? String(initial.sortOrder) : '',
  );

  const pending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.isError
    ? createMutation.error.message
    : updateMutation.isError
      ? updateMutation.error.message
      : null;

  const buildInput = () => ({
    slug: slug.trim(),
    title: title.trim(),
    english: english.trim(),
    icon,
    description: description.trim(),
    intro: intro.trim(),
    approach: linesSplit(approach),
    checklist: linesSplit(checklist),
    sortOrder: sortOrderText.trim() === '' ? undefined : Number(sortOrderText),
  });

  return (
    <div className="max-w-[720px] space-y-4">
      <ErrorNote message={error} />
      <div className={`${cardClass} space-y-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="名稱 *" htmlFor="cat-title">
            <input id="cat-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Slug（唯一，小寫英數與 -）*" htmlFor="cat-slug">
            <input id="cat-slug" className={inputClass} pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field label="英文標題" htmlFor="cat-english">
            <input id="cat-english" className={inputClass} value={english} onChange={(e) => setEnglish(e.target.value)} />
          </Field>
          <Field label="圖示" htmlFor="cat-icon">
            <select id="cat-icon" className={inputClass} value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="簡介（列表頁卡片用）" htmlFor="cat-desc">
          <textarea id="cat-desc" className={`${inputClass} min-h-[72px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="分類頁導言" htmlFor="cat-intro">
          <textarea id="cat-intro" className={`${inputClass} min-h-[72px]`} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </Field>
        <LinesField
          label="方法（approach，每行一項；公開頁用全形冒號「：」分隔標題與內文）"
          value={approach}
          onChange={setApproach}
          rows={4}
        />
        <LinesField label="諮詢清單（checklist）" value={checklist} onChange={setChecklist} rows={4} />
        <Field label="排序（數字愈細愈前，留空自動排最尾）" htmlFor="cat-sort">
          <input id="cat-sort" className={inputClass} type="number" min={0} value={sortOrderText} onChange={(e) => setSortOrderText(e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className={btnPrimaryClass}
          disabled={pending || !title.trim() || !slug.trim()}
          onClick={() => {
            if (categoryId) updateMutation.mutate({ id: categoryId, ...buildInput() });
            else createMutation.mutate(buildInput());
          }}
        >
          {pending ? '儲存中…' : '儲存'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/services')}>
          取消
        </button>
      </div>
    </div>
  );
}
