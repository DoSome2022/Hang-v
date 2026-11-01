'use client';

// 分組標籤勾選器：按 TagGroup（行業/痛點/對象）分欄顯示 checkbox。
// 方案表單（用 tagId 直接勾選）同案例表單（勾選時同步 tagNames 文字輸入）共用。
import { trpc } from '@/trpc/react';

export function GroupedTagPicker({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (tagId: string) => void;
}) {
  const groups = trpc.tag.groupList.useQuery();
  if (groups.isLoading) return <p className="text-sm text-slate-400">載入標籤…</p>;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {(groups.data ?? []).map((group) => (
        <div key={group.id}>
          <p className="mb-1 text-xs font-semibold text-slate-500">
            {group.label}
            <span className="ml-1 font-normal text-slate-400">{group.tags.length}</span>
          </p>
          <div className="max-h-[220px] space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {group.tags.length === 0 && <p className="text-xs text-slate-400">未有標籤</p>}
            {group.tags.map((tag) => (
              <label key={tag.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#1a936f]"
                  checked={selectedIds.includes(tag.id)}
                  onChange={() => onToggle(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
