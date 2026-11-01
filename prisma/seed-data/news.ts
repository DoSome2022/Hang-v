// 種子最新資訊（源自 Hangs_v2/src/lib/mockData.ts 的 news）

export const seedNews = [
  {
    slug: 'ai-local-vs-cloud',
    title: 'AI 最新趨勢：本地模型 vs 雲端',
    date: '2026-10-11',
    category: '科技',
    status: 'published' as const,
    tags: ['科技／IT', '資料唔知真假', '中小企'],
    summary: '本地部署 AI 成本低、私隱高、可離線，逐步成為中小企首選…',
    content:
      '中小企部署 AI 助手時，往往喺本地模型同雲端服務之間取捨。\n\n本地模型優勢在於資料唔離開公司、可離線運作、長期成本較低；雲端模型勝在能力更強、維護更少。\n\n實務上唔少企業選擇混合做法：敏感資料用本地模型處理，需要高階推理時先呼叫雲端。部署前應先確認資料敏感度、使用量同維護能力，再決定方案。',
  },
  {
    slug: 'sme-digital-2026',
    title: '中小企數碼轉型 2026 觀察',
    date: '2026-10-09',
    category: '時事',
    status: 'draft' as const,
    tags: ['科技／IT', '人手重複', '中小企'],
    summary: '人手流程仍然係中小企最大痛點，自動化需求持續上升…',
    content:
      '2026 年中小企數碼轉型嘅重點，由「有冇系統」轉向「系統有冇用起嚟」。\n\n人手重複流程仍然係最大痛點：報價、文件、追數、排更。企業開始由單一工具走向流程自動化，並更重視數據質素同交接能力。\n\n轉型唔係一次過完成，而係由一個高頻、可衡量嘅流程開始。',
  },
  {
    slug: 'whatsapp-order-automation',
    title: 'WhatsApp 自動化開單實戰',
    date: '2026-10-01',
    category: '自動化',
    status: 'published' as const,
    tags: ['科技／IT', '人手重複', '一人公司'],
    summary: '一句指令開報價、發票、收據，同步上網站…',
    content:
      '一人公司最花時間嘅往往唔係搵客，而係開單。\n\n以 WhatsApp 做入口：客戶一句訊息，自動整理成報價草稿，確認後生成發票同收據，再同步到網站後台。\n\n重點唔係全部自動，而係敏感內容（價錢、承諾）保留真人確認，自動化只做重複嘅部分。',
  },
];
