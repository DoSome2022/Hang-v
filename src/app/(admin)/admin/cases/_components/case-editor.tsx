'use client';

// 案例編輯器：新增（/admin/cases/new）與編輯（/admin/cases/[id]/edit）共用
// 編輯模式：資料載入後先掛載 CaseForm，用 useState 初始值載入（避免 effect setState）。
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { parseCaseContent } from '@/server/case-content';
import { toDateInputValue } from '@/lib/format';
import { GroupedTagPicker } from '../../_components/tag-picker';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSmallClass,
  cardClass,
  ErrorNote,
  Field,
  inputClass,
} from '../../_components/admin-ui';

export default function CaseEditor({ caseId }: { caseId?: string }) {
  const existing = trpc.case.get.useQuery({ id: caseId ?? '' }, { enabled: Boolean(caseId) });

  if (caseId) {
    if (existing.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入案例中…</p>;
    if (existing.isError || !existing.data) {
      return <p className="py-8 text-center text-sm text-slate-500">案例不存在</p>;
    }
  }
  return <CaseForm caseId={caseId} initial={existing.data} />;
}

type Initial = {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  english: string;
  summary: string;
  excerpt: string;
  readTime: string;
  publishedAt: string | Date | null;
  regionId: string;
  tagNames: string[];
  painPointIds: string[];
  solutionIds: string[];
};

type SectionState = { heading: string; paragraphs: string; bullets: string };

const emptySection = (): SectionState => ({ heading: '', paragraphs: '', bullets: '' });

function CaseForm({ caseId, initial }: { caseId?: string; initial?: Initial }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const isEdit = Boolean(caseId);

  const regions = trpc.region.list.useQuery();
  const painPoints = trpc.painPoint.list.useQuery();
  const solutions = trpc.solution.list.useQuery();
  const tagGroups = trpc.tag.groupList.useQuery();

  const initialContent = initial ? parseCaseContent(initial.content) : null;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [english, setEnglish] = useState(initial?.english ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [readTime, setReadTime] = useState(initial?.readTime ?? '');
  const [publishedAt, setPublishedAt] = useState(initial ? toDateInputValue(initial.publishedAt) : '');
  const [regionId, setRegionId] = useState(initial?.regionId ?? '');
  const [tagNames, setTagNames] = useState(initial?.tagNames.join(', ') ?? '');

  // 分組標籤勾選器同 tagNames 文字輸入同步（以標籤名稱為準）
  const selectedTagIds = useMemo(() => {
    const names = tagNames.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const all = (tagGroups.data ?? []).flatMap((g) => g.tags);
    return all.filter((t) => names.includes(t.name)).map((t) => t.id);
  }, [tagNames, tagGroups.data]);

  const toggleTagById = (tagId: string) => {
    const tag = (tagGroups.data ?? []).flatMap((g) => g.tags).find((t) => t.id === tagId);
    if (!tag) return;
    const names = tagNames.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const next = names.includes(tag.name) ? names.filter((n) => n !== tag.name) : [...names, tag.name];
    setTagNames(next.join(', '));
  };
  const [lead, setLead] = useState(initialContent?.lead ?? '');
  const [sections, setSections] = useState<SectionState[]>(
    () =>
      initialContent?.sections.map((s) => ({
        heading: s.heading,
        paragraphs: s.paragraphs.join('\n'),
        bullets: (s.bullets ?? []).join('\n'),
      })) ?? [],
  );
  const [resultLabel, setResultLabel] = useState(initialContent?.result.label ?? '');
  const [resultValue, setResultValue] = useState(initialContent?.result.value ?? '');
  const [resultNote, setResultNote] = useState(initialContent?.result.note ?? '');
  const [painPointIds, setPainPointIds] = useState<string[]>(initial?.painPointIds ?? []);
  const [solutionIds, setSolutionIds] = useState<string[]>(initial?.solutionIds ?? []);

  // 新增模式：未有區域選擇時用第一個區域
  const effectiveRegionId = regionId || (regions.data?.[0]?.id ?? '');

  const error = regions.isError ? '載入區域失敗' : null;

  const createMutation = trpc.case.create.useMutation({
    onSuccess: () => {
      void utils.case.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/cases');
    },
  });
  const updateMutation = trpc.case.update.useMutation({
    onSuccess: () => {
      void utils.case.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/cases');
    },
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  const buildInput = () => ({
    title: title.trim(),
    slug: slug.trim(),
    category: category.trim(),
    english: english.trim(),
    summary: summary.trim(),
    excerpt: excerpt.trim(),
    readTime: readTime.trim(),
    publishedAt: publishedAt || undefined,
    tagNames: tagNames.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    regionId: effectiveRegionId,
    lead,
    sections: sections
      .map((s) => ({
        heading: s.heading.trim(),
        paragraphs: s.paragraphs.split('\n').map((p) => p.trim()).filter(Boolean),
        bullets: s.bullets.split('\n').map((b) => b.trim()).filter(Boolean),
      }))
      .filter((s) => s.heading || s.paragraphs.length > 0 || s.bullets.length > 0),
    result: { label: resultLabel.trim(), value: resultValue.trim(), note: resultNote.trim() },
    painPointIds,
    solutionIds,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const input = buildInput();
    if (isEdit && caseId) {
      updateMutation.mutate({ id: caseId, ...input });
    } else {
      createMutation.mutate(input);
    }
  };

  const mutationError = createMutation.isError || updateMutation.isError
    ? (createMutation.error?.message ?? updateMutation.error?.message ?? '儲存失敗')
    : null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ErrorNote message={error} />
      {/* 基本資料 */}
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">基本資料</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="標題 *" htmlFor="case-title">
            <input id="case-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </Field>
          <Field label="Slug（URL，小寫英數與 -）*" htmlFor="case-slug">
            <input
              id="case-slug"
              className={inputClass}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              title="只可用小寫英數與 -"
              placeholder="example-case-slug"
            />
          </Field>
          <Field label="分類" htmlFor="case-category">
            <input id="case-category" className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={120} placeholder="教育 / 零售…" />
          </Field>
          <Field label="英文標題" htmlFor="case-english">
            <input id="case-english" className={inputClass} value={english} onChange={(e) => setEnglish(e.target.value)} maxLength={200} />
          </Field>
          <Field label="摘要（SEO description）" htmlFor="case-summary">
            <input id="case-summary" className={inputClass} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={300} />
          </Field>
          <Field label="節錄（卡片顯示）" htmlFor="case-excerpt">
            <input id="case-excerpt" className={inputClass} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={200} />
          </Field>
          <Field label="閱讀時間" htmlFor="case-readtime">
            <input id="case-readtime" className={inputClass} value={readTime} onChange={(e) => setReadTime(e.target.value)} maxLength={20} placeholder="5 分鐘" />
          </Field>
          <Field label="發佈日期" htmlFor="case-date">
            <input id="case-date" type="date" className={inputClass} value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          </Field>
          <Field label="區域 *" htmlFor="case-region">
            <select id="case-region" className={inputClass} value={effectiveRegionId} onChange={(e) => setRegionId(e.target.value)} required>
              <option value="">選擇區域</option>
              {(regions.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>
          <Field label="標籤（以逗號分隔）" htmlFor="case-tags">
            <input id="case-tags" className={inputClass} value={tagNames} onChange={(e) => setTagNames(e.target.value)} placeholder="教育, 中小企" />
          </Field>
          <div className="md:col-span-2">
            <p className="mb-2 text-[13px] font-medium text-slate-600">或者直接勾選（行業 / 痛點 / 對象）</p>
            <GroupedTagPicker selectedIds={selectedTagIds} onToggle={toggleTagById} />
          </div>
        </div>
      </div>

      {/* 內容 */}
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">內容</h2>
        <Field label="導言" htmlFor="case-lead">
          <textarea id="case-lead" className={`${inputClass} min-h-[80px]`} value={lead} onChange={(e) => setLead(e.target.value)} />
        </Field>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-600">段落（每段：標題 + 內文 + 重點，一行一條）</h3>
            <button type="button" className={btnSmallClass} onClick={() => setSections((prev) => [...prev, emptySection()])}>
              <Plus size={14} /> 加段落
            </button>
          </div>
          {sections.map((s, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">段落 {i + 1}</span>
                <button type="button" className="text-red-500 hover:text-red-600" aria-label="刪除段落" onClick={() => setSections((prev) => prev.filter((_, j) => j !== i))}>
                  <Trash2 size={15} />
                </button>
              </div>
              <input
                className={`${inputClass} mb-3`}
                placeholder="段落標題（例如：背景）"
                value={s.heading}
                onChange={(e) => setSections((prev) => prev.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)))}
              />
              <textarea
                className={`${inputClass} min-h-[90px]`}
                placeholder={'內文（一行一段）'}
                value={s.paragraphs}
                onChange={(e) => setSections((prev) => prev.map((x, j) => (j === i ? { ...x, paragraphs: e.target.value } : x)))}
              />
              <textarea
                className={`${inputClass} min-h-[60px]`}
                placeholder="重點（一行一條，選填）"
                value={s.bullets}
                onChange={(e) => setSections((prev) => prev.map((x, j) => (j === i ? { ...x, bullets: e.target.value } : x)))}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="成效標籤" htmlFor="case-result-label">
            <input id="case-result-label" className={inputClass} value={resultLabel} onChange={(e) => setResultLabel(e.target.value)} placeholder="整體成效" />
          </Field>
          <Field label="成效數值" htmlFor="case-result-value">
            <input id="case-result-value" className={inputClass} value={resultValue} onChange={(e) => setResultValue(e.target.value)} placeholder="行政時間慳 60%" />
          </Field>
          <Field label="成效備註" htmlFor="case-result-note">
            <input id="case-result-note" className={inputClass} value={resultNote} onChange={(e) => setResultNote(e.target.value)} />
          </Field>
        </div>
      </div>

      {/* 關聯 */}
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">關聯</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-600">痛點</h3>
            <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {(painPoints.data ?? []).length === 0 && <p className="text-sm text-slate-400">未有痛點（先去痛點管理建立）</p>}
              {(painPoints.data ?? []).map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1a936f]"
                    checked={painPointIds.includes(p.id)}
                    onChange={(e) =>
                      setPainPointIds((prev) => (e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)))
                    }
                  />
                  {p.title}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-600">所用方案</h3>
            <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {(solutions.data ?? []).length === 0 && <p className="text-sm text-slate-400">未有方案（先去解決方案建立）</p>}
              {(solutions.data ?? []).map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1a936f]"
                    checked={solutionIds.includes(s.id)}
                    onChange={(e) =>
                      setSolutionIds((prev) => (e.target.checked ? [...prev, s.id] : prev.filter((x) => x !== s.id)))
                    }
                  />
                  {s.title}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ErrorNote message={mutationError} />

      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={pending || Boolean(error)}>
          {pending ? '儲存中…' : isEdit ? '儲存修改' : '建立案例'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/cases')}>
          取消
        </button>
      </div>
    </form>
  );
}
