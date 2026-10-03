import Link from "next/link";
import { notFound } from "next/navigation";
import { createCaller } from "@/server/api/caller";
import { ApplyLink } from "@/app/_components/apply-link";

export default async function CasePostPage(
  props: PageProps<"/[slug]/cases/[caseId]">,
) {
  const { slug, caseId } = await props.params;
  const caller = await createCaller();
  const c = await caller.case.getPublic({ id: caseId });
  if (!c) notFound();

  return (
    <main>
      <h1>{c.title}</h1>
      <p>{c.content}</p>
      <h2>所用方案</h2>
      <ul>
        {c.solutions.map((s) => (
          <li key={s.id}>{s.title}</li>
        ))}
      </ul>
      <h2>相關案例</h2>
      <ul>
        {c.relatedCases.map((r) => (
          <li key={r.id}>
            <Link href={`/${slug}/cases/${r.id}`}>{r.title}</Link>
          </li>
        ))}
      </ul>
      <ApplyLink caseId={c.id} title={c.title} label="申請這個案例" />
    </main>
  );
}
