import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { postAuth } from './helpers/auth.js';

// Never retain an administrator session or credentials in browser artifacts.
test.use({ trace: 'off', screenshot: 'off' });
test.setTimeout(120000);
const password = 'InternalDemo123';
const authHeaders = user => ({ Authorization: `Bearer ${user.token}` });
const bookingHeaders = booking => ({ 'X-Booking-Token': booking.accessToken });
const date = offset => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(Date.now() + offset * 86400000));
async function register(request) {
  const response = await postAuth(request, 'register', {
    email: `internal-${randomUUID()}@example.com`, password, name: 'Khách demo',
  });
  expect(response.status()).toBe(201);
  return response.json();
}
async function loginBrowser(page, user) {
  await page.goto('/auth');
  await page.evaluate(user => {
    sessionStorage.setItem('demo-auth', user.token);
    sessionStorage.setItem('demo-user', JSON.stringify(user));
  }, user);
}
async function createBooking(request, user, fare = 'ECO') {
  let flight;
  for (let offset = 1; offset < 25 && !flight; offset++) {
    const response = await request.get(`/api/flights/search?origin=SGN&destination=HAN&date=${date(offset)}&passengers=1`);
    expect(response.ok()).toBeTruthy();
    flight = (await response.json())[0];
  }
  expect(flight).toBeTruthy();
  const response = await request.post('/api/bookings', { headers: authHeaders(user), data: {
    segments: [{ flightId: flight.id, fareCode: fare, seats: [], extras: [] }],
    passengers: [{ type: 'ADULT', title: 'MR', lastName: 'NGUYEN', firstName: 'DEMO', dateOfBirth: '1990-01-01', nationality: 'Việt Nam' }],
    contactEmail: user.email, contactPhone: '0901234567', promotionCode: '',
  }});
  expect(response.ok()).toBeTruthy();
  return response.json();
}
async function confirm(request, booking) {
  const response = await request.post('/api/payments/demo', { headers: bookingHeaders(booking), data: {
    bookingId: booking.id, outcome: 'SUCCESS', requestKey: randomUUID(),
  }});
  expect(response.ok()).toBeTruthy();
}
async function administrator(request) {
  const local = readFileSync('.env', 'utf8');
  const value = name => process.env[name] || local.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1];
  const response = await postAuth(request, 'login', { email: value('ADMIN_EMAIL'), password: value('ADMIN_PASSWORD') });
  expect(response.status(), 'Run npm run setup:admin and restart the backend before internal E2E tests').toBe(200);
  return response.json();
}

for (const width of [1920, 1440, 768, 390]) {
  test(`language selection persists without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByLabel('Ngôn ngữ', { exact: true }).selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('button', { name: 'Search flights', exact: true }).first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload();
    await expect(page.getByLabel('Language', { exact: true })).toHaveValue('en');
    await page.goto('/services/support');
    await expect(page.getByRole('heading', { name: 'Support center', exact: true })).toBeVisible();
    await page.getByLabel('Language', { exact: true }).selectOption('vi');
    await expect(page.getByRole('heading', { name: 'Trung tâm hỗ trợ', exact: true })).toBeVisible();
  });
}

test('profile, saved traveler and support exchanges persist per account', async ({ page, request }) => {
  const user = await register(request);
  await loginBrowser(page, user);
  await page.goto('/account');
  await page.getByLabel('Tên hiển thị', { exact: true }).fill('Khách đã cập nhật');
  await page.getByLabel('Số điện thoại', { exact: true }).fill('0901234567');
  await page.getByRole('button', { name: 'Lưu hồ sơ', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Đã lưu hồ sơ.');
  await page.getByLabel('Họ', { exact: true }).fill('TRAN');
  await page.getByLabel('Tên đệm và tên', { exact: true }).fill('HÀNH KHÁCH');
  await page.getByLabel('Ngày sinh', { exact: true }).fill('1995-02-03');
  await page.getByRole('button', { name: 'Lưu hành khách', exact: true }).click();
  await expect(page.locator('.account-booking')).toContainText('TRAN HÀNH KHÁCH');
  await page.reload();
  await expect(page.getByLabel('Tên hiển thị', { exact: true })).toHaveValue('Khách đã cập nhật');
  await expect(page.locator('.account-booking')).toContainText('TRAN HÀNH KHÁCH');
  await page.goto('/services/support');
  await page.getByLabel('Chủ đề', { exact: true }).fill('Hỗ trợ nội bộ E2E');
  await page.getByLabel('Nội dung', { exact: true }).fill('Tôi muốn theo dõi yêu cầu.');
  await page.getByRole('button', { name: 'Gửi yêu cầu', exact: true }).click();
  const ticket = page.locator('section.panel').filter({ hasText: 'Hỗ trợ nội bộ E2E' });
  await expect(ticket).toContainText('Tôi muốn theo dõi yêu cầu.');
  await ticket.getByLabel('Trả lời', { exact: true }).fill('Bổ sung thông tin.');
  await ticket.getByRole('button', { name: 'Gửi trả lời', exact: true }).click();
  await expect(ticket).toContainText('Bổ sung thông tin.');
  await ticket.getByRole('button', { name: 'Đóng yêu cầu', exact: true }).click();
  await expect(ticket.getByRole('button', { name: 'Gửi trả lời', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(ticket).toContainText('Đã đóng');
});

test('voucher payment earns eligible points and points can be redeemed', async ({ page, request }) => {
  const user = await register(request);
  await loginBrowser(page, user);
  await page.goto('/services/voucher');
  await page.getByRole('button', { name: 'Tạo đơn voucher', exact: true }).click();
  await page.getByRole('button', { name: 'Thanh toán thành công', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Thanh toán demo thành công.');
  const vouchers = await (await request.get('/api/commerce/account/vouchers', { headers: authHeaders(user) })).json();
  expect(vouchers[0].status).toBe('ACTIVE');
  const booking = await createBooking(request, user, 'BUSINESS');
  await page.evaluate(booking => sessionStorage.setItem(`booking-token-${booking.code}`, booking.accessToken), booking);
  await page.goto('/my-booking');
  await page.getByLabel('Mã đặt chỗ', { exact: true }).fill(booking.code);
  await page.getByLabel('Họ', { exact: true }).fill('NGUYEN');
  await page.getByLabel('Tên đệm và tên', { exact: true }).fill('DEMO');
  await page.getByRole('button', { name: 'Tra cứu đặt chỗ', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục thanh toán demo', exact: true }).click();
  await page.getByRole('combobox', { name: 'Dùng voucher nội bộ', exact: true }).selectOption(String(vouchers[0].id));
  await page.getByRole('button', { name: 'Thanh toán thành công', exact: true }).click();
  await expect(page).toHaveURL(/booking\/success/);
  const wallet = await (await request.get('/api/commerce/account/wallet', { headers: authHeaders(user) })).json();
  expect(wallet.points).toBe(Math.floor((booking.price.totalAmount - 100000) / 10000));
  await page.goto('/services/skyjoy');
  await page.getByLabel('Số điểm đổi', { exact: true }).fill('100');
  await page.getByRole('button', { name: 'Đổi điểm lấy voucher', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Đã đổi điểm thành voucher.');
  const after = await (await request.get('/api/commerce/account/wallet', { headers: authHeaders(user) })).json();
  expect(after.points).toBe(wallet.points - 100);
});

test('shop retries payment and cancellation restores stock and points', async ({ page, request }) => {
  const user = await register(request);
  const products = await (await request.get('/api/commerce/products')).json();
  const product = products.find(p => p.stock > 0);
  expect(product).toBeTruthy();
  await loginBrowser(page, user);
  await page.goto('/services/skyshop');
  const card = page.locator('article.panel').filter({ has: page.getByRole('heading', { name: product.name, exact: true }) });
  await card.getByLabel('Số lượng', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Tạo đơn hàng', exact: true }).click();
  await page.getByRole('button', { name: 'Thử thất bại', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Đã ghi nhận kết quả thanh toán.');
  await page.getByRole('button', { name: 'Thanh toán thành công', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Thanh toán demo thành công.');
  await page.getByRole('button', { name: 'Hủy đơn hàng', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Đã hủy theo điều kiện demo.');
  const afterProducts = await (await request.get('/api/commerce/products')).json();
  expect(afterProducts.find(p => p.id === product.id).stock).toBe(product.stock);
  const wallet = await (await request.get('/api/commerce/account/wallet', { headers: authHeaders(user) })).json();
  expect(wallet.points).toBe(0);
});

test('paid booking changes and refund approval are usable through administration', async ({ page, request }) => {
  const user = await register(request);
  const booking = await createBooking(request, user);
  await confirm(request, booking);
  await loginBrowser(page, user);
  await page.evaluate(b => sessionStorage.setItem(`booking-token-${b.code}`, b.accessToken), booking);
  await page.goto(`/my-booking/${booking.code}/manage`);
  await page.getByLabel(/Hành lý ký gửi 20 kg/).check();
  await page.getByLabel('Email liên hệ', { exact: true }).fill('changed@example.com');
  await page.getByRole('button', { name: 'Báo giá thay đổi', exact: true }).click();
  await page.getByRole('button', { name: 'Thử thanh toán thất bại', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Booking cũ vẫn được giữ.');
  await page.getByRole('button', { name: 'Thanh toán thay đổi thành công', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Đã áp dụng thay đổi.');
  const changed = await (await request.get(`/api/bookings/${booking.code}`, { headers: bookingHeaders(booking) })).json();
  expect(changed.contactEmail).toBe('changed@example.com');
  expect(changed.extras).toHaveLength(1);
  await page.getByLabel('Lý do', { exact: true }).fill(`Hoàn nội bộ ${booking.code}`);
  await page.getByRole('button', { name: 'Gửi yêu cầu hoàn vé', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Đã gửi yêu cầu hoàn vé.');
  const admin = await administrator(request);
  await loginBrowser(page, admin);
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Hoàn vé', exact: true }).click();
  const refund = page.locator('section.panel').filter({ hasText: `Hoàn nội bộ ${booking.code}` });
  await refund.getByLabel('Ghi chú xử lý', { exact: true }).fill('Duyệt bản demo');
  await refund.getByRole('button', { name: 'Xác nhận xử lý', exact: true }).click();
  await expect(refund.getByRole('combobox', { name: 'Thao tác', exact: true })).toHaveValue('COMPLETE');
  await refund.getByLabel('Ghi chú xử lý', { exact: true }).fill('Đã hoàn trong bản demo');
  await refund.getByRole('button', { name: 'Xác nhận xử lý', exact: true }).click();
  await expect(refund.getByRole('heading')).toContainText('Đã hoàn tất');
  const wallet = await (await request.get('/api/commerce/account/wallet', { headers: authHeaders(user) })).json();
  expect(wallet.points).toBe(0);
});

for (const [path, expected] of [['multi-city', 3], ['groups', 10]]) {
  test(`${path} selections enter the shared checkout`, async ({ page }) => {
    await page.goto(`/services/${path}`);
    const legs = page.locator('section.panel').filter({ has: page.getByRole('heading', { name: /^Chặng / }) });
    await expect(legs).toHaveCount(path === 'multi-city' ? 3 : 2);
    const count = await legs.count();
    for (let i = 0; i < count; i++) await legs.nth(i).getByRole('button', { name: /Chọn Eco/ }).first().click();
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
    await expect(page).toHaveURL(/booking\/passengers/);
    if (path === 'groups') await expect(page.getByLabel('Họ', { exact: true })).toHaveCount(expected);
    else {
      const segments = await page.evaluate(() => JSON.parse(sessionStorage.getItem('booking-draft')).segments.length);
      expect(segments).toBe(expected);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('password recovery from the demo outbox revokes the old session', async ({ page, request }) => {
  const user = await register(request);
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Quên mật khẩu?', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByRole('button', { name: 'Gửi hướng dẫn khôi phục', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Nếu email tồn tại');
  const admin = await administrator(request);
  const mail = await (await request.get('/api/admin/mail', { headers: authHeaders(admin) })).json();
  const message = mail.find(m => m.recipient === user.email);
  expect(message).toBeTruthy();
  await page.goto(message.body);
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('RecoveredDemo123');
  await page.getByRole('button', { name: 'Lưu mật khẩu mới', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Đã khôi phục mật khẩu.');
  expect((await request.get('/api/account/profile', { headers: authHeaders(user) })).status()).toBe(401);
  const login = await postAuth(request, 'login', { email: user.email, password: 'RecoveredDemo123' });
  expect(login.status()).toBe(200);
});

test('administration preserves service category identifiers in English', async ({ page, request }) => {
  const admin = await administrator(request);
  const services = await (await request.get('/api/ancillary-services')).json();
  await loginBrowser(page, admin);
  await page.goto('/admin');
  await page.getByLabel('Ngôn ngữ', { exact: true }).selectOption('en');
  await page.getByRole('button', { name: 'Catalog and content', exact: true }).click();
  const row = page.locator('.account-booking').filter({ hasText: services[0].name });
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Service category', exact: true })).toHaveValue(services[0].category);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText('Action saved.');
  const after = await (await request.get('/api/ancillary-services')).json();
  expect(after.find(s => s.id === services[0].id).category).toBe(services[0].category);
  await page.getByRole('button', { name: 'Flights', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add flight', exact: true })).toBeVisible();
});

