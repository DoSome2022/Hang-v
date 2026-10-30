'use client';

// 開發專案詳情：parts checklist 勾選 + comments 新增/刪除 + 基本資料編輯
// 資料載入後先掛載 ProjectDetail，用 useState 初始值載入（避免 effect setState）。
import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { formatDate, toDateInputValue } from '@/lib/format';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSmallClass,
  cardClass,
  ConfirmDeleteButton,
  ErrorNote,
  Field,
  inputClass,
} from '../../_components/admin-ui';

type ProjectData = {
  id: number;
  name: string;
  client: string;
  status: string;
  delivery: string | Date | null;
  warranty: string | Date | null;
  link: string | null;
  meetings: { date: string; text: string; parts: string[]; people: string[] }[];
  parts: {
    id: string;
    name: string;
    owner: string;
    deadline: string | Date | null;
    checklist: { label: string; done: boolean }[];
    comments: { id: string; who: string; whenLabel: string; text: string }[];
  }[];
};

export default function DevProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);
  const project = trpc.dev.get.useQuery({ id: projectId });

  if (project.isLoading) return <p className="py-8 text-center text-sm text-slate-400">載入中…</p>;
  if (project.isError || !project.data) {
    return (
      <div className={`${cardClass} py-10 text-center`}>
        <p className="text-sm text-slate-500">專案不存在</p>
        <Link href="/admin/devlist" className="mt-4 inline-block text-sm text-[#1a936f] hover:underline">← 返回開發列表</Link>
      </div>
    );
  }
  return <ProjectDetail projectId={projectId} data={project.data} />;
}

function ProjectDetail({ projectId, data }: { projectId: number; data: ProjectData }) {
  const utils = trpc.useUtils();
  const [editingBasic, setEditingBasic] = useState(false);

  const updateMutation = trpc.dev.update.useMutation({
    onSuccess: () => {
      setEditingBasic(false);
      void utils.dev.list.invalidate();
      void utils.dev.get.invalidate({ id: projectId });
    },
  });

  const addPartMutation = trpc.dev.addPart.useMutation({
    onSuccess: () => {
      void utils.dev.get.invalidate({ id: projectId });
      void utils.dev.list.invalidate();
    },
  });

  const updatePartMutation = trpc.dev.updatePart.useMutation({
    onSuccess: () => {
      void utils.dev.get.invalidate({ id: projectId });
    },
  });

  const deletePartMutation = trpc.dev.deletePart.useMutation({
    onSuccess: () => {
      void utils.dev.get.invalidate({ id: projectId });
    },
  });

  const addCommentMutation = trpc.dev.addComment.useMutation({
    onSuccess: () => {
      void utils.dev.get.invalidate({ id: projectId });
    },
  });

  const deleteCommentMutation = trpc.dev.deleteComment.useMutation({
    onSuccess: () => {
      void utils.dev.get.invalidate({ id: projectId });
    },
  });

  const [commentDrafts, setCommentDrafts] = useState<Record<string, { who: string; text: string }>>({});

  return (
    <div className="space-y-6">
      <Link href="/admin/devlist" className="inline-flex items-center gap-1 text-sm text-[#1a936f] hover:underline">
        <ArrowLeft size={15} /> 返回開發列表
      </Link>

      {/* 基本資料 */}
      <div className={cardClass}>
        {!editingBasic ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0d3b66]">{data.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {data.client} · {data.status || '—'}
                {data.link && (
                  <>
                    {' '}·{' '}
                    <a href={data.link} target="_blank" rel="noreferrer" className="text-[#1a936f] hover:underline">
                      {data.link}
                    </a>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                交付：{formatDate(data.delivery)} · 保養至：{formatDate(data.warranty)}
              </p>
              {data.meetings.length > 0 && (
                <div className="mt-3 space-y-2">
                  {data.meetings.map((m, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-3 text-sm">
                      <span className="font-medium text-slate-700">{m.date}：</span>
                      <span className="text-slate-600">{m.text}</span>
                      <div className="mt-1 text-xs text-slate-400">涉及：{m.parts.join('、')} ｜ 與會：{m.people.join('、')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className={btnSecondaryClass} onClick={() => setEditingBasic(true)}>編輯基本資料</button>
          </div>
        ) : (
          <BasicInfoForm
            key="basic-edit"
            initial={data}
            pending={updateMutation.isPending}
            error={updateMutation.isError ? updateMutation.error.message : null}
            onSubmit={(values) => updateMutation.mutate({ id: projectId, ...values, meetings: data.meetings })}
            onCancel={() => setEditingBasic(false)}
          />
        )}
      </div>

      {/* 新增 part */}
      <AddPartCard pending={addPartMutation.isPending} error={addPartMutation.isError ? addPartMutation.error.message : null} onAdd={(values) => addPartMutation.mutate({ projectId, ...values, checklist: [] })} />

      {/* Parts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {data.parts.map((part) => (
          <div key={part.id} className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">{part.name}</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {part.owner || '未指定'} · 期限 {formatDate(part.deadline)}
                </p>
              </div>
              <ConfirmDeleteButton onConfirm={() => deletePartMutation.mutate({ id: part.id })} confirmText="確定刪除呢個開發項目？" />
            </div>

            {/* checklist */}
            <div className="mt-3 space-y-2">
              {part.checklist.map((item, i) => (
                <label key={i} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1a936f]"
                    checked={item.done}
                    disabled={updatePartMutation.isPending}
                    onChange={(e) => {
                      const next = part.checklist.map((c, j) => (j === i ? { ...c, done: e.target.checked } : c));
                      updatePartMutation.mutate({ id: part.id, name: part.name, owner: part.owner, checklist: next });
                    }}
                  />
                  <span className={item.done ? 'text-slate-400 line-through' : ''}>{item.label}</span>
                </label>
              ))}
              {part.checklist.length === 0 && <p className="text-xs text-slate-400">未有檢查項目</p>}
            </div>

            <ChecklistAdder
              onAdd={(label) =>
                updatePartMutation.mutate({ id: part.id, name: part.name, owner: part.owner, checklist: [...part.checklist, { label, done: false }] })
              }
            />

            {/* comments */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-400">備註</span>
              <div className="mt-2 space-y-2">
                {part.comments.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-2 rounded-md bg-slate-50 p-2.5">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-600">{c.who}</span>
                      {c.whenLabel && <span className="ml-1 text-[11px] text-slate-400">{c.whenLabel}</span>}
                      <p className="mt-0.5 text-[13px] text-slate-600">{c.text}</p>
                    </div>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-500"
                      aria-label="刪除備註"
                      onClick={() => deleteCommentMutation.mutate({ id: c.id })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const draft = commentDrafts[part.id];
                  if (!draft?.text.trim() || !draft?.who.trim()) return;
                  addCommentMutation.mutate({ partId: part.id, who: draft.who.trim(), whenLabel: '', text: draft.text.trim() });
                  setCommentDrafts((prev) => ({ ...prev, [part.id]: { who: '', text: '' } }));
                }}
              >
                <input
                  className={`${inputClass} w-[110px]`}
                  placeholder="誰"
                  value={commentDrafts[part.id]?.who ?? ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [part.id]: { who: e.target.value, text: prev[part.id]?.text ?? '' } }))}
                />
                <input
                  className={inputClass}
                  placeholder="輸入備註…"
                  value={commentDrafts[part.id]?.text ?? ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [part.id]: { who: prev[part.id]?.who ?? '', text: e.target.value } }))}
                />
                <button type="submit" className={btnSmallClass}>加入</button>
              </form>
            </div>
          </div>
        ))}
        {data.parts.length === 0 && (
          <p className={`${cardClass} py-8 text-center text-sm text-slate-400`}>未有開發項目，用上方表單加入。</p>
        )}
      </div>
    </div>
  );
}

function BasicInfoForm({
  initial,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ProjectData;
  pending: boolean;
  error: string | null;
  onSubmit: (values: { name: string; client: string; status: string; delivery?: string; warranty?: string; link?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [client, setClient] = useState(initial.client);
  const [status, setStatus] = useState(initial.status);
  const [delivery, setDelivery] = useState(toDateInputValue(initial.delivery));
  const [warranty, setWarranty] = useState(toDateInputValue(initial.warranty));
  const [link, setLink] = useState(initial.link ?? '');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        onSubmit({
          name: name.trim(),
          client: client.trim(),
          status: status.trim(),
          delivery: delivery || undefined,
          warranty: warranty || undefined,
          link: link.trim() || undefined,
        });
      }}
    >
      <h2 className="text-sm font-semibold text-slate-700">編輯基本資料</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="專案名稱 *"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required /></Field>
        <Field label="客戶 *"><input className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} required /></Field>
        <Field label="狀態"><input className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)} /></Field>
        <Field label="專案連結"><input className={inputClass} value={link} onChange={(e) => setLink(e.target.value)} /></Field>
        <Field label="交付日期"><input type="date" className={inputClass} value={delivery} onChange={(e) => setDelivery(e.target.value)} /></Field>
        <Field label="保養到期日"><input type="date" className={inputClass} value={warranty} onChange={(e) => setWarranty(e.target.value)} /></Field>
      </div>
      <ErrorNote message={error} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={pending}>儲存</button>
        <button type="button" className={btnSecondaryClass} onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}

function AddPartCard({
  pending,
  error,
  onAdd,
}: {
  pending: boolean;
  error: string | null;
  onAdd: (values: { name: string; owner: string; deadline?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [deadline, setDeadline] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), owner: owner.trim(), deadline: deadline || undefined });
    setName('');
    setOwner('');
    setDeadline('');
  };

  return (
    <div className={cardClass}>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">新增開發項目</h3>
      <div className="grid gap-3 md:grid-cols-4">
        <input className={inputClass} placeholder="名稱 *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputClass} placeholder="負責人" value={owner} onChange={(e) => setOwner(e.target.value)} />
        <input type="date" className={inputClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <button type="button" className={btnPrimaryClass} disabled={pending || !name.trim()} onClick={submit}>
          <Plus size={15} /> 加入
        </button>
      </div>
      <ErrorNote message={error} />
    </div>
  );
}

function ChecklistAdder({ onAdd }: { onAdd: (label: string) => void }) {
  const [label, setLabel] = useState('');
  return (
    <div className="mt-3 flex gap-2">
      <input
        className={`${inputClass} flex-1`}
        placeholder="新增檢查項目…"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && label.trim()) {
            e.preventDefault();
            onAdd(label.trim());
            setLabel('');
          }
        }}
      />
      <button
        type="button"
        className={btnSmallClass}
        onClick={() => {
          if (label.trim()) {
            onAdd(label.trim());
            setLabel('');
          }
        }}
      >
        <Plus size={13} /> 加
      </button>
    </div>
  );
}
