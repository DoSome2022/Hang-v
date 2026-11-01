'use client';

// 行銷內容 admin 表單共用欄位（跟 case-editor 嘅 pattern）：
// array 欄位用「一行一條」字串 state，submit 先 split；動態增刪用 functional setState + index
import { Plus, Trash2 } from 'lucide-react';
import { btnSmallClass, cardClass, Field, inputClass } from './admin-ui';

/** 「一行一條」字串陣列編輯：state 係 join('\n') 字串，提交時先 split */
export function LinesField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        className={`${inputClass} min-h-[${rows * 24}px] resize-y`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '每行一項'}
      />
    </Field>
  );
}

/** 泛用 array 增刪編輯器 */
export function Repeater<T>({
  items,
  onChange,
  renderItem,
  addLabel,
  createEmpty,
  keyPrefix,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel?: string;
  createEmpty: () => T;
  keyPrefix: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={`${keyPrefix}-${i}`} className={`${cardClass} space-y-3`}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {keyPrefix} {i + 1}
            </span>
            <button
              type="button"
              className={btnSmallClass}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 size={13} /> 刪除
            </button>
          </div>
          {renderItem(item, i, (patch) =>
            onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))),
          )}
        </div>
      ))}
      <button type="button" className={btnSmallClass} onClick={() => onChange([...items, createEmpty()])}>
        <Plus size={13} /> {addLabel ?? '新增一項'}
      </button>
    </div>
  );
}
