import { expect, test } from '@playwright/test';

const internalRoutes = ['/', '/solutions/solo', '/solutions/sme', '/solutions/enterprise', '/services'];

test('五個頁面皆有單一 H1 且可存取', async ({ request }) => {
  for (const route of internalRoutes) {
    const response = await request.get(route);
    expect(response.ok(), `${route} -> ${response.status()}`).toBeTruthy();
  }
});

for (const route of internalRoutes) {
  test(`${route} 語意、標題與 H1`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.title()).toContain('實瀚科技');
    expect(errors).toEqual([]);
  });
}

test('首頁語意、SEO 與結構化資料', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#services article')).toHaveCount(5);
  await expect(page.locator('#faq details')).toHaveCount(6);
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(schema['@graph'].filter((item: { '@type': string }) => item['@type'] === 'Service')).toHaveLength(5);
  const faqSchema = schema['@graph'].find((item: { '@type': string }) => item['@type'] === 'FAQPage');
  expect(faqSchema.mainEntity).toHaveLength(6);
  for (const faq of faqSchema.mainEntity) {
    await expect(page.locator('#faq')).toContainText(faq.name);
    await expect(page.locator('#faq')).toContainText(faq.acceptedAnswer.text);
  }
});

test('三個解決方案頁各有獨立結構化資料與 FAQ', async ({ page }) => {
  for (const route of ['/solutions/solo', '/solutions/sme', '/solutions/enterprise']) {
    await page.goto(route);
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    const graph = schema['@graph'];
    const faq = graph.find((item: { '@type': string }) => item['@type'] === 'FAQPage');
    const breadcrumb = graph.find((item: { '@type': string }) => item['@type'] === 'BreadcrumbList');
    expect(faq.mainEntity.length).toBeGreaterThan(0);
    expect(breadcrumb.itemListElement.map((item: { name: string }) => item.name)).toContain('首頁');
    expect(await page.locator('#faq details').count()).toBe(faq.mainEntity.length);
  }
});

test('服務介紹頁結構化資料與內容', async ({ page }) => {
  await page.goto('/services');
  await expect(page.getByRole('link', { name: '查看此分類' })).toHaveCount(6);
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  const graph = schema['@graph'];
  expect(graph.find((item: { '@type': string }) => item['@type'] === 'Service').name).toContain('服務介紹');
  expect(graph.find((item: { '@type': string }) => item['@type'] === 'FAQPage').mainEntity.length).toBe(2);
  await expect(page.locator('#faq details')).toHaveCount(2);
});

for (const width of [320, 375, 430, 768, 1024, 1440]) {
  for (const route of ['/', '/solutions/sme', '/services']) {
    test(`響應式 ${route} @ ${width}px 無橫向溢出`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
      if (width === 1440) await page.screenshot({ path: `test-results/${route.replaceAll('/', '-').replace(/^-/, '') || 'home'}-${width}.png`, fullPage: true });
    });
  }
}

test('桌面解決方案下拉選單與頁面轉跳', async ({ page }) => {
  await page.goto('/');
  const dropdown = page.locator('header details').first();
  await dropdown.locator('summary').click();
  await expect(dropdown).toHaveAttribute('open', '');
  await expect(dropdown.getByText('找到適合你的起點')).toBeVisible();
  await dropdown.getByRole('link', { name: /中小企業/ }).click();
  await expect(page).toHaveURL(/\/solutions\/sme$/);
  await expect(page.locator('h1')).toContainText('讓 AI 真正落地');
  // 轉跳後重新展開，目前頁面的連結應標示 aria-current
  const reopened = page.locator('header details').first();
  await reopened.locator('summary').click();
  await expect(reopened.getByRole('link', { name: /中小企業/ })).toHaveAttribute('aria-current', 'page');
});

test('手機選單導覽到解決方案頁', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: '開啟選單' }).click();
  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: /中小企業/ }).click();
  await expect(page).toHaveURL(/\/solutions\/sme$/);
  // 選單以 CSS 滑出動畫收合：關閉後應為 inert（不可互動、對輔助科技隱藏）
  await expect(menu).toHaveAttribute('inert', '');
  await expect(page.getByRole('button', { name: '開啟選單' })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('h1')).toContainText('讓 AI 真正落地');
});

test('預約免費諮詢按鈕在五頁皆可開啟', async ({ page }) => {
  for (const route of internalRoutes) {
    await page.goto(route);
    await page.getByRole('button', { name: '預約免費諮詢' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
});

test('諮詢會送出，成功或服務不可用時摘要均保留', async ({ page }) => {
  const submissions: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') submissions.push(request.url()); });
  await page.goto('/solutions/sme');
  await page.getByRole('button', { name: '預約免費諮詢' }).first().click();
  await page.getByLabel('你的稱呼').fill('測試使用者');
  await page.getByLabel('公司／團隊名稱').fill('示範公司');
  await page.getByLabel('聯絡電郵').fill('test@example.com');
  await page.getByLabel('目前最想解決甚麼問題？').fill('希望自動整理客戶查詢及建立知識庫。');

  const responsePromise = page.waitForResponse(response =>
    response.url().endsWith('/api/consult') &&
    response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: '送出諮詢需求' }).click();
  const response = await responsePromise;
  const status = response.status();

  // 有 Redis → 200；Redis 不可用 → 503；限流 → 429。三種情況摘要都必須保留。
  expect([200, 429, 503]).toContain(status);
  expect(submissions.filter(url => url.endsWith('/api/consult'))).toHaveLength(1);

  const summary = page.getByLabel('諮詢需求摘要，可選取複製');
  await expect(summary).toHaveValue(/測試使用者/);
  await expect(summary).toHaveValue(/希望自動整理客戶查詢及建立知識庫/);

  if (status === 200) {
    await expect(page.getByText('已接收，排入處理佇列。')).toBeVisible();
    await expect(summary).not.toHaveValue(/尚未傳送/);
  } else {
    // Next.js route announcer 也是 role=alert，需限定在對話框內
    await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
    await expect(summary).toHaveValue(/尚未傳送/);
  }
});

test('解決方案頁 FAQ 展開收合', async ({ page }) => {
  await page.goto('/solutions/sme');
  const item = page.locator('#faq details').first();
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');
  await expect(item.locator('div p').first()).toBeVisible();
  await item.locator('summary').click();
  await expect(item).not.toHaveAttribute('open', '');
});

test('解決方案頁間相關連結轉跳', async ({ page }) => {
  await page.goto('/solutions/solo');
  await page.getByRole('link', { name: /接通流程，培養團隊能力/ }).click();
  await expect(page).toHaveURL(/\/solutions\/sme$/);
  await expect(page.locator('h1')).toContainText('讓 AI 真正落地');
});

test('沒有 JavaScript 仍可閱讀主要內容', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3107/solutions/sme');
  await expect(page.locator('h1')).toContainText('讓 AI 真正落地');
  await expect(page.locator('#solutions article')).toHaveCount(3);
  await expect(page.locator('nav[aria-label="無 JavaScript 導覽"]')).toBeVisible();
  await page.locator('#faq details summary').first().click();
  await expect(page.locator('#faq details').first()).toHaveAttribute('open', '');
  await context.close();
});

test('SEO 和分享圖路由', async ({ request }) => {
  for (const route of ['/robots.txt', '/sitemap.xml', '/icon.svg', '/opengraph-image']) {
    const response = await request.get(route);
    expect(response.ok(), route).toBeTruthy();
  }
});

test('健康檢查回報 DB/Redis 狀態並可降級', async ({ request }) => {
  // 語義：DB 是必要依賴（down → 503）；Redis 可降級（down → 200 + degraded）
  const response = await request.get('/api/health');
  expect([200, 503]).toContain(response.status());
  const body = await response.json();
  if (response.status() === 503) {
    expect(body.status).toBe('down');
    expect(body.db).toBe('down');
  } else {
    expect(body.db).toBe('up');
    expect(['up', 'down']).toContain(body.redis);
  }
});

const catalogRoutes = [['ai-applications', 'ai-chatbot'], ['workflow-integration', 'rpa-automation'], ['cloud-devops', 'cloud-migration'], ['security', 'security-testing'], ['digital-platforms', 'web-ecommerce'], ['training', 'ai-workshop']];

for (const [category] of catalogRoutes) {
  test(`服務分類頁 ${category} 語意與內容`, async ({ page }) => {
    await page.goto(`/services/${category}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(await page.locator('#service-list a').count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  });
}

for (const [category, service] of catalogRoutes) {
  test(`服務詳情頁 ${category}/${service} 語意與內容`, async ({ page }) => {
    await page.goto(`/services/${category}/${service}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(await page.locator('#capabilities article').count()).toBeGreaterThanOrEqual(3);
    await expect(await page.locator('#faq details').count()).toBeGreaterThanOrEqual(3);
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    expect(schema['@graph'].find((item: { '@type': string }) => item['@type'] === 'BreadcrumbList').itemListElement.length).toBeGreaterThanOrEqual(4);
  });
}

test('服務介紹頁連結到分類頁', async ({ page }) => {
  await page.goto('/services');
  await page.getByRole('link', { name: '查看此分類' }).first().click();
  await expect(page).toHaveURL(/\/services\/ai-applications$/);
});

test('分類頁連結到服務詳情頁', async ({ page }) => {
  await page.goto('/services/ai-applications');
  await page.locator('#service-list a').first().click();
  await expect(page).toHaveURL(/\/services\/ai-applications\/ai-chatbot$/);
});

for (const width of [320, 375]) {
  for (const route of ['/services/ai-applications', '/services/ai-applications/ai-chatbot']) {
    test(`響應式 ${route} @ ${width}px 無橫向溢出`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    });
  }
}

test('服務雙層選單：展開、左右切換與導航', async ({ page }) => {
  await page.goto('/');
  await page.locator('button[aria-controls="services-mega-panel"]').hover();
  const panel = page.locator('#services-mega-panel');
  await expect(panel).toBeVisible();
  const leftButtons = panel.locator('.grid > div:first-child > button');
  await expect(leftButtons).toHaveCount(6);
  await expect(panel.locator('.grid > div:nth-child(2) a strong').first()).toHaveText('AI 智能客服');
  await leftButtons.nth(1).hover();
  await expect(panel.locator('.grid > div:nth-child(2) a strong').first()).toHaveText('RPA 流程自動化');
  await panel.locator('.grid > div:nth-child(2) a').first().click();
  await expect(page).toHaveURL(/\/services\/workflow-integration\/rpa-automation$/);
});

test('選擇服務頁：卡片展開與收合獨立', async ({ page }) => {
  await page.goto('/choose-service');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '尚未選擇任何服務' })).toBeVisible();
  const cards = page.locator('#main button[aria-expanded]');
  await expect(cards).toHaveCount(6);
  await cards.first().click();
  await expect(cards.first()).toHaveAttribute('aria-expanded', 'true');
  await expect(cards.first().locator('ul button')).toHaveCount(4);
  // 點卡片標題區（非內層選項）收合
  await cards.first().locator('h3').click();
  await expect(cards.first()).toHaveAttribute('aria-expanded', 'false');
  await expect(cards.first().locator('ul')).toHaveCount(0);
  // 展開另一張卡片時，前一張保持收合
  await cards.nth(1).locator('h3').click();
  await expect(cards.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(cards.first()).toHaveAttribute('aria-expanded', 'false');
});

test('選擇服務頁：選取、調整與清除', async ({ page }) => {
  await page.goto('/choose-service');
  const cards = page.locator('#main button[aria-expanded]');
  await cards.first().click();
  const options = cards.first().locator('ul button');
  await options.first().click();
  await expect(page.locator('aside span.bg-green')).toHaveText('1');
  await expect(page.locator('aside ul li strong').first()).toHaveText('AI 智能客服');
  await options.nth(1).click();
  await expect(page.locator('aside span.bg-green')).toHaveText('2');
  await page.getByRole('button', { name: '清除全部' }).click();
  await expect(page.locator('aside span.bg-green')).toHaveText('0');
  await expect(page.getByRole('heading', { name: '尚未選擇任何服務' })).toBeVisible();
  await expect(page.getByRole('link', { name: /下一步，預約諮詢/ })).toHaveAttribute('href', '/#contact');
});

for (const width of [320, 375]) {
  test(`響應式 /choose-service @ ${width}px 無橫向溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/choose-service');
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  });
}
