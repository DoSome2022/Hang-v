import Link from "next/link";
import { createCaller } from "@/server/api/caller";

export default async function HomePage() {
  const caller = await createCaller();
  const regions = await caller.region.list();

  return (
    <main>
      <h1>區域列表</h1>
      <ul>
        {regions.map((r) => (
          <li key={r.id}>
            <Link href={`/${r.slug}`}>{r.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
