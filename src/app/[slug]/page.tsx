import Link from "next/link";
import { notFound } from "next/navigation";
import { createCaller } from "@/server/api/caller";
import { ApplyLink } from "@/app/_components/apply-link";

export default async function RegionPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const caller = await createCaller();
  const region = await caller.region.get({ slug });
  if (!region) notFound();
  const cases = await caller.case.listPublic({ regionSlug: slug });

  return (
    <main>
      <h1>{region.name}</h1>
      <h2>案例列表</h2>
      <ul>
        {cases.map((c) => (
          <li key={c.id}>
            <Link href={`/${slug}/cases/${c.id}`}>{c.title}</Link>{" "}
            <ApplyLink caseId={c.id} title={c.title} />
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(cases, null, 2)}</pre>
    </main>
  );
}
