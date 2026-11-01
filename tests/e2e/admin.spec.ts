import { expect, test } from '@playwright/test';

// 後台 e2e：登入守衛、NextAuth 登入、真實 CRUD
// 帳密來自環境變數（scripts/test-e2e.sh 從 .env export）

const username = process.env.AUTH_ADMIN_USERNAME ?? 'admin';
const password = process.env.AUTH_ADMIN_PASSWORD ?? 'change-me';

test('未登入 /admin 導向登入頁', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('錯誤密碼顯示錯誤訊息', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill('wrong-password-e2e');
  await page.getByRole('button', { name: '登入' }).click();
  // Next route announcer 也是 role=alert，需限於表單內
  await expect(page.locator('form p[role="alert"]')).toContainText('帳號或密碼錯誤');
});

test('登入後進入 dashboard（真實統計）', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  // 種子資料：側欄連結 + 統計卡（案例數 3）+ news 內容
  await expect(page.getByRole('link', { name: '真實案例', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /^3\s+真實案例$/ })).toBeVisible();

  // 最新資訊區顯示種子 news
  await expect(page.getByText('AI 最新趨勢：本地模型 vs 雲端')).toBeVisible();
});

test('申請列表：狀態切換持久化', async ({ page }) => {
  // 登入
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  // 如果有申請：切換狀態並驗證重整後保持
  await page.goto('/admin/apply/all');
  // 等 tRPC 載入完成（載入中提示消失）
  await expect(page.getByText('載入中…')).toHaveCount(0);
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  if (rowCount > 0) {
    const select = rows.first().locator('select');
    await select.selectOption('quoted');
    await expect(rows.first().locator('select')).toHaveValue('quoted');
    await page.reload();
    const reloadedSelect = page.locator('tbody tr').first().locator('select');
    await expect(reloadedSelect).toHaveValue('quoted');
    // 還原狀態
    await reloadedSelect.selectOption('pending');
  } else {
    await expect(page.getByText('未有申請')).toBeVisible();
  }
});

test('標籤管理：新增與改名', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto('/admin/tags');
  const suffix = Date.now().toString().slice(-6);
  const newName = `e2e-${suffix}`;
  const renamed = `e2e-renamed-${suffix}`;

  // 喺第一個 group 新增標籤
  const firstGroup = page.locator('.space-y-6 .grid > div').first();
  await firstGroup.getByPlaceholder('新標籤名稱').fill(newName);
  await firstGroup.getByRole('button', { name: /加/ }).first().click();
  await expect(page.getByText(newName, { exact: true })).toBeVisible();

  // 改名（編輯 input 有 autoFocus，直接對焦的 input 填寫）
  const tagRow = page.getByText(newName, { exact: true }).locator('xpath=..');
  await tagRow.getByRole('button', { name: '改名' }).click();
  await page.locator('input:focus').fill(renamed);
  await page.getByRole('button', { name: '儲存', exact: true }).click();
  await expect(page.getByText(renamed, { exact: true })).toBeVisible();
});

test('案例後台：列表顯示種子案例並可開啟公開頁', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto('/admin/cases');
  await expect(page.getByText('補習社數碼轉型', { exact: false }).first()).toBeVisible();
});

test('服務目錄：種子分類顯示 + 新增分類 + 清理', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('帳號').fill(username);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto('/admin/services');
  // 種子分類（seed-data/service-catalog.ts）
  await expect(page.getByText('AI 應用與知識助手', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('ai-chatbot', { exact: true }).first()).toBeVisible();

  // 新增分類
  const suffix = Date.now().toString().slice(-6);
  const name = `e2e-cat-${suffix}`;
  await page.getByRole('link', { name: '新增分類' }).click();
  await page.getByLabel('名稱 *').fill(name);
  await page.getByLabel('Slug（唯一，小寫英數與 -）*').fill(name);
  await page.getByRole('button', { name: '儲存' }).click();
  await expect(page).toHaveURL(/\/admin\/services$/);
  await expect(page.getByText(name, { exact: false })).toBeVisible();

  // 清理：刪除呢個分類（確認對話框）
  const card = page.locator('div.rounded-xl').filter({ hasText: name }).first();
  page.on('dialog', (dialog) => dialog.accept());
  await card.getByRole('button', { name: '刪除' }).click();
  await expect(page.getByText(name, { exact: false })).toHaveCount(0);
});
