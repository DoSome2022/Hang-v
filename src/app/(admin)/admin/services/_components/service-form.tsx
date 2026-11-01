'use client';

// 服務表單（新增/編輯共用）：外層 query gate 後掛載，state 由 initial 直接初始化
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/trpc/react';
import type { CatalogService } from '@/server/api/routers/catalog';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  ErrorNote,
  Field,
  inputClass,
} from '../../_components/admin-ui';
import { LinesField, Repeater } from '../../_components/content-fields';

type WorkflowItem = { title: string; text: string };
type FaqItem = { question: string; answer: string };

const linesJoin = (items: string[]) => items.join('\n');
const linesSplit = (text: string) =>
  text.split('\n').map((t) => t.trim()).filter(Boolean);

export default function ServiceForm({
  serviceId,
  initial,
}: {
  serviceId?: string;
  initial?: CatalogService & { categoryId: string };
}) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetCategoryId = searchParams.get('category') ?? undefined;

  const categories = trpc.catalog.adminList.useQuery();
  const createMutation = trpc.catalog.serviceCreate.useMutation({
    onSuccess: () => {
      void utils.catalog.adminList.invalidate();
      router.push('/admin/services');
    },
  });
  const updateMutation = trpc.catalog.serviceUpdate.useMutation({
    onSuccess: () => {
      void utils.catalog.adminList.invalidate();
      router.push('/admin/services');
    },
  });

  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? presetCategoryId ?? categories.data?.[0]?.id ?? '',
  );
  const [english, setEnglish] = useState(initial?.english ?? '');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [intro, setIntro] = useState(initial?.intro ?? '');
  const [problem, setProblem] = useState(initial?.problem ?? '');
  const [benefits, setBenefits] = useState(linesJoin(initial?.benefits ?? []));
  const [capabilities, setCapabilities] = useState(linesJoin(initial?.capabilities ?? []));
  const [fit, setFit] = useState(linesJoin(initial?.fit ?? []));
  const [workflow, setWorkflow] = useState<WorkflowItem[]>(
    initial?.workflow ?? [{ title: '', text: '' }],
  );
  const [faqs, setFaqs] = useState<FaqItem[]>(
    initial?.faqs ?? [{ question: '', answer: '' }],
  );
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
    categoryId,
    english: english.trim(),
    tagline: tagline.trim(),
    intro: intro.trim(),
    problem: problem.trim(),
    benefits: linesSplit(benefits),
    capabilities: linesSplit(capabilities),
    fit: linesSplit(fit),
    workflow: workflow
      .map((w) => ({ title: w.title.trim(), text: w.text.trim() }))
      .filter((w) => w.title || w.text),
    faqs: faqs
      .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter((f) => f.question || f.answer),
    sortOrder: sortOrderText.trim() === '' ? undefined : Number(sortOrderText),
  });

  return (
    <div className="max-w-[720px] space-y-4">
      <ErrorNote message={error} />
      <div className={`${cardClass} space-y-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="名稱 *" htmlFor="svc-title">
            <input id="svc-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Slug（唯一，小寫英數與 -）*" htmlFor="svc-slug">
            <input id="svc-slug" className={inputClass} pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field label="所屬分類 *" htmlFor="svc-category">
            <select
              id="svc-category"
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {(categories.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>{category.title}</option>
              ))}
            </select>
          </Field>
          <Field label="英文標題" htmlFor="svc-english">
            <input id="svc-english" className={inputClass} value={english} onChange={(e) => setEnglish(e.target.value)} />
          </Field>
        </div>
        <Field label="副標（tagline）" htmlFor="svc-tagline">
          <input id="svc-tagline" className={inputClass} value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </Field>
        <Field label="導言（intro）" htmlFor="svc-intro">
          <textarea id="svc-intro" className={`${inputClass} min-h-[72px]`} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </Field>
        <Field label="主要解決的問題（problem）" htmlFor="svc-problem">
          <textarea id="svc-problem" className={`${inputClass} min-h-[56px]`} value={problem} onChange={(e) => setProblem(e.target.value)} />
        </Field>
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-sm font-semibold text-slate-700">陣列內容（每行一項）</h2>
        <LinesField label="好處（benefits）" value={benefits} onChange={setBenefits} rows={4} />
        <LinesField label="能力（capabilities）" value={capabilities} onChange={setCapabilities} rows={4} />
        <LinesField label="適合對象（fit）" value={fit} onChange={setFit} rows={3} />
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-sm font-semibold text-slate-700">工作流程（workflow）</h2>
        <Repeater
          items={workflow}
          onChange={setWorkflow}
          createEmpty={() => ({ title: '', text: '' })}
          keyPrefix="步驟"
          renderItem={(item, _i, update) => (
            <>
              <Field label="步驟標題">
                <input className={inputClass} value={item.title} onChange={(e) => update({ title: e.target.value })} />
              </Field>
              <Field label="步驟內文">
                <textarea className={`${inputClass} min-h-[56px]`} value={item.text} onChange={(e) => update({ text: e.target.value })} />
              </Field>
            </>
          )}
        />
      </div>

      <div className={`${cardClass} space-y-4`}>
        <h2 className="text-sm font-semibold text-slate-700">常見問題（faqs）</h2>
        <Repeater
          items={faqs}
          onChange={setFaqs}
          createEmpty={() => ({ question: '', answer: '' })}
          keyPrefix="FAQ"
          renderItem={(item, _i, update) => (
            <>
              <Field label="問題">
                <input className={inputClass} value={item.question} onChange={(e) => update({ question: e.target.value })} />
              </Field>
              <Field label="答案">
                <textarea className={`${inputClass} min-h-[56px]`} value={item.answer} onChange={(e) => update({ answer: e.target.value })} />
              </Field>
            </>
          )}
        />
      </div>

      <div className={`${cardClass}`}>
        <Field label="排序（數字愈細愈前，留空自動排最尾）" htmlFor="svc-sort">
          <input id="svc-sort" className={inputClass} type="number" min={0} value={sortOrderText} onChange={(e) => setSortOrderText(e.target.value)} />
        </Field>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className={btnPrimaryClass}
          disabled={pending || !title.trim() || !slug.trim() || !categoryId}
          onClick={() => {
            if (serviceId) updateMutation.mutate({ id: serviceId, ...buildInput() });
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
