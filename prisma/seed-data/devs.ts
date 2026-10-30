// 種子開發清單（源自 Hangs_v2/src/lib/mockData.ts 的 devs）

export type SeedDev = {
  name: string;
  client: string;
  status: string;
  delivery: string;
  warranty: string;
  link: string;
  meetings: { date: string; text: string; parts: string[]; people: string[] }[];
  parts: {
    name: string;
    owner: string;
    deadline: string;
    checklist: { label: string; done: boolean }[];
    comments: { who: string; when: string; text: string }[];
  }[];
};

export const seedDevs: SeedDev[] = [
  {
    name: '旅行社項目管理系統',
    client: 'Lovely Tour',
    status: 'Debug',
    delivery: '2026-10-25',
    warranty: '2027-10-25',
    link: 'https://github.com/hangs/lovely-tour',
    meetings: [
      {
        date: '2026-10-12',
        text: '確認 UI 版型，客人要求加搜尋欄',
        parts: ['前端 UI'],
        people: ['Aaron', 'Vincent'],
      },
    ],
    parts: [
      {
        name: '前端 UI',
        owner: 'Aaron',
        deadline: '2026-10-18',
        checklist: [
          { label: '登入頁', done: true },
          { label: '響應式手機版', done: false },
        ],
        comments: [{ who: 'Aaron', when: '10-11', text: 'UI 俾客人試緊' }],
      },
      {
        name: '後端 API',
        owner: 'Ken',
        deadline: '2026-10-22',
        checklist: [
          { label: 'JWT 登入', done: true },
          { label: '報價 CRUD', done: true },
          { label: 'Receipt 轉開發中', done: false },
        ],
        comments: [{ who: 'Ken', when: '10-11', text: 'DB schema 定咗' }],
      },
    ],
  },
  {
    name: '企業官網 + SEO',
    client: 'Nexus',
    status: '客人試緊',
    delivery: '2026-10-30',
    warranty: '2027-10-30',
    link: 'https://staging.nexus.com',
    meetings: [],
    parts: [
      {
        name: '官網頁面',
        owner: 'May',
        deadline: '2026-10-20',
        checklist: [
          { label: '首頁', done: true },
          { label: '服務頁', done: true },
          { label: '聯絡頁', done: true },
        ],
        comments: [],
      },
    ],
  },
];
