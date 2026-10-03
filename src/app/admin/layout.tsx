import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { SignOutButton } from "@/app/admin/_components/sign-out-button";

const NAV = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/regions", label: "區域" },
  { href: "/admin/pain-points", label: "痛點" },
  { href: "/admin/solutions", label: "方案" },
  { href: "/admin/cases", label: "案例" },
  { href: "/admin/intros", label: "介紹" },
  { href: "/admin/applications", label: "申請" },
];

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <nav>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <SignOutButton />
      </nav>
      {children}
    </div>
  );
}
