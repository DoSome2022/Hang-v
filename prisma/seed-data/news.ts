// 種子最新資訊（源自 Hangs_v2/src/lib/mockData.ts 的 news）

export const seedNews = [
  {
    title: 'AI 最新趨勢：本地模型 vs 雲端',
    date: '2026-10-11',
    category: '科技',
    status: 'published' as const,
    tags: ['科技／IT', '資料唔知真假', '中小企'],
    summary: '本地部署 AI 成本低、私隱高、可離線，逐步成為中小企首選…',
  },
  {
    title: '中小企數碼轉型 2026 觀察',
    date: '2026-10-09',
    category: '時事',
    status: 'draft' as const,
    tags: ['科技／IT', '人手重複', '中小企'],
    summary: '人手流程仍然係中小企最大痛點，自動化需求持續上升…',
  },
  {
    title: 'WhatsApp 自動化開單實戰',
    date: '2026-10-01',
    category: '自動化',
    status: 'published' as const,
    tags: ['科技／IT', '人手重複', '一人公司'],
    summary: '一句指令開報價、發票、收據，同步上網站…',
  },
];
