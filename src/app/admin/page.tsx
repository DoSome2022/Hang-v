import Link from "next/link";

const RESOURCES = [
  { href: "/admin/regions", label: "區域 Region" },
  { href: "/admin/pain-points", label: "痛點 PainPoint" },
  { href: "/admin/solutions", label: "方案 Solution" },
  { href: "/admin/cases", label: "案例 Case" },
  { href: "/admin/intros", label: "介紹 Intro" },
  { href: "/admin/applications", label: "申請 Application" },
];

export default function AdminDashboardPage() {
  return (
    <main>
      <h1>Admin 總覽</h1>
      <ul>
        {RESOURCES.map((r) => (
          <li key={r.href}>
            <Link href={r.href}>{r.label}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
