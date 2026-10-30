'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { btnPrimaryClass, btnSecondaryClass, cardClass, ErrorNote, Field, inputClass } from '../../_components/admin-ui';

export default function DevListNewPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState('');
  const [delivery, setDelivery] = useState('');
  const [warranty, setWarranty] = useState('');
  const [link, setLink] = useState('');

  const createMutation = trpc.dev.create.useMutation({
    onSuccess: () => {
      void utils.dev.list.invalidate();
      void utils.dashboard.stats.invalidate();
      router.push('/admin/devlist');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    createMutation.mutate({
      name: name.trim(),
      client: client.trim(),
      status: status.trim(),
      delivery: delivery || undefined,
      warranty: warranty || undefined,
      link: link.trim() || undefined,
      meetings: [],
    });
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} max-w-[640px] space-y-4`}>
      <h2 className="text-sm font-semibold text-slate-700">新增開發專案</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="專案名稱 *" htmlFor="dev-name">
          <input id="dev-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
        </Field>
        <Field label="客戶 *" htmlFor="dev-client">
          <input id="dev-client" className={inputClass} value={client} onChange={(e) => setClient(e.target.value)} required maxLength={200} />
        </Field>
        <Field label="狀態" htmlFor="dev-status">
          <input id="dev-status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)} maxLength={100} />
        </Field>
        <Field label="專案連結" htmlFor="dev-link">
          <input id="dev-link" type="url" className={inputClass} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="交付日期" htmlFor="dev-delivery">
          <input id="dev-delivery" type="date" className={inputClass} value={delivery} onChange={(e) => setDelivery(e.target.value)} />
        </Field>
        <Field label="保養到期日" htmlFor="dev-warranty">
          <input id="dev-warranty" type="date" className={inputClass} value={warranty} onChange={(e) => setWarranty(e.target.value)} />
        </Field>
      </div>
      <ErrorNote message={createMutation.isError ? createMutation.error.message : null} />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimaryClass} disabled={createMutation.isPending}>
          {createMutation.isPending ? '儲存中…' : '建立'}
        </button>
        <button type="button" className={btnSecondaryClass} onClick={() => router.push('/admin/devlist')}>取消</button>
      </div>
    </form>
  );
}
