export const company = {
  name: '實瀚科技',
  englishName: 'HANGS TECHNOLOGY',
  description: '實瀚科技為香港一人公司、中小企及企業提供 AI 應用、流程自動化、雲端與 DevOps、資訊安全及客製系統開發，讓科技真正解決業務問題。',
};

function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

export const siteUrl = getSiteUrl();

export const services = [
  { id: 'ai', number: '01', icon: 'sparkles', title: 'AI 技術解決方案', english: 'AI SOLUTIONS', description: '把 AI 能力，變成你的業務優勢。', detail: '從大型語言模型、RAG 檢索增強生成到 AI Agent，按業務需要設計能與既有系統整合的 AI 方案。先驗證可行性，再逐步擴展。', features: ['企業知識庫與 RAG 檢索', 'AI Agent 與模型 API 整合', '模型選型、評估與部署'], fit: '希望建立專屬 AI 能力，而非只使用通用聊天工具的企業。' },
  { id: 'business-ai', number: '02', icon: 'brain', title: '企業職能 AI 應用', english: 'AI FOR WORK', description: '為每個職能，配備得力 AI 助手。', detail: '將 AI 融入客服、銷售、行政與文件處理。讓一人公司也能有自己的數位工作團隊，讓企業員工專注在更需要判斷力的工作。', features: ['AI 客服與企業知識助手', '銷售內容與文件草稿生成', '行政文件分類及資料提取'], fit: '一人公司、小型團隊，以及有大量重複資訊處理工作的部門。' },
  { id: 'automation', number: '03', icon: 'workflow', title: '流程與系統自動化', english: 'WORKFLOW AUTOMATION', description: '讓系統協作，讓時間回到你手上。', detail: '梳理現有工作流程，透過 API、RPA 與工作流引擎連接不同工具。減少重複輸入、跨系統搬運資料及人手追蹤。', features: ['跨系統 API 與數據串接', 'RPA 與審批工作流', '自動通知、報表與異常監控'], fit: '經常在試算表、CRM、電郵及不同後台之間重複操作的團隊。' },
  { id: 'cloud', number: '04', icon: 'cloud', title: '雲端架構與 DevOps', english: 'CLOUD & DEVOPS', description: '為業務成長，打好穩健的基礎。', detail: '由上雲規劃、基礎架構到持續交付與日常維運，建立可觀測、可擴展的技術環境，並按需要安排技術支援。', features: ['雲端遷移與基礎設施規劃', '容器部署、CI/CD 與自動化', '系統監控、備份與技術維運'], fit: '需要上雲、改善部署效率或缺乏專職維運團隊的企業。' },
  { id: 'platform', number: '05', icon: 'shield', title: '資安與數位平台', english: 'SECURITY & PLATFORMS', description: '從安全到體驗，打造長遠價值。', detail: '以業務流程為核心，開發官網、電商、CRM、ERP 及 IoT 數據平台，配合授權範圍內的資安測試與防禦建議。', features: ['官網、電商、CRM 及 ERP 開發', '資安檢測、權限設計與防禦', 'IoT 串接與大數據平台'], fit: '標準化工具已無法滿足流程、整合或安全要求的企業。' },
] as const;

export const faqs = [
  { question: '一人公司也適合導入 AI 嗎？', answer: '適合。建議先從一個高頻、重複而且容易衡量的工作開始，例如整理查詢、搜尋文件或產生內容草稿。實瀚科技會先了解你的流程和工具，再評估導入方式；不必一開始便建置大型系統。' },
  { question: 'AI 應用與一般 ChatGPT 有甚麼分別？', answer: '一般聊天工具主要處理使用者輸入的問題；企業 AI 應用則可按授權連接你的知識庫、工作流程及業務系統，並設計角色權限、審批和紀錄。是否需要客製化，取決於你的資料、安全要求及使用場景。' },
  { question: '公司的資料會被用來訓練公開模型嗎？', answer: '資料的處理方式取決於最終選用的模型供應商、服務條款及部署配置。我們會在方案階段釐清資料流向、保存期限和使用權限，並按需要評估不作訓練的企業 API、私有雲或內部部署；相關安排會在合約中確認。' },
  { question: '可以與現有網站、CRM 或 ERP 整合嗎？', answer: '可以評估整合。通常優先透過官方 API、Webhook 或資料交換機制連接；若現有系統沒有可用介面，則需要評估 RPA 或其他方式的可行性、維護成本及限制。' },
  { question: '開發費用和時間如何計算？', answer: '費用及時間會按功能範圍、資料品質、系統整合難度、部署方式及維運需要評估。我們先釐清需求，再提供分階段方案及報價；在確認範圍之前，不會以單一價錢或固定天數作不切實際的承諾。' },
  { question: '系統完成後，源碼、帳號和維運如何安排？', answer: '源碼交付、知識產權、第三方授權、雲端帳號及文件的範圍會在合約中列明。我們重視清晰交接，亦可按項目需要安排技術培訓、持續維護或駐場支援，具體服務時段與回應標準另行約定。' },
] as const;
