import { expect, test } from '@playwright/test';

// 咨詢 e2e：前台提交 → admin 申請列表出現「一般咨詢」→ 狀態切換
// 帳密來自環境變數（scripts/test-e2e.sh 從 .env export）

const username = process.env.AUTH_ADMIN_USERNAME ?? 'admin';
const password = process.env.AUTH_ADMIN_PASSWORD ?? 'change-me';

test('前台提交咨詢 → 申請列表出現「一般咨詢」→ 狀態切換', async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const name = `e2e-咨詢-${suffix}`;
  const email = `e2e-${suffix}@example.com`;

  // 1. 公開站提交咨詢
  await page.goto('/');
  await page.getByRole('button', { name: '預約免費諮詢' }).first().click();
  await page.getByLabel('你的稱呼').fill(name);
  await page.getByLabel('公司／團隊名稱').fill('e2e 公司');
  await page.getByLabel('聯絡電郵').fill(email);
  await page.getByLabel('目前最想解決甚麼問題？').fill('e2e 咨詢流程驗證');

  const responsePromise = page.waitForResponse(response =>
    response.url().endsWith('/api/consult') &&
    response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: '送出諮詢需求' }).click();
  const response = await responsePromise;
  const status = response.status();
  await page.keyboard.press('Escape');

  // 申請入 DB → 200；限流 → 429（home.spec 已用 1 次額度）
  if (status !== 200) {
    expect([429]).toContain(status);
    return;
  }

  // 2. admin 登入 → 所有申請列表
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto('/admin/apply/all');
  await expect(page.getByText('載入中…')).toHaveCount(0);

  // 3. 新咨詢以申請形式出現：申請人 + 電郵 + 一般咨詢 + note 組合欄位
  const row = page.locator('tbody tr').filter({ hasText: name });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(email);
  await expect(row).toContainText('一般咨詢');
  await expect(row).toContainText('e2e 咨詢流程驗證');

  // 4. 咨詢申請同樣走 5 狀態流程
  await row.locator('select').selectOption('quoted');
  await expect(row.locator('select')).toHaveValue('quoted');
});
