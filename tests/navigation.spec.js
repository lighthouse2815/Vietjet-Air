import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

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
