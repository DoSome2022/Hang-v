import { expect, test } from '@playwright/test';

// 最新資訊公開頁（/news，DB 驅動，種子資料 2 published + 1 draft）

test('最新資訊列表只顯示已發佈內容', async ({ page }) => {
  await page.goto('/news');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText('AI 最新趨勢', { exact: false })).toBeVisible();
  await expect(page.getByText('WhatsApp 自動化開單實戰', { exact: false })).toBeVisible();
  // draft 唔應該出現
  await expect(page.getByText('中小企數碼轉型 2026 觀察', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '閱讀全文' })).toHaveCount(2);
});

test('最新資訊詳情頁顯示內容', async ({ page }) => {
  await page.goto('/news/ai-local-vs-cloud');
  await expect(page.locator('h1')).toContainText('AI 最新趨勢');
  await expect(page.getByText('本地模型優勢', { exact: false })).toBeVisible();
  // 返回列表連結
  await page.getByRole('link', { name: '返回最新資訊' }).click();
  await expect(page).toHaveURL(/\/news$/);
});

test('不存在的資訊回 404', async ({ request }) => {
  const response = await request.get('/news/this-does-not-exist');
  expect(response.status()).toBe(404);
});

test('header 導覽有最新資訊連結', async ({ page }) => {
  await page.goto('/');
  await page.locator('header nav').getByRole('link', { name: '最新資訊' }).first().click();
  await expect(page).toHaveURL(/\/news$/);
});

test('sitemap 包含最新資訊頁', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('/news/ai-local-vs-cloud');
});
