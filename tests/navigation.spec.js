import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('footer links open by keyboard on mobile and remain visible after resizing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const footer = page.locator('footer');
  const conditions = footer.getByRole('link', {
    name: 'Điều lệ vận chuyển',
    exact: true,
  });
  await expect(conditions).not.toBeVisible();
  await footer.getByText('Để có chuyến bay tốt đẹp', { exact: true }).click();
  await expect(conditions).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(conditions).not.toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(conditions).toBeVisible();
  await conditions.click();
  await expect(page).toHaveURL(/services\/booking/);
});

test('switching between shop, voucher and wallet keeps each page usable', async ({ page, request }) => {
  const response = await request.post('/api/auth/register', { data: {
    email: `navigation-${randomUUID()}@example.com`, password: 'NavigationDemo123', name: 'Khách demo',
  }});
  expect(response.status()).toBe(201);
  const user = await response.json();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/auth');
  await page.evaluate(user => {
    sessionStorage.setItem('demo-auth', user.token);
    sessionStorage.setItem('demo-user', JSON.stringify(user));
  }, user);
  await page.goto('/services/skyjoy');
  await expect(page.getByRole('heading', { name: 'Lịch sử điểm', exact: true })).toBeVisible();
  await page.locator('main').getByRole('link', { name: 'Cửa hàng', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Giỏ hàng', exact: true })).toBeVisible();
  await page.locator('main').getByRole('link', { name: 'Voucher', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mua hoặc tặng voucher', exact: true })).toBeVisible();
  await page.locator('main').getByRole('link', { name: 'Điểm thưởng', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Lịch sử điểm', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('opening multi-city from group booking resets the journey form', async ({ page }) => {
  await page.goto('/services/groups');
  const legs = page.locator('section.panel').filter({ has: page.getByRole('heading', { name: /^Chặng / }) });
  await expect(legs).toHaveCount(2);
  await page.locator('footer').getByRole('link', { name: 'Thông tin nối chuyến', exact: true }).click();
  await expect(page).toHaveURL(/services\/multi-city/);
  await expect(legs).toHaveCount(3);
  await expect(page.getByRole('spinbutton', { name: 'Người lớn', exact: true })).toHaveValue('1');
});
