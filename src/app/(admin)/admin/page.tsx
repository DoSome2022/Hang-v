'use client';

// Dashboard：全部統計來自 tRPC（真實數字）
import Link from 'next/link';
import { FolderKanban, Lightbulb, MapPin, Mail, AlertCircle, Newspaper, Code2 } from 'lucide-react';
import Card from '@/components/Card';
import { trpc } from '@/trpc/react';
import { StatusBadge, tableClass, thClass, tdClass } from './_components/admin-ui';
import { formatDate } from '@/lib/format';

const statCards = [
  { key: 'cases', label: '真實案例', icon: FolderKanban, href: '/admin/cases' },
  { key: 'solutions', label: '解決方案', icon: Lightbulb, href: '/admin/solutions' },
  { key: 'painPoints', label: '痛點', icon: AlertCircle, href: '/admin/pain-points' },
  { key: 'regions', label: '區域', icon: MapPin, href: '/admin/regions' },
  { key: 'news', label: '最新資訊', icon: Newspaper, href: '/admin/news' },
  { key: 'devProjects', label: '開發專案', icon: Code2, href: '/admin/devlist' },
] as const;

export default function DashboardPage() {
  const stats = trpc.dashboard.stats.useQuery();
  const applications = trpc.application.list.useQuery({}, { refetchOnWindowFocus: false });
  const news = trpc.news.list.useQuery();
  const devs = trpc.dev.list.useQuery();

  const recentApplications = applications.data?.slice(0, 5) ?? [];
  const recentNews = news.data?.slice(0, 3) ?? [];
  const recentDevs = devs.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      {/* 統計卡 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} href={href} className="transition hover:-translate-y-0.5">
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf5ef] text-[#1a936f]">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold text-[#0d3b66]">{stats.data?.[key] ?? '—'}</div>
                <div className="truncate text-xs text-slate-500">{label}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* 申請總覽 */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            申請總覽
            <Link href="/admin/apply/all" className="ml-3 text-xs font-normal text-[#1a936f] hover:underline">查看全部 →</Link>
          </h2>
          <Mail size={16} className="text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(['pending', 'quoted', 'developing', 'completed', 'cancelled'] as const).map((status) => (
            <Link
              key={status}
              href={status === 'pending' ? '/admin/apply/pending' : status === 'quoted' || status === 'developing' ? '/admin/apply/processed' : '/admin/apply/all'}
              className="rounded-lg border border-slate-200 p-3 transition hover:border-[#1a936f]"
            >
              <div className="text-lg font-bold text-[#0d3b66]">{stats.data?.applicationStatuses[status] ?? '—'}</div>
              <div className="mt-0.5"><StatusBadge status={status} /></div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* 近期申請 */}
        <Card className="xl:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">近期申請</h2>
          {recentApplications.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">未有申請</p>
          ) : (
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>申請人</th>
                  <th className={thClass}>案例</th>
                  <th className={thClass}>狀態</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((a) => (
                  <tr key={a.id}>
                    <td className={tdClass}>{a.applicantName}</td>
                    <td className={`${tdClass} max-w-[140px] truncate`}>{a.caseTitle}</td>
                    <td className={tdClass}><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* 最新資訊 */}
        <Card className="xl:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">最新資訊</h2>
          {recentNews.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">未有資訊</p>
          ) : (
            <ul className="space-y-3">
              {recentNews.map((n) => (
                <li key={n.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-700">{n.title}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${n.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {n.status === 'published' ? '已發佈' : '草稿'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{formatDate(n.publishedAt)} · {n.category}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 開發項目 */}
        <Card className="xl:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">開發項目</h2>
          {recentDevs.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">未有項目</p>
          ) : (
            <ul className="space-y-3">
              {recentDevs.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/devlist/${d.id}`} className="block rounded-lg border border-slate-100 p-3 transition hover:border-[#1a936f]">
                    <div className="text-sm font-medium text-slate-700">{d.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{d.client} · {d.status}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
