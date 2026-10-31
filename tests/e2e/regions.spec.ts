import { expect, test, type Page } from '@playwright/test';

// 公開區域頁（/r/[slug]，DB 驅動，種子資料：示範區域 service-demo）
// 帳密來自環境變數（scripts/test-e2e.sh 從 .env export）

const username = process.env.AUTH_ADMIN_USERNAME ?? 'admin';
const password = process.env.AUTH_ADMIN_PASSWORD ?? 'change-me';

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test('區域公開頁顯示完整內容', async ({ page }) => {
  await page.goto('/r/service-demo');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('示範區域');
  // 公司介紹
  await expect(page.getByText('顧問服務示範')).toBeVisible();
  await expect(page.getByText('呢個係 demo 區域', { exact: false })).toBeVisible();
  // 3 張案例卡 + 3 個申請連結
  await expect(page.getByText('補習社數碼轉型', { exact: false })).toBeVisible();
  await expect(page.getByText('裝修公司項目管理', { exact: false })).toBeVisible();
  await expect(page.getByText('傳統五金店上網', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: '申請' })).toHaveCount(3);
  // 痛點 / 方案 chips
  await expect(page.getByText('排堂計糧亂', { exact: true })).toBeVisible();
  await expect(page.getByText('導師管理（課表／點名）', { exact: true })).toBeVisible();
  // 底部 CTA（header 都有 ConsultButton，用 #contact scope）
  await expect(page.locator('#contact')).toBeVisible();
});

test('區域頁申請連結寫入 localStorage 並導向 /apply', async ({ page }) => {
  await page.goto('/r/service-demo');
  await page.getByRole('link', { name: '申請' }).first().click();
  await expect(page).toHaveURL(/\/apply$/);

  const stored = await page.evaluate(() => localStorage.getItem('consult_apply'));
  expect(stored).not.toBeNull();
  const parsed = JSON.parse(stored!);
  expect(parsed).toMatchObject({ caseId: expect.any(String), title: expect.any(String) });
});

test('header 區域服務選單導向區域頁', async ({ page }) => {
  await page.goto('/');
  // 區域列表係 client-side fetch，hydration 後先出現選單
  const summary = page.locator('header summary', { hasText: '區域服務' });
  await expect(summary).toBeVisible();
  await summary.click();
  const dropdown = summary.locator('xpath=..');
  await expect(dropdown).toHaveAttribute('open', '');
  await dropdown.getByRole('link', { name: /示範區域/ }).click();
  await expect(page).toHaveURL(/\/r\/service-demo$/);
});

test('footer 區域服務欄導向區域頁', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('footer').getByRole('link', { name: /示範區域/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/r\/service-demo$/);
});

test('不存在的區域回 404', async ({ request }) => {
  const response = await request.get('/r/this-region-does-not-exist');
  expect(response.status()).toBe(404);
});

test('區域頁 metadata 與 JSON-LD', async ({ page }) => {
  await page.goto('/r/service-demo');
  await expect(page).toHaveTitle(/示範區域/);
  await expect(page.locator('link[rel="canonical"]').first()).toHaveAttribute(
    'href',
    /\/r\/service-demo$/,
  );

  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const graphScript = scripts.find((s) => s.includes('CollectionPage'));
  expect(graphScript).toBeDefined();
  const schema = JSON.parse(graphScript!);
  expect(schema['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(
    expect.arrayContaining(['CollectionPage', 'BreadcrumbList']),
  );
});

test('admin 區域列表有「查看公開頁」連結', async ({ page }) => {
  await login(page);
  await page.goto('/admin/regions');
  const link = page.getByRole('link', { name: '查看公開頁' }).first();
  await expect(link).toHaveAttribute('href', /\/r\/service-demo$/);
  await expect(link).toHaveAttribute('target', '_blank');
});

test('sitemap 包含區域頁', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('/r/service-demo');
});
