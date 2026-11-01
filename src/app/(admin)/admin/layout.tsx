"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Mail,
  MailPlus,
  MailCheck,
  BriefcaseBusiness,
  FolderKanban,
  Lightbulb,
  Newspaper,
  MapPin,
  AlertCircle,
  Code2,
  LucideIcon,
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  Wallet,
  Tags,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";

type MenuItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};
type MenuGroup = {
  label: string;
  items: MenuItem[];
};
const menuGroups: MenuGroup[] = [
  {
    label: "總覽",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "新申請列表", href: "/admin/apply/pending", icon: MailPlus },
      { title: "處理中申請", href: "/admin/apply/processed", icon: MailCheck },
      { title: "所有申請", href: "/admin/apply/all", icon: Mail },
    ],
  },
  {
    label: "專案與帳目",
    items: [
      { title: "開發列表", href: "/admin/devlist", icon: Code2 },
      { title: "帳目", href: "/admin/accounts", icon: Wallet },
    ],
  },
  {
    label: "內容管理",
    items: [
      { title: "服務目錄", href: "/admin/services", icon: LayoutGrid },
      { title: "服務介紹", href: "/admin/intros", icon: BriefcaseBusiness },
      { title: "真實案例", href: "/admin/cases", icon: FolderKanban },
      { title: "解決方案", href: "/admin/solutions", icon: Lightbulb },
      { title: "最新資訊", href: "/admin/news", icon: Newspaper },
      { title: "區域管理", href: "/admin/regions", icon: MapPin },
      { title: "痛點管理", href: "/admin/pain-points", icon: AlertCircle },
      { title: "標籤管理", href: "/admin/tags", icon: Tags },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // 真實統計：新申請 badge 與通知數
  const stats = trpc.dashboard.stats.useQuery();
  const pendingCount = stats.data?.applicationStatuses.pending ?? 0;

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const allItems = menuGroups.flatMap((group) => group.items);
  const currentItem = allItems.find((item) => isActive(item.href));
  const pageTitle = currentItem?.title ?? "Dashboard";

  const handleLogout = async () => {
    await signOut({ redirectTo: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col overflow-y-auto bg-gradient-to-b from-[#0a1f33] to-[#0d3b66] text-[#ccc] transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a936f] text-base font-bold text-white">
            H
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold text-white">
              Hangs <span className="text-[#1a936f]">Tech</span>
            </div>
            <div className="text-xs text-[#9fb0c3]">Admin Panel</div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const badge = item.href === "/admin/apply/pending" ? pendingCount : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "mb-0.5 flex items-center gap-3 rounded-lg border-l-[3px] border-transparent px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "border-[#1a936f] bg-white/10 font-medium text-white"
                        : "text-[#b5c2d0] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon size={18} className={cn("shrink-0", active ? "text-[#37c39a]" : "text-[#8fa0b3]")} />
                    <span className="flex-1 truncate">{item.title}</span>
                    {badge !== undefined && badge > 0 && (
                      <span className="rounded-full bg-[#1a936f] px-2 py-0.5 text-[11px] font-semibold text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        {/* Sidebar footer */}
        <div className="border-t border-white/10 px-6 py-4 text-xs text-[#8fa0b3]">
          © {new Date().getFullYear()} Hangs Tech Limited
        </div>
      </aside>
      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-[250px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e2e8f0] bg-white px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="開啟選單"
            className="rounded-md p-1.5 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <h1 className="text-base font-semibold text-[#0d3b66] md:text-lg">
            {pageTitle}
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/admin/apply/pending"
              aria-label="新申請通知"
              className="relative rounded-md p-1.5 hover:bg-slate-100"
            >
              <Bell size={20} className="text-slate-500" />
              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>

            {/* Admin 下拉選單 */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-md p-1.5 hover:bg-slate-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d3b66] text-sm font-semibold text-white">
                  A
                </div>
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  Admin
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {userDropdownOpen && (
                <>
                  {/* 點空白關閉 */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  {/* 下拉面板 */}
                  <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-sm">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2.5 text-sm text-red-600 hover:bg-slate-100"
                    >
                      <LogOut size={16} />
                      登出
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
