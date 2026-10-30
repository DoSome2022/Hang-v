// lib/ui.ts — 共用 Tailwind class 常數（取代原 globals.css 的原子 class）

export const containerClass =
  'mx-auto max-w-[1256px] px-10 min-[1500px]:max-w-[1320px] max-[1100px]:px-8';

export const sectionClass =
  'py-[104px] min-[1500px]:py-[112px] max-[1100px]:py-20';

export const buttonClass =
  'inline-flex items-center justify-center gap-[23px] min-h-[49px] rounded-[7px] border border-transparent px-[22px] py-[13px] text-[13px] font-medium leading-[1.5] transition-[background,transform,box-shadow] duration-200 [&>svg]:transition-transform [&>svg]:duration-200 hover:[&>svg]:translate-x-0.5 hover:[&>svg]:-translate-y-px';

export const buttonPrimaryClass =
  'bg-green text-white shadow-[0_4px_10px_rgb(0_156_111_/_8%)] hover:bg-green-dark hover:shadow-[0_6px_18px_rgb(0_156_111_/_15%)] hover:-translate-y-0.5';

export const buttonSecondaryClass =
  'bg-white border-[#dfe5e1] hover:bg-[#f6f9f6] hover:border-[#bccfc0]';

export const buttonNavyClass =
  'bg-navy text-white hover:bg-[#273861] hover:-translate-y-0.5';

export const textLinkClass =
  'inline-flex items-center gap-[14px] bg-transparent p-0 text-[12px] font-medium leading-[1.8] hover:text-green-dark [&>svg]:transition-transform [&>svg]:duration-200 hover:[&>svg]:translate-x-[3px] hover:[&>svg]:-translate-y-px';

export const sectionLabelClass =
  'mb-[18px] flex items-center gap-[9px] font-[Arial,sans-serif] text-[12px] font-medium tracking-[2px] text-[#69756f]';

export const sectionLabelDotClass = 'block h-[6px] w-[6px] rounded-[1px] bg-green';

export const miniLabelClass =
  'font-[Arial,sans-serif] text-[12px] font-medium tracking-[1.4px] text-muted';

export const onlineDotClass =
  'inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-green shadow-[0_0_0_3px_rgb(0_156_111_/_8%)]';

export const iconButtonClass =
  'flex h-[38px] w-[38px] items-center justify-center rounded-full bg-transparent hover:bg-[#edf4ed]';
