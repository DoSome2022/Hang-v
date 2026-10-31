'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  UserRound,
  UsersRound,
  Building2
} from 'lucide-react';
import { Brand, Consultation, useHydrated } from './shared-ui';
import { categories } from '@/lib/service-catalog';
import { categoryIcons } from './catalog-icons';
import { useRegions } from '@/lib/use-regions';
import { buttonClass, buttonPrimaryClass } from '@/lib/ui';
export const solutionLinks = [
  { href: '/solutions/solo', label: '一人公司', note: '讓 AI 成為你的日常助手', icon: UserRound },
  { href: '/solutions/sme', label: '中小企業', note: '接通流程，讓團隊掌握技術', icon: UsersRound },
  { href: '/solutions/enterprise', label: '企業團隊', note: '從治理到部署，穩健擴展', icon: Building2 }
];
type ConsultPrefill = {
  message?: string;
  service?: string;
};
const ConsultationContext = createContext<{
  openConsult: (prefill?: ConsultPrefill) => void;
} | null>(null);
export function useConsultation() {
  const value = useContext(ConsultationContext);
  if (!value) throw new Error('Consultation must be used within SiteShell');
  return value;
}
export function ConsultButton({
  children = '預約免費諮詢',
  className = ''
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { openConsult } = useConsultation();
  const ready = useHydrated();
  return (
    <button
      disabled={!ready}
      className={`${buttonClass} ${buttonPrimaryClass} ${className}`}
      onClick={() => openConsult()}
    >
      {children}
      <ArrowUpRight size={17} />
    </button>
  );
}
const navLinkClass =
  'relative px-0 py-[29px] text-[13px] font-[450] text-[#58616d] transition-colors duration-200 after:absolute after:bottom-[19px] after:left-1/2 after:h-[4px] after:w-[4px] after:-translate-x-1/2 after:scale-0 after:rounded-full after:bg-green after:transition-transform after:duration-200 after:content-[\'\'] hover:text-green-dark';
function ServicesMegaMenu({ pathname, close }: { pathname: string; close: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(categories[0].slug);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeCategory = categories.find((category) => category.slug === active) ?? categories[0];
  const servicesActive = pathname.startsWith('/services');
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        className={`inline-flex cursor-pointer items-center gap-[5px] border-0 bg-none p-[10px_4px] text-[14px] text-[#334033] transition-colors duration-150 hover:text-green-dark [&>svg]:transition-transform [&>svg]:duration-200 aria-expanded:[&>svg]:rotate-180 ${servicesActive ? 'text-green-dark' : ''}`}
        aria-expanded={open}
        aria-controls="services-mega-panel"
        onClick={() => setOpen((value) => !value)}
      >
        服務
        <ChevronDown size={13} />
      </button>
      <div
        id="services-mega-panel"
        className={`absolute left-1/2 top-full z-[60] w-[780px] max-w-[92vw] -translate-x-1/2 pt-[14px] ${open ? 'block' : 'hidden'}`}
        aria-label="服務選單"
      >
        <div className="grid grid-cols-[272px_1fr] overflow-hidden rounded-[14px] border border-[#e1e9d8] bg-white shadow-[0_32px_60px_-30px_rgba(22,33,68,.2)]">
          <div className="border-r border-[#e9efe2] bg-[#fafcf8] p-[18px_14px]">
            <p className="mb-3 flex items-baseline justify-between gap-[10px] font-[Arial,sans-serif] text-[10px] tracking-[1.6px] text-[#96a785]">
              服務分類
              <span className="text-right text-[9px] tracking-[0.8px] text-[#b8c5a8]">SERVICE CATEGORIES</span>
            </p>
            {categories.map((category) => {
              const Icon = categoryIcons[category.icon];
              return (
                <button
                  key={category.slug}
                  className={`flex w-full cursor-pointer items-center gap-[11px] rounded-[9px] border-0 bg-none p-[10px_12px] text-left text-[13px] text-[#4d5c3d] hover:bg-[#eef4e5] hover:text-[#3f5a2a] ${active === category.slug ? 'bg-[#eef4e5] text-[#3f5a2a]' : ''}`}
                  onMouseEnter={() => setActive(category.slug)}
                  onFocus={() => setActive(category.slug)}
                  onClick={() => {
                    close();
                    router.push(`/services/${category.slug}`);
                  }}
                >
                  <span className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-[7px] border border-[#e1e9d8] bg-white text-[#7fa34f]">
                    <Icon size={17} strokeWidth={1.5} />
                  </span>
                  <span>{category.title}</span>
                  <ArrowRight size={14} className="ml-auto text-[#a3b58e]" />
                </button>
              );
            })}
            <Link href="/services" onClick={close} className="mt-[15px] inline-flex items-center gap-[7px] text-[12px] font-medium text-[#68854e] hover:text-green-dark">
              查看全部服務介紹
              <ArrowUpRight size={15} />
            </Link>
            <Link href="/choose-service" onClick={close} className="mt-3 flex items-center justify-between border-t border-dashed border-[#dfe8d3] pt-[13px] text-[12px] font-semibold text-[#009c6f] hover:text-[#007a58]">
              選擇我們的服務
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="p-[20px_24px]">
            <p className="mb-3 flex items-baseline justify-between gap-[10px] font-[Arial,sans-serif] text-[10px] tracking-[1.6px] text-[#96a785]">
              {activeCategory.title}
              <span className="text-right text-[9px] tracking-[0.8px] text-[#b8c5a8]">{activeCategory.english}</span>
            </p>
            {activeCategory.services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${activeCategory.slug}/${service.slug}`}
                onClick={close}
                className="flex items-center justify-between gap-[14px] border-b border-[#eef2e7] p-[10px_6px] text-[13px] text-[#3a4630]"
              >
                <span className="flex flex-col gap-[3px]">
                  <strong className="text-[14px] font-[550] text-[#33402a] group-hover:text-green-dark">{service.title}</strong>
                  <small className="font-[Arial,sans-serif] text-[9px] tracking-[0.8px] text-[#a0b08e]">{service.english}</small>
                </span>
                <ArrowUpRight size={15} className="shrink-0 text-[#8da776]" />
              </Link>
            ))}
            <Link
              href={`/services/${activeCategory.slug}`}
              onClick={close}
              className="mt-[15px] inline-flex items-center gap-[7px] text-[12px] font-medium text-[#68854e] hover:text-green-dark"
            >
              查看「{activeCategory.title}」全部
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ready = useHydrated();
  const mobileButton = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDetailsElement>(null);
  const regionsDropdown = useRef<HTMLDetailsElement>(null);
  const header = useRef<HTMLElement>(null);
  // 區域列表 client-side 讀取；冇區域/失敗 → null（選單項目隱藏）
  const regions = useRegions();
  const closeMenus = () => {
    setMobileOpen(false);
    if (dropdown.current) dropdown.current.open = false;
    if (regionsDropdown.current) regionsDropdown.current.open = false;
  };

  // 手機選單開啟時鎖 body scroll
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const pointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) {
        if (dropdown.current) dropdown.current.open = false;
        if (regionsDropdown.current) regionsDropdown.current.open = false;
        setMobileOpen(false);
      }
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (dropdown.current?.open) {
        dropdown.current.open = false;
        dropdown.current.querySelector('summary')?.focus();
      }
      if (regionsDropdown.current?.open) {
        regionsDropdown.current.open = false;
        regionsDropdown.current.querySelector('summary')?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        mobileButton.current?.focus();
      }
    };
    const media = window.matchMedia('(min-width: 701px)');
    const resize = () => {
      if (media.matches) {
        setMobileOpen(false);
      } else {
        if (dropdown.current) dropdown.current.open = false;
        if (regionsDropdown.current) regionsDropdown.current.open = false;
      }
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', keyboard);
    media.addEventListener('change', resize);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', keyboard);
      media.removeEventListener('change', resize);
    };
  }, [mobileOpen]);
  const current = (href: string) => (pathname === href ? 'page' : undefined);
  return (
    <header ref={header} className="sticky top-0 z-40 h-[88px] border-b border-[rgb(232_236_233_/_70%)] bg-[rgb(255_255_255_/_92%)] backdrop-blur-[18px]">
      <div className="mx-auto flex h-full max-w-[1256px] items-center justify-between gap-8 px-10 max-[1100px]:px-8 max-[700px]:gap-[10px]">
        <Brand />
        <nav className="ml-auto mr-[30px] flex items-center gap-[34px] max-[1100px]:mr-[10px] max-[900px]:gap-[27px] max-[700px]:hidden" aria-label="主選單">
          <Link href="/" aria-current={current('/')} className={`${navLinkClass} ${pathname === '/' ? 'text-green-dark after:scale-100' : ''}`} onClick={closeMenus}>
            首頁
          </Link>
          <details className="group relative" ref={dropdown}>
            <summary className={`flex cursor-pointer list-none items-center gap-2 py-[29px] text-[13px] text-[#58616d] transition-colors [&::-webkit-details-marker]:hidden hover:text-green-dark group-open:text-green-dark [&>svg]:transition-transform [&>svg]:duration-200 group-open:[&>svg]:rotate-180 ${pathname.startsWith('/solutions/') ? 'text-green-dark' : ''}`}>
              適合你的起點？
              <ChevronDown size={13} />
            </summary>
            <div className="absolute left-1/2 top-[70px] z-[45] w-[344px] -translate-x-1/2 rounded-xl border border-[#e0e8db] bg-white p-[18px] shadow-[0_18px_55px_#1935231c]">
              <p className="px-2 pb-3 text-[13px] text-[#65735b]">
                找到適合你的起點
                <span className="mt-[3px] block font-[Arial,sans-serif] text-[12px] tracking-[1.6px] text-[#9ba68d]">SOLUTIONS FOR YOU</span>
              </p>
              {solutionLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current(item.href)}
                  onClick={closeMenus}
                  className="my-[3px] flex items-center gap-3 rounded-[7px] p-[12px_9px] hover:bg-[#f0f6e9] aria-[current=page]:bg-[#f0f6e9]"
                >
                  <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[8px] bg-[#eff4e9] text-[#73905b]">
                    <item.icon size={20} strokeWidth={1.5} />
                  </span>
                  <span>
                    <strong className="block text-[12px] font-medium text-navy">{item.label}</strong>
                    <small className="mt-[2px] block text-[12px] text-[#7e8a72]">{item.note}</small>
                  </span>
                  <ArrowUpRight size={15} className="ml-auto text-[#829775]" />
                </Link>
              ))}
              <div className="mt-[9px] border-t border-[#eaf0e2] px-2 pt-3 text-[12px] text-[#86977a]">
                不同規模，同樣從你的問題出發。
              </div>
            </div>
          </details>
          <ServicesMegaMenu pathname={pathname} close={closeMenus} />
          <Link href="/cases" aria-current={current('/cases')} className={`${navLinkClass} ${pathname.startsWith('/cases') ? 'text-green-dark after:scale-100' : ''}`} onClick={closeMenus}>
            真實案例
          </Link>
          {regions && regions.length > 0 && (
            <details className="group relative" ref={regionsDropdown}>
              <summary className={`flex cursor-pointer list-none items-center gap-2 py-[29px] text-[13px] text-[#58616d] transition-colors [&::-webkit-details-marker]:hidden hover:text-green-dark group-open:text-green-dark [&>svg]:transition-transform [&>svg]:duration-200 group-open:[&>svg]:rotate-180 ${pathname.startsWith('/r/') ? 'text-green-dark' : ''}`}>
                區域服務
                <ChevronDown size={13} />
              </summary>
              <div className="absolute left-1/2 top-[70px] z-[45] w-[300px] -translate-x-1/2 rounded-xl border border-[#e0e8db] bg-white p-[18px] shadow-[0_18px_55px_#1935231c]">
                <p className="px-2 pb-3 text-[13px] text-[#65735b]">
                  區域專屬服務頁
                  <span className="mt-[3px] block font-[Arial,sans-serif] text-[12px] tracking-[1.6px] text-[#9ba68d]">REGION SERVICES</span>
                </p>
                {regions.map((region) => (
                  <Link
                    key={region.id}
                    href={`/r/${region.slug}`}
                    aria-current={pathname === `/r/${region.slug}` ? 'page' : undefined}
                    onClick={closeMenus}
                    className="my-[3px] flex items-center gap-3 rounded-[7px] p-[12px_9px] hover:bg-[#f0f6e9] aria-[current=page]:bg-[#f0f6e9]"
                  >
                    <span>
                      <strong className="block text-[12px] font-medium text-navy">{region.name}</strong>
                      <small className="mt-[2px] block text-[12px] text-[#7e8a72]">公司介紹・真實案例・對應方案</small>
                    </span>
                    <ArrowUpRight size={15} className="ml-auto text-[#829775]" />
                  </Link>
                ))}
              </div>
            </details>
          )}
        </nav>
        <div className="flex items-center gap-[10px] max-[700px]:gap-[5px]">
          <ConsultButton className="bg-navy p-4 text-[12px] font-medium text-[#334033] shadow-none hover:text-white max-[700px]:min-h-[36px] max-[700px]:gap-[6px] max-[700px]:px-[10px] max-[700px]:py-[9px] max-[700px]:text-[12px] max-[370px]:gap-1 max-[370px]:px-2 max-[370px]:text-[13px]" />
          <button
            ref={mobileButton}
            disabled={!ready}
            className="hidden h-[33px] w-[33px] items-center justify-center rounded-full bg-transparent hover:bg-[#edf4ed] max-[700px]:flex"
            aria-label={mobileOpen ? '關閉選單' : '開啟選單'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-[21px] w-[21px]" /> : <Menu className="h-[21px] w-[21px]" />}
          </button>
        </div>
      </div>

      {/* 手機版導覽面板 - 滑入版本 */}
      <nav
        id="mobile-menu"
        aria-label="流動版選單"
        inert={!mobileOpen}
        className={`absolute left-0 right-0 top-[88px] z-30 max-h-[calc(100dvh-88px)] overflow-y-auto border-b border-[#e1e8dc] bg-[#fffffffa] p-[13px_23px_22px] shadow-[0_17px_23px_#142d1b0b] backdrop-blur-[18px] transition-all duration-250 ease-out ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        <Link href="/" aria-current={current('/')} onClick={closeMenus} className="flex min-h-[45px] items-center justify-between border-b border-[#eef1e9] p-[10px_8px] text-[13px] aria-[current=page]:bg-[#f3f8ec] aria-[current=page]:text-green-dark">
          首頁
          <ArrowUpRight size={15} />
        </Link>
        <p className="mt-[14px] p-[7px_8px] text-[12px] text-[#6c8659]">
          適合你的起點？ <span className="ml-[10px] font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#98a889]">SOLUTIONS</span>
        </p>
        {solutionLinks.map((item) => (
          <Link key={item.href} href={item.href} aria-current={current(item.href)} onClick={closeMenus} className="flex min-h-[45px] items-center justify-between border-b border-[#eef1e9] p-[10px_8px] text-[13px] aria-[current=page]:bg-[#f3f8ec] aria-[current=page]:text-green-dark">
            <span className="flex items-center gap-[10px]">
              <item.icon size={16} />
              {item.label}
            </span>
            <ArrowUpRight size={15} />
          </Link>
        ))}
        <p className="mt-[14px] p-[7px_8px] text-[12px] text-[#6c8659]">
          服務 <span className="ml-[10px] font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#98a889]">SERVICES</span>
        </p>
        <Link href="/services" aria-current={current('/services')} onClick={closeMenus} className="flex min-h-[45px] items-center justify-between border-b border-[#eef1e9] p-[10px_8px] text-[13px] aria-[current=page]:bg-[#f3f8ec] aria-[current=page]:text-green-dark">
          服務介紹
          <ArrowUpRight size={15} />
        </Link>
        <Link href="/choose-service" aria-current={current('/choose-service')} onClick={closeMenus} className="flex min-h-[45px] items-center justify-between border-b border-[#eef1e9] p-[10px_8px] text-[13px] aria-[current=page]:bg-[#f3f8ec] aria-[current=page]:text-green-dark">
          選擇我們的服務
          <ArrowUpRight size={15} />
        </Link>
        <p className="mt-[14px] p-[7px_8px] text-[12px] text-[#6c8659]">
          內容 <span className="ml-[10px] font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#98a889]">CONTENT</span>
        </p>
        <Link href="/cases" aria-current={current('/cases')} onClick={closeMenus} className="flex min-h-[45px] items-center justify-between border-b border-[#eef1e9] p-[10px_8px] text-[13px] aria-[current=page]:bg-[#f3f8ec] aria-[current=page]:text-green-dark">
          真實案例
          <ArrowUpRight size={15} />
        </Link>
        {regions && regions.length > 0 && (
          <>
            <p className="mt-[14px] p-[7px_8px] text-[12px] text-[#6c8659]">
              區域服務 <span className="ml-[10px] font-[Arial,sans-serif] text-[12px] tracking-[1px] text-[#98a889]">REGIONS</span>
            </p>
            {regions.map((region) => (
              <Link key={region.id} href={`/r/${region.slug}`} aria-current={current(`/r/${region.slug}`)} onClick={closeMenus} className="flex min-h-[45px] items-center justify-between border-b border-[#eef1e9] p-[10px_8px] text-[13px] aria-[current=page]:bg-[#f3f8ec] aria-[current=page]:text-green-dark">
                {region.name}
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </>
        )}
        {categories.map((category) => (
          <details className="border-b border-[#e7edde]" key={category.slug}>
            <summary className="flex cursor-pointer list-none items-center gap-[11px] p-[13px_4px] text-[15px] text-[#33402a] [&::-webkit-details-marker]:hidden">
              <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[7px] bg-[#eef4e5] text-[#7fa34f]">
                {(() => {
                  const Icon = categoryIcons[category.icon];
                  return <Icon size={15} strokeWidth={1.5} />;
                })()}
              </span>
              {category.title}
              <ChevronDown size={14} className="ml-auto text-[#8da776]" />
            </summary>
            <div className="flex flex-col pb-3 pl-9">
              <Link href={`/services/${category.slug}`} onClick={closeMenus} className="py-2 text-[14px] font-semibold text-[#3f5a2a]">
                查看{category.title}全部
              </Link>
              {category.services.map((service) => (
                <Link key={service.slug} href={`/services/${category.slug}/${service.slug}`} onClick={closeMenus} className="py-2 text-[14px] text-[#5a6b4a]">
                  {service.title}
                </Link>
              ))}
            </div>
          </details>
        ))}
        <div className="p-[18px_0_26px]">
          <ConsultButton className="w-full rounded-[6px] bg-[#eef5e4] p-[10px_13px] text-green-dark shadow-none hover:bg-[#eef5e4]" />
        </div>
      </nav>

      <noscript>
        <nav className="flex justify-center gap-4 bg-[#f3f7ed] p-[8px_20px] text-[13px]" aria-label="無 JavaScript 導覽">
          <Link href="/">首頁</Link>
          <Link href="/solutions/solo">一人公司</Link>
          <Link href="/solutions/sme">中小企業</Link>
          <Link href="/solutions/enterprise">企業團隊</Link>
          <Link href="/services">服務介紹</Link>
          <Link href="/choose-service">選擇我們的服務</Link>
          <Link href="/cases">真實案例</Link>
        </nav>
      </noscript>
    </header>
  );
}
function Footer() {
  // 區域列表 client-side 讀取；冇區域/失敗 → null（欄位隱藏）
  const regions = useRegions();
  return (
    <footer className="border-t border-line pt-[53px] max-[700px]:pt-[37px]">
      <div className="mx-auto max-w-[1256px] px-10 max-[1100px]:px-8">
        <div className="grid grid-cols-[1.55fr_1fr_1fr_0.65fr_0.85fr] gap-[35px] pb-[45px] max-[1100px]:gap-[25px] max-[900px]:grid-cols-[1.4fr_1fr_1fr_0.8fr] max-[900px]:gap-8 max-[700px]:grid-cols-2 max-[700px]:gap-x-5 max-[700px]:gap-y-[28px] max-[700px]:pb-[30px]">
          <div className="max-[700px]:col-span-2">
            <Brand compact />
            <p className="mt-5 text-[12px] text-[#6e7b62] max-[700px]:mt-[15px] max-[700px]:text-[13px]">讓科技，成為你的成長力。</p>
            <span className="mt-2 block text-[12px] text-[#9aa28f] max-[700px]:mt-[5px] max-[700px]:text-[13px]">香港 · 專注企業級數位化解決方案</span>
          </div>
          <div className="flex flex-col items-start gap-3 pt-1 max-[700px]:gap-[10px]">
            <h3 className="mb-2 text-[13px] font-[550] max-[700px]:mb-[5px] max-[700px]:text-[12px]">解決方案</h3>
            {solutionLinks.map((item) => (
              <Link key={item.href} href={item.href} className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-start gap-3 pt-1 max-[700px]:gap-[10px]">
            <h3 className="mb-2 text-[13px] font-[550] max-[700px]:mb-[5px] max-[700px]:text-[12px]">服務與合作</h3>
            <Link href="/services" className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">服務介紹</Link>
            <Link href="/choose-service" className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">選擇我們的服務</Link>
            <Link href="/services#delivery" className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">交付與支援</Link>
            <Link href="/solutions/sme#engagement" className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">合作方式</Link>
          </div>
          <div className="flex flex-col items-start gap-3 pt-1 max-[900px]:hidden max-[700px]:col-span-2 max-[700px]:flex max-[700px]:flex-row max-[700px]:flex-wrap max-[700px]:items-center max-[700px]:gap-[22px] max-[700px]:border-t max-[700px]:border-[#edf0e8] max-[700px]:pt-5 max-[370px]:gap-4">
            <h3 className="mb-2 text-[13px] font-[550] max-[700px]:mb-0 max-[700px]:text-[12px]">認識實瀚</h3>
            <Link href="/#about" className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">關於我們</Link>
            <Link href="/cases" className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">真實案例</Link>
            <Link href="/services#faq" className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">常見問題</Link>
          </div>
          {regions && regions.length > 0 && (
            <div className="flex flex-col items-start gap-3 pt-1 max-[700px]:gap-[10px]">
              <h3 className="mb-2 text-[13px] font-[550] max-[700px]:mb-[5px] max-[700px]:text-[12px]">區域服務</h3>
              {regions.map((region) => (
                <Link key={region.id} href={`/r/${region.slug}`} className="bg-transparent p-0 text-left text-[12px] text-[#8b9482] hover:text-green-dark">
                  {region.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex min-h-[65px] items-center justify-between gap-5 text-[13px] text-[#99a18f] max-[700px]:min-h-[75px] max-[700px]:flex-wrap max-[700px]:gap-[15px] max-[700px]:py-[18px]">
          <span className="font-[Arial,var(--font-sans)] tracking-[0.2px] max-[700px]:basis-full max-[700px]:text-[12px] max-[700px]:tracking-normal">
            © {new Date().getFullYear()} 實瀚科技 Hangs Technology. All rights reserved.
          </span>
          <a href="#main" className="flex items-center gap-[10px] text-[12px] text-[#7f8d70] max-[700px]:ml-auto max-[700px]:text-[13px]">
            回到頂部
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [consultOpen, setConsultOpen] = useState(false);
  const [consultPrefill, setConsultPrefill] = useState<ConsultPrefill>();
  const openConsult = (prefill?: ConsultPrefill) => {
    setConsultPrefill(prefill);
    setConsultOpen(true);
  };
  return (
    <ConsultationContext.Provider value={{ openConsult }}>
      <Header key={pathname} />
      {children}
      <Footer />
      {consultOpen && <Consultation prefill={consultPrefill} onClose={() => setConsultOpen(false)} />}
    </ConsultationContext.Provider>
  );
}
