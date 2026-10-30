'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, MessageSquareText, Sparkles, X } from 'lucide-react';
import { PageSchema } from './page-blocks';
import { categories } from '@/lib/service-catalog';
import { categoryIcons } from './catalog-icons';
import { containerClass, buttonClass, buttonSecondaryClass, buttonNavyClass, onlineDotClass } from '@/lib/ui';

const cardClass =
  'flex flex-col rounded-[12px] border border-[#e1e9d8] bg-white p-[31px] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#c6d8b6] hover:shadow-[0_15px_28px_-20px_#3c582824] max-[1100px]:p-[26px] max-[900px]:p-[22px] max-[700px]:p-[25px]';

const chooseCardClass = 'appearance-none w-full cursor-pointer text-left';

export default function ChooseService() {
  const [selected, setSelected] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allServices = useMemo(
    () => categories.flatMap((category) => category.services.map((service) => ({ ...service, categoryTitle: category.title, categorySlug: category.slug }))),
    [],
  );

  const toggle = (slug: string) => {
    setSelected((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  const selectedServices = allServices.filter((service) => selected.includes(service.slug));

  return (
    <>
      <PageSchema
        title="選擇我們的服務｜實瀚科技"
        description="用勾選的方式選出你需要的服務，快速整理出初步方向，再與我們討論。"
        path="/choose-service"
        faqs={[]}
      />

      <main id="main">
        <section className="border-b border-[#e7edde] bg-[radial-gradient(ellipse_at_80%_40%,#f1f7ea_0,transparent_55%),#fff]">
          <div className={`${containerClass} pt-[30px] pb-[60px] max-[900px]:pt-[26px] max-[900px]:pb-[46px]`}>
            <nav className="mb-[30px] flex items-center gap-[11px] pt-[28px] text-[12px] text-[#8c9686]" aria-label="麵包屑導覽">
              <Link href="/" className="hover:text-green-dark">首頁</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <Link href="/services" className="hover:text-green-dark">服務介紹</Link>
              <span aria-hidden="true" className="font-[Arial,sans-serif] text-[#c1cbb8]">/</span>
              <span aria-current="page" className="text-[#55694b]">選擇我們的服務</span>
            </nav>
            <p className="mb-[26px] inline-flex items-center gap-[9px] rounded-[5px] border border-[#e3eadf] bg-[#f8fbf4] p-[6px_10px_6px_9px] text-[13px] text-[#54624b]">
              <span className={onlineDotClass} />
              勾選你需要的服務，我們一起把方向理清楚。
            </p>
            <h1 className="mt-[26px] text-[clamp(42px,4.6vw,58px)] font-bold leading-[1.28] tracking-[-1.7px] max-[900px]:text-[clamp(38px,5.5vw,50px)] max-[700px]:text-[clamp(34px,9vw,46px)]">
              選擇我們的服務，
              <br />
              從你的需要出發。
            </h1>
            <p className="mt-6 max-w-[560px] text-[14px] leading-[2.05] text-[#738266] max-[700px]:text-[13px]">
              服務不是愈多愈好，而是剛好夠用。以下列出各分類的主要服務，點選你感興趣的項目，右側會即時整理出你的初步選擇。
            </p>
          </div>
        </section>

        <section className="py-[104px]">
          <div className={`${containerClass} grid grid-cols-[1.02fr_1fr] items-start gap-[26px] max-[1100px]:grid-cols-1`}>
            <div className="flex flex-col gap-4">
              {categories.map((category) => {
                const Icon = categoryIcons[category.icon];
                const isActive = activeCategory === category.slug;
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setActiveCategory(isActive ? null : category.slug)}
                    className={`${cardClass} ${chooseCardClass} ${isActive ? '!border-[#a9ce47] shadow-[0_14px_34px_-20px_rgba(139,176,65,.5)]' : ''}`}
                    aria-expanded={isActive}
                  >
                    <span className="mb-[22px] font-[Arial,sans-serif] text-[11px] tracking-[1.5px] text-[#a2b28f]">{category.english}</span>
                    <div>
                      <span className="flex h-[47px] w-[47px] items-center justify-center rounded-[10px] bg-[#f1f6ed] text-[#638443]">
                        <Icon size={25} strokeWidth={1.4} />
                      </span>
                      <h3 className="mt-[14px] text-[24px] font-[550] leading-[1.55] tracking-[-0.6px] max-[1100px]:text-[21px] max-[900px]:text-[19px] max-[700px]:text-[22px]">{category.title}</h3>
                      <p className="mt-[12px] text-[13px] leading-[2] text-[#7f8d72] max-[1100px]:text-[12px] max-[900px]:text-[11px] max-[700px]:text-[13px]">{category.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-[14px] border-t border-[#e9efe2] pt-[21px]">
                      <span className="text-[12px] text-[#71875f]">共 {category.services.length} 項服務</span>
                      <span className="inline-flex items-center gap-2 text-[12px] text-[#7fa34f]">
                        展開服務清單
                        <ChevronDown size={15} className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                      </span>
                    </div>

                    {isActive && (
                      <ul className="mt-4 flex list-none flex-col gap-2 border-t border-[#e9efe2] p-0 pt-4">
                        {category.services.map((service) => {
                          const checked = selected.includes(service.slug);
                          return (
                            <li key={service.slug}>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggle(service.slug);
                                }}
                                className="flex w-full items-center gap-3 rounded-[10px] border border-[#e7edde] p-[11px_12px] text-left transition hover:border-[#cfe0bc] hover:bg-[#fbfdf9]"
                              >
                                <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-[#c6d8b6] text-transparent transition ${checked ? 'border-green bg-green text-white' : ''}`}>
                                  <Check size={14} />
                                </span>
                                <span className="flex flex-1 flex-col gap-[3px]">
                                  <strong className="text-[14px] font-[550] text-[#3a4630]">{service.title}</strong>
                                  <small className="font-[Arial,sans-serif] text-[9px] tracking-[.6px] text-[#a0b08e]">{service.english}</small>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>

            <aside className="sticky top-[96px] min-h-[320px] rounded-[14px] border border-[#e1e9d8] bg-white p-[26px] shadow-[0_20px_45px_-30px_rgba(60,88,41,.25)] max-[1100px]:static max-[1100px]:min-h-0">
              <div className="mb-[18px] flex items-start justify-between gap-[14px] max-[700px]:flex-col">
                <div>
                  <span className="font-[Arial,sans-serif] text-[9px] tracking-[1.5px] text-[#96a785]">YOUR SELECTION</span>
                  <h2 className="mt-2 text-[22px] tracking-[-0.4px] max-[700px]:text-[20px]">已選服務</h2>
                </div>
                {selected.length > 0 && (
                  <button type="button" onClick={() => setSelected([])} className="border-0 bg-none p-0 text-[13px] font-medium text-green hover:text-[#007a58]">
                    清除全部
                  </button>
                )}
              </div>

              {selected.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
                  <span className="mb-[18px] flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2f7ec] text-[#7fa34f]">
                    <Sparkles size={28} strokeWidth={1.4} />
                  </span>
                  <h2 className="text-[19px] tracking-[-0.3px]">尚未選擇任何服務</h2>
                  <p className="mt-[10px] max-w-[290px] text-[13px] leading-[2] text-[#8b9a7c]">
                    在左邊展開分類並點選服務，這裡會即時整理你的初步選擇，方便我們接著討論。
                  </p>
                </div>
              ) : (
                <>
                  <ul className="flex list-none flex-col gap-[10px] p-0">
                    {selectedServices.map((service) => (
                      <li key={service.slug} className="flex items-center gap-3 rounded-[10px] border border-[#e7edde] p-[13px_14px]">
                        <span className="flex flex-1 flex-col gap-[3px]">
                          <strong className="text-[14px] font-[550] text-[#3a4630]">{service.title}</strong>
                          <small className="font-[Arial,sans-serif] text-[9px] tracking-[.6px] text-[#a0b08e]">{service.categoryTitle}</small>
                        </span>
                        <button type="button" onClick={() => toggle(service.slug)} aria-label={`移除 ${service.title}`} className="rounded-[6px] p-1 text-[#8da776] hover:bg-[#f2f7ec] hover:text-green-dark">
                          <X size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-[18px] flex items-start gap-2 text-[12px] leading-[1.8] text-[#8b9a7c]">
                    <MessageSquareText size={14} className="mt-[3px] shrink-0 text-[#8db16c]" />
                    選項只是起點。真正需要哪些服務，我們會在免費諮詢中一起確認。
                  </p>
                </>
              )}

              <div className="mt-[30px] flex flex-wrap items-center gap-[18px] rounded-[14px] border border-[#dfe8d3] bg-[#fbfdf9] p-5 max-[700px]:flex-col max-[700px]:items-stretch">
                <span className="flex min-w-[180px] items-center gap-[10px] text-[14px] text-[#4a5a3c]">
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-green font-semibold text-white">{selected.length}</span>
                  項已選
                  <em className="not-italic text-[12px] text-[#a0b08e]">可繼續調整</em>
                </span>
                <div className="flex flex-1 flex-wrap gap-2">
                  {selectedServices.slice(0, 4).map((service) => (
                    <span key={service.slug} className="inline-flex cursor-pointer items-center gap-[6px] rounded-full border border-[#d3e2c3] bg-white px-3 py-[6px] text-[12px] text-[#4d6138] hover:border-[#a9ce47]" onClick={() => toggle(service.slug)}>
                      {service.title}
                      <X size={12} className="text-[#8da776]" />
                    </span>
                  ))}
                  {selected.length > 4 && <span className="rounded-full border border-[#d3e2c3] bg-white px-3 py-[6px] text-[12px] text-[#4d6138]">+{selected.length - 4}</span>}
                </div>
                <div className="flex items-center gap-[10px] max-[700px]:flex-wrap">
                  <button type="button" onClick={() => setSelected([])} className={`${buttonClass} ${buttonSecondaryClass} bg-white !border-[#dbe6cb] !text-[#5f7650] hover:!border-[#b7cf9d] hover:!text-[#3f5a2a]`}>
                    清除
                  </button>
                  <Link href="/#contact" className={`${buttonClass} ${buttonNavyClass} gap-[15px] text-[12px]`}>
                    下一步，預約諮詢
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
