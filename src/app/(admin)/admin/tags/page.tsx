'use client';

// 標籤管理：類型（TagGroup）建立/改名/刪除 + 三組標籤 CRUD
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { trpc } from '@/trpc/react';
import {
  cardClass,
  ConfirmDeleteButton,
  ErrorNote,
  inputClass,
} from '../_components/admin-ui';

export default function TagsPage() {
  const utils = trpc.useUtils();
  const groups = trpc.tag.groupList.useQuery();
  const createMutation = trpc.tag.create.useMutation({
    onSuccess: () => {
      setNewName('');
      void utils.tag.groupList.invalidate();
    },
  });
  const updateMutation = trpc.tag.update.useMutation({
    onSuccess: () => {
      void utils.tag.groupList.invalidate();
    },
  });
  const deleteMutation = trpc.tag.delete.useMutation({
    onSuccess: () => {
      void utils.tag.groupList.invalidate();
    },
  });
  const groupCreateMutation = trpc.tag.groupCreate.useMutation({
    onSuccess: () => {
      setNewGroupLabel('');
      void utils.tag.groupList.invalidate();
    },
  });
  const groupUpdateMutation = trpc.tag.groupUpdate.useMutation({
    onSuccess: () => {
      setEditingGroupId(null);
      void utils.tag.groupList.invalidate();
    },
  });
  const groupDeleteMutation = trpc.tag.groupDelete.useMutation({
    onSuccess: () => {
      void utils.tag.groupList.invalidate();
    },
  });

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newGroupLabel, setNewGroupLabel] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupLabel, setEditingGroupLabel] = useState('');

  const error = createMutation.isError
    ? createMutation.error.message
    : updateMutation.isError
      ? updateMutation.error.message
      : deleteMutation.isError
        ? deleteMutation.error.message
        : groupCreateMutation.isError
          ? groupCreateMutation.error.message
          : groupUpdateMutation.isError
            ? groupUpdateMutation.error.message
            : groupDeleteMutation.isError
              ? groupDeleteMutation.error.message
              : null;

  const saveGroupLabel = (groupId: string) => {
    if (editingGroupLabel.trim()) {
      groupUpdateMutation.mutate({ id: groupId, label: editingGroupLabel.trim() });
    } else {
      setEditingGroupId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ErrorNote message={error} />

      {/* 新增類型：建立新 TagGroup，建立後會多一張卡片 */}
      <div className={cardClass}>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">新增類型</h2>
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="類型名稱，例如：地區"
            value={newGroupLabel}
            onChange={(e) => setNewGroupLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newGroupLabel.trim()) {
                e.preventDefault();
                groupCreateMutation.mutate({ label: newGroupLabel.trim() });
              }
            }}
          />
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-[#0d3b66] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0a2f52] disabled:opacity-60"
            disabled={groupCreateMutation.isPending || !newGroupLabel.trim()}
            onClick={() => groupCreateMutation.mutate({ label: newGroupLabel.trim() })}
          >
            <Plus size={14} /> 加類型
          </button>
        </div>
      </div>

      {groups.isLoading ? (
        <p className="py-8 text-center text-sm text-slate-400">載入中…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {(groups.data ?? []).map((group) => (
            <div key={group.id} className={cardClass}>
              {editingGroupId === group.id ? (
                <div className="mb-3 flex items-center gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={editingGroupLabel}
                    onChange={(e) => setEditingGroupLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveGroupLabel(group.id);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => saveGroupLabel(group.id)}
                  >
                    儲存
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-700">
                    {group.label}
                    <span className="ml-2 text-xs font-normal text-slate-400">{group.tags.length} 個</span>
                  </h2>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                      onClick={() => {
                        setEditingGroupId(group.id);
                        setEditingGroupLabel(group.label);
                      }}
                    >
                      改名
                    </button>
                    <ConfirmDeleteButton
                      onConfirm={() => groupDeleteMutation.mutate({ id: group.id })}
                      confirmText="確定刪除呢個類型？組內所有標籤會一併刪除，已關聯的案例與資訊會失去這些標籤。"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {group.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    {editingId === tag.id ? (
                      <>
                        <input
                          className={`${inputClass} flex-1`}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editingName.trim()) {
                              e.preventDefault();
                              updateMutation.mutate({ id: tag.id, name: editingName.trim() });
                              setEditingId(null);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                          onClick={() => {
                            if (editingName.trim()) updateMutation.mutate({ id: tag.id, name: editingName.trim() });
                            setEditingId(null);
                          }}
                        >
                          儲存
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 rounded bg-slate-100 px-2 py-1 text-[13px] text-slate-700">{tag.name}</span>
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                          onClick={() => {
                            setEditingId(tag.id);
                            setEditingName(tag.name);
                          }}
                        >
                          改名
                        </button>
                        <ConfirmDeleteButton
                          onConfirm={() => deleteMutation.mutate({ id: tag.id })}
                          confirmText="確定刪除呢個標籤？已關聯的案例與資訊會失去此標籤。"
                        />
                      </>
                    )}
                  </div>
                ))}
                {group.tags.length === 0 && <p className="text-sm text-slate-400">未有標籤</p>}
              </div>
              {/* 新增 */}
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <input
                  className={inputClass}
                  placeholder="新標籤名稱"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newName.trim()) {
                      e.preventDefault();
                      createMutation.mutate({ name: newName.trim(), groupId: group.id });
                    }
                  }}
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-[#0d3b66] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0a2f52] disabled:opacity-60"
                  disabled={createMutation.isPending || !newName.trim()}
                  onClick={() => createMutation.mutate({ name: newName.trim(), groupId: group.id })}
                >
                  <Plus size={14} /> 加
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
