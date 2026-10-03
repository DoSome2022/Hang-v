"use client";

import type { inferRouterInputs } from "@trpc/server";
import { useState } from "react";
import type { AppRouter } from "@/server/api/root";
import { trpc } from "@/trpc/react";

type Inputs = inferRouterInputs<AppRouter>;
type RegionCreate = Inputs["region"]["create"];
type PainPointCreate = Inputs["painPoint"]["create"];
type SolutionCreate = Inputs["solution"]["create"];
type CaseCreate = Inputs["case"]["create"];
type IntroCreate = Inputs["intro"]["create"];

const invalidateAll = (utils: ReturnType<typeof trpc.useUtils>) => {
  utils.region.list.invalidate();
  utils.painPoint.list.invalidate();
  utils.solution.list.invalidate();
  utils.case.list.invalidate();
  utils.intro.list.invalidate();
};

// ---------- Region ----------

export function RegionManager() {
  const utils = trpc.useUtils();
  const list = trpc.region.list.useQuery();
  const create = trpc.region.create.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const update = trpc.region.update.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const remove = trpc.region.delete.useMutation({
    onSuccess: () => invalidateAll(utils),
  });

  return (
    <div>
      <h2>新增</h2>
      <RegionForm onSubmit={(v) => create.mutate(v)} />
      <h2>列表</h2>
      <ul>
        {list.data?.map((r) => (
          <li key={r.id}>
            <RegionForm
              initial={r}
              submitLabel="儲存"
              onSubmit={(v) => update.mutate({ ...v, id: r.id })}
            />
            <button onClick={() => remove.mutate({ id: r.id })}>刪除</button>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(list.data ?? null, null, 2)}</pre>
    </div>
  );
}

function RegionForm({
  initial,
  submitLabel = "新增",
  onSubmit,
}: {
  initial?: { name: string; slug: string };
  submitLabel?: string;
  onSubmit: (v: RegionCreate) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, slug });
        if (!initial) {
          setName("");
          setSlug("");
        }
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="名稱" required />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" required />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

// ---------- PainPoint ----------

export function PainPointManager() {
  const utils = trpc.useUtils();
  const list = trpc.painPoint.list.useQuery();
  const create = trpc.painPoint.create.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const update = trpc.painPoint.update.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const remove = trpc.painPoint.delete.useMutation({
    onSuccess: () => invalidateAll(utils),
  });

  return (
    <div>
      <h2>新增</h2>
      <PainPointForm onSubmit={(v) => create.mutate(v)} />
      <h2>列表</h2>
      <ul>
        {list.data?.map((p) => (
          <li key={p.id}>
            <PainPointForm
              initial={p}
              submitLabel="儲存"
              onSubmit={(v) => update.mutate({ ...v, id: p.id })}
            />
            <button onClick={() => remove.mutate({ id: p.id })}>刪除</button>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(list.data ?? null, null, 2)}</pre>
    </div>
  );
}

function RegionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const regions = trpc.region.list.useQuery();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value="">選擇區域</option>
      {regions.data?.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}（{r.slug}）
        </option>
      ))}
    </select>
  );
}

function PainPointForm({
  initial,
  submitLabel = "新增",
  onSubmit,
}: {
  initial?: {
    title: string;
    description: string | null;
    regionId: string;
  };
  submitLabel?: string;
  onSubmit: (v: PainPointCreate) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [regionId, setRegionId] = useState(initial?.regionId ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, description, regionId });
        if (!initial) {
          setTitle("");
          setDescription("");
        }
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="痛點標題" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述（可選）" />
      <RegionSelect value={regionId} onChange={setRegionId} />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

// ---------- Solution ----------

export function SolutionManager() {
  const utils = trpc.useUtils();
  const list = trpc.solution.list.useQuery();
  const create = trpc.solution.create.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const update = trpc.solution.update.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const remove = trpc.solution.delete.useMutation({
    onSuccess: () => invalidateAll(utils),
  });

  return (
    <div>
      <h2>新增</h2>
      <SolutionForm onSubmit={(v) => create.mutate(v)} />
      <h2>列表</h2>
      <ul>
        {list.data?.map((s) => (
          <li key={s.id}>
            <SolutionForm
              initial={s}
              submitLabel="儲存"
              onSubmit={(v) => update.mutate({ ...v, id: s.id })}
            />
            <button onClick={() => remove.mutate({ id: s.id })}>刪除</button>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(list.data ?? null, null, 2)}</pre>
    </div>
  );
}

function PainPointCheckboxes({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const painPoints = trpc.painPoint.list.useQuery();
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  return (
    <div>
      {painPoints.data?.map((p) => (
        <label key={p.id}>
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={() => toggle(p.id)}
          />
          {p.title}
        </label>
      ))}
    </div>
  );
}

function SolutionForm({
  initial,
  submitLabel = "新增",
  onSubmit,
}: {
  initial?: {
    title: string;
    description: string | null;
    regionId: string;
    painPointIds: string[];
  };
  submitLabel?: string;
  onSubmit: (v: SolutionCreate) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [regionId, setRegionId] = useState(initial?.regionId ?? "");
  const [painPointIds, setPainPointIds] = useState(initial?.painPointIds ?? []);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, description, regionId, painPointIds });
        if (!initial) {
          setTitle("");
          setDescription("");
          setPainPointIds([]);
        }
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="方案標題" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述（可選）" />
      <RegionSelect value={regionId} onChange={setRegionId} />
      <PainPointCheckboxes selected={painPointIds} onChange={setPainPointIds} />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

// ---------- Case ----------

export function CaseManager() {
  const utils = trpc.useUtils();
  const list = trpc.case.list.useQuery();
  const create = trpc.case.create.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const update = trpc.case.update.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const remove = trpc.case.delete.useMutation({
    onSuccess: () => invalidateAll(utils),
  });

  return (
    <div>
      <h2>新增</h2>
      <CaseForm onSubmit={(v) => create.mutate(v)} />
      <h2>列表</h2>
      <ul>
        {list.data?.map((c) => (
          <li key={c.id}>
            <CaseForm
              initial={c}
              submitLabel="儲存"
              onSubmit={(v) => update.mutate({ ...v, id: c.id })}
            />
            <button onClick={() => remove.mutate({ id: c.id })}>刪除</button>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(list.data ?? null, null, 2)}</pre>
    </div>
  );
}

function SolutionCheckboxes({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const solutions = trpc.solution.list.useQuery();
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  return (
    <div>
      {solutions.data?.map((s) => (
        <label key={s.id}>
          <input
            type="checkbox"
            checked={selected.includes(s.id)}
            onChange={() => toggle(s.id)}
          />
          {s.title}
        </label>
      ))}
    </div>
  );
}

function CaseForm({
  initial,
  submitLabel = "新增",
  onSubmit,
}: {
  initial?: {
    title: string;
    content: string;
    regionId: string;
    painPointIds: string[];
    solutionIds: string[];
  };
  submitLabel?: string;
  onSubmit: (v: CaseCreate) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [regionId, setRegionId] = useState(initial?.regionId ?? "");
  const [painPointIds, setPainPointIds] = useState(initial?.painPointIds ?? []);
  const [solutionIds, setSolutionIds] = useState(initial?.solutionIds ?? []);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, content, regionId, painPointIds, solutionIds });
        if (!initial) {
          setTitle("");
          setContent("");
          setPainPointIds([]);
          setSolutionIds([]);
        }
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="案例標題" required />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="案例內容"
        required
      />
      <RegionSelect value={regionId} onChange={setRegionId} />
      <p>痛點：</p>
      <PainPointCheckboxes selected={painPointIds} onChange={setPainPointIds} />
      <p>方案：</p>
      <SolutionCheckboxes selected={solutionIds} onChange={setSolutionIds} />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

// ---------- Intro ----------

export function IntroManager() {
  const utils = trpc.useUtils();
  const list = trpc.intro.list.useQuery();
  const create = trpc.intro.create.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const update = trpc.intro.update.useMutation({
    onSuccess: () => invalidateAll(utils),
  });
  const remove = trpc.intro.delete.useMutation({
    onSuccess: () => invalidateAll(utils),
  });

  return (
    <div>
      <h2>新增</h2>
      <IntroForm onSubmit={(v) => create.mutate(v)} />
      <h2>列表</h2>
      <ul>
        {list.data?.map((i) => (
          <li key={i.id}>
            <IntroForm
              initial={i}
              submitLabel="儲存"
              onSubmit={(v) => update.mutate({ ...v, id: i.id })}
            />
            <button onClick={() => remove.mutate({ id: i.id })}>刪除</button>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(list.data ?? null, null, 2)}</pre>
    </div>
  );
}

function IntroForm({
  initial,
  submitLabel = "新增",
  onSubmit,
}: {
  initial?: { title: string; content: string; regionId: string };
  submitLabel?: string;
  onSubmit: (v: IntroCreate) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [regionId, setRegionId] = useState(initial?.regionId ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, content, regionId });
        if (!initial) {
          setTitle("");
          setContent("");
        }
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="標題" required />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="內容" required />
      <RegionSelect value={regionId} onChange={setRegionId} />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

// ---------- Application ----------

export function ApplicationManager() {
  const utils = trpc.useUtils();
  const list = trpc.application.list.useQuery();
  const update = trpc.application.update.useMutation({
    onSuccess: () => utils.application.list.invalidate(),
  });

  return (
    <div>
      <h2>列表</h2>
      <ul>
        {list.data?.map((a) => (
          <li key={a.id}>
            <strong>{a.caseTitle}</strong> — {a.applicantName}（
            {a.applicantContact}）[{a.status}] 痛點：
            {a.painPointsSnapshot.map((p) => p.title).join("、") || "無"}
            <button
              onClick={() =>
                update.mutate({
                  id: a.id,
                  status: a.status === "pending" ? "processed" : "pending",
                })
              }
            >
              {a.status === "pending" ? "標記已處理" : "改回待處理"}
            </button>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(list.data ?? null, null, 2)}</pre>
    </div>
  );
}
