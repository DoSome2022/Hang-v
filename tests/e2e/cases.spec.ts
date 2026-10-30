import { expect, test } from '@playwright/test';

// 案例公開站（DB 驅動，種子資料：3 篇案例長文）

test('案例列表顯示 3 張種子案例卡', async ({ page }) => {
  await page.goto('/cases');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText('補習社數碼轉型', { exact: false })).toBeVisible();
  await expect(page.getByText('裝修公司項目管理', { exact: false })).toBeVisible();
  await expect(page.getByText('傳統五金店上網', { exact: false })).toBeVisible();
  // 每張卡都有「申請」按鈕
  await expect(page.getByRole('link', { name: '申請' })).toHaveCount(3);
});

test('案例詳情：導言、段落與成效', async ({ page }) => {
  await page.goto('/cases/tutoring-centre-management');
  await expect(page.locator('h1')).toContainText('補習社數碼轉型');
  await expect(page.getByText('補習社的生意不難理解', { exact: false })).toBeVisible();
  await expect(page.getByText('背景：客戶是家長，服務對象是小朋友')).toBeVisible();
  await expect(page.getByText('行政時間慳 60%', { exact: true })).toBeVisible();
  await expect(page.getByText('相關痛點')).toBeVisible();
  await expect(page.getByText('所用方案')).toBeVisible();
  await expect(page.getByText('排堂計糧亂')).toBeVisible();
  await expect(page.getByText('導師管理（課表／點名）')).toBeVisible();
});

test('案例詳情：相關案例連結', async ({ page }) => {
  await page.goto('/cases/tutoring-centre-management');
  const related = page.getByRole('link', { name: /裝修公司項目管理|傳統五金店上網/ }).first();
  await related.click();
  await expect(page).toHaveURL(/\/cases\/(renovation-project-management|hardware-store-ecommerce)$/);
});

test('不存在的案例回 404', async ({ request }) => {
  const response = await request.get('/cases/this-case-does-not-exist');
  expect(response.status()).toBe(404);
});

test('申請流程：點申請 → localStorage → /apply 送出', async ({ page }) => {
  await page.goto('/cases/tutoring-centre-management');
  await page.getByRole('link', { name: '申請此案例' }).click();
  await expect(page).toHaveURL(/\/apply$/);

  // localStorage 寫入 consult_apply
  const stored = await page.evaluate(() => localStorage.getItem('consult_apply'));
  expect(stored).not.toBeNull();
  const parsed = JSON.parse(stored!);
  expect(parsed).toMatchObject({ caseId: expect.any(String), title: expect.stringContaining('補習社') });

  // 表單：等案例資料載入（案例卡出現），痛點預設全選
  await expect(page.locator('h1')).toContainText('申請合作');
  await expect(page.getByText('申請案例')).toBeVisible();
  const checked = await page.locator('input[type="checkbox"]:checked').count();
  expect(checked).toBeGreaterThan(0);

  await page.getByLabel('申請人名稱 *').fill('e2e 測試員');
  await page.getByLabel('聯絡方式 *').fill('e2e@example.com');
  await page.getByRole('button', { name: '提交申請' }).click();

  await expect(page.getByText('申請已送出。')).toBeVisible();

  // localStorage 已被清除
  const after = await page.evaluate(() => localStorage.getItem('consult_apply'));
  expect(after).toBeNull();
});

test('直接開 /apply 顯示引導', async ({ page }) => {
  await page.goto('/apply');
  await expect(page.locator('h1')).toContainText('請先選擇案例');
  await page.getByRole('link', { name: '前往真實案例' }).click();
  await expect(page).toHaveURL(/\/cases$/);
});
