// 種子分類資料：標籤群組/標籤、痛點、方案。

export const seedTagGroups = [
  { key: 'industry', label: '行業', sortOrder: 0 },
  { key: 'pain', label: '痛點', sortOrder: 1 },
  { key: 'audience', label: '對象', sortOrder: 2 },
] as const;

// 三組標籤（name → group key）
export const seedTags: { name: string; group: 'industry' | 'pain' | 'audience' }[] = [
  // 行業 7
  { name: '教育', group: 'industry' },
  { name: '金融／保險', group: 'industry' },
  { name: '零售', group: 'industry' },
  { name: '製造', group: 'industry' },
  { name: '裝修工程', group: 'industry' },
  { name: '服務業', group: 'industry' },
  { name: '科技／IT', group: 'industry' },
  // 痛點 12
  { name: '網站慢', group: 'pain' },
  { name: '文件填表煩', group: 'pain' },
  { name: '報價慢', group: 'pain' },
  { name: '人手重複', group: 'pain' },
  { name: '資料唔知真假', group: 'pain' },
  { name: '排堂計糧亂', group: 'pain' },
  { name: '排班混亂', group: 'pain' },
  { name: '三方溝通唔同步', group: 'pain' },
  { name: '庫存唔同步', group: 'pain' },
  { name: '推廣靠人手', group: 'pain' },
  { name: '帳目未整合', group: 'pain' },
  { name: '開會冇記低重點', group: 'pain' },
  // 案例長文額外 tags（唔喺基本清單，放 pain group）
  { name: '排堂計糧', group: 'pain' },
  { name: '帳目整合', group: 'pain' },
  { name: '項目管理', group: 'pain' },
  { name: '三方溝通', group: 'pain' },
  { name: '電商', group: 'pain' },
  { name: '庫存同步', group: 'pain' },
  // 對象 3
  { name: '一人公司', group: 'audience' },
  { name: '中小企', group: 'audience' },
  { name: '企業團隊', group: 'audience' },
];

// 痛點（title → description）
export const seedPainPoints: { title: string; description: string | null }[] = [
  { title: '人手不足，請人困難', description: null },
  { title: '排堂計糧亂', description: '排堂、調堂、補堂全靠 Excel 與 WhatsApp，導師計糧容易出錯。' },
  { title: '帳目未整合', description: '帳目、收費與訂單散落在不同地方，月尾對數花時間。' },
  { title: '客戶同服務對象分離', description: '付錢的客戶與服務對象是不同的人，資料容易記錯。' },
  { title: '三方溝通唔同步', description: '業主、設計師、項目經理各自一套資訊，進度靠人記。' },
  { title: '設計圖檔散落', description: '設計圖、3D 圖檔散落，版本混亂。' },
  { title: '器材管理混亂', description: '器材借出歸還沒有紀錄，常常重複採購。' },
  { title: '庫存唔同步', description: '網上與門市兩盤數，容易超賣或重複入貨。' },
  { title: '訂單靠人手', description: '訂單與送貨靠人手處理，容易出錯。' },
  { title: '冇會員制度', description: '熟客資料散落，無法做針對性推廣。' },
];

// 方案（title → description）
export const seedSolutions: { title: string; description: string | null }[] = [
  { title: '流程自動化方案', description: null },
  { title: '客戶資料管理系統', description: '集中管理客戶聯絡記錄、報價跟進及合約檔案，方便團隊協作。' },
  { title: '自動報價生成工具', description: '根據服務項目自動計算價格，一鍵導出PDF報價單。' },
  { title: '員工排班及工時系統', description: '排班、工時與假期自動化，減少人手排班錯誤。' },
  { title: 'WhatsApp自動回覆機械人', description: '常見查詢自動回覆，減輕客服人手負擔。' },
  { title: '網站表單接單系統', description: '網站表單自動轉成訂單，串接後續流程。' },
  // 三篇案例所用方案
  { title: '網上報名與支付', description: null },
  { title: '導師管理（課表／點名）', description: null },
  { title: '家長管理（帳戶／訂單）', description: null },
  { title: '學校與學生管理', description: null },
  { title: '行政帳目管理', description: null },
  { title: '會議與項目管理', description: null },
  { title: '項目經理系統', description: null },
  { title: '設計師管理（3D圖）', description: null },
  { title: '客戶管理', description: null },
  { title: '器材管理', description: null },
  { title: '銷售與帳目', description: null },
  { title: '網上商店', description: null },
  { title: '庫存管理', description: null },
  { title: '網上支付', description: null },
  { title: '會員分級', description: null },
  { title: '送貨模組', description: null },
  { title: '報表', description: null },
];
