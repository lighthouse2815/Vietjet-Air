import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.use({ trace: "off", screenshot: "off" });
const headers = user => ({ Authorization: `Bearer ${user.token}` });
async function register(request) {
  const response = await request.post("/api/auth/register", { data: { email: `service-${randomUUID()}@example.com`, password: "ServiceDemo123", name: "Khách demo" } });
  expect(response.status()).toBe(201); return response.json();
}
async function login(page, user) {
  await page.goto("/auth");
  await page.evaluate(user => { sessionStorage.setItem("demo-auth", user.token); sessionStorage.setItem("demo-user", JSON.stringify(user)); }, user);
}
async function tickets(request, user) {
  const response = await request.get("/api/support/tickets", { headers: headers(user) });
  expect(response.ok()).toBe(true); return response.json();
}

test("Khách sạn validates dates and saves an account inquiry", async ({ page, request }) => {
  const user = await register(request); await login(page, user);
  await page.goto("/services/hotels");
  await expect(page.getByRole("heading", { name: "Khách sạn cho hành trình của bạn", exact: true })).toBeVisible();
  await page.getByLabel("Điểm đến", { exact: true }).fill("Đà Nẵng");
  const start = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  const end = new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10);
  await page.getByLabel("Ngày nhận phòng", { exact: true }).fill(start);
  await page.getByLabel("Ngày trả phòng", { exact: true }).fill(start);
  await page.getByRole("button", { name: "Gửi yêu cầu tư vấn", exact: true }).click();
  expect(await tickets(request, user)).toHaveLength(0);
  await page.getByLabel("Ngày trả phòng", { exact: true }).fill(end);
  await page.getByLabel("Số phòng", { exact: true }).fill("2");
  await page.getByLabel("Số khách", { exact: true }).fill("3");
  await page.reload();
  await expect(page.getByLabel("Điểm đến", { exact: true })).toHaveValue("Đà Nẵng");
  await page.getByRole("button", { name: "Gửi yêu cầu tư vấn", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã gửi yêu cầu");
  const [ticket] = await tickets(request, user);
  expect(ticket.subject).toContain("Khách sạn");
  expect(ticket.messages[0].body).toContain("Đà Nẵng");
  expect(ticket.messages[0].body).toContain(start);
  await page.getByRole("link", { name: "Theo dõi yêu cầu", exact: true }).click();
  await expect(page.locator("section.panel").filter({ hasText: `#${ticket.id}` })).toContainText("Đà Nẵng");
  expect(await tickets(request, await register(request))).toHaveLength(0);
});

test("Khách sạn keeps a guest draft through login and only returns internally", async ({ page, request }) => {
  const user = await register(request);
  await page.goto("/services/hotels");
  await page.getByLabel("Điểm đến", { exact: true }).fill("Phú Quốc");
  await page.getByRole("link", { name: "Đăng nhập để gửi yêu cầu", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("ServiceDemo123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/services\/hotels$/);
  await expect(page.getByLabel("Điểm đến", { exact: true })).toHaveValue("Phú Quốc");
});

test("eSIM sends destination and device preferences without a provider order", async ({ page, request }) => {
  const user = await register(request); await login(page, user);
  await page.goto("/services/esim");
  await expect(page.getByRole("heading", { name: "Bay khắp thế giới với eSIM", exact: true })).toBeVisible();
  await page.getByLabel("Quốc gia sử dụng", { exact: true }).fill("Nhật Bản");
  await page.getByLabel("Số ngày sử dụng", { exact: true }).fill("7");
  await page.getByLabel("Thiết bị sử dụng", { exact: true }).fill("iPhone 15");
  await page.getByLabel("Thiết bị hỗ trợ eSIM", { exact: true }).selectOption("Đã kiểm tra");
  await page.getByRole("button", { name: "Gửi yêu cầu tư vấn", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã gửi yêu cầu");
  const [ticket] = await tickets(request, user);
  expect(ticket.subject).toContain("eSIM");
  expect(ticket.messages[0].body).toContain("Nhật Bản");
  expect(ticket.messages[0].body).toContain("iPhone 15");
  await expect(page.getByRole("link", { name: "Mở trang nhà cung cấp", exact: true })).toHaveAttribute("href", /agent\.skyfi\.vn/);
  await expect(page.getByRole("button", { name: /Thanh toán|Mua ngay/ })).toHaveCount(0);
});

test("eVisa saves a journey inquiry with transit details", async ({ page, request }) => {
  const user = await register(request); await login(page, user);
  await page.goto("/services/visa");
  await expect(page.getByRole("heading", { name: "Quy định xuất nhập cảnh", exact: true })).toBeVisible();
  const form = page.locator(".service-request");
  await form.getByLabel("Quốc tịch", { exact: true }).fill("Việt Nam");
  await form.getByLabel("Điểm đến", { exact: true }).fill("Australia");
  await form.getByLabel("Điểm quá cảnh", { exact: true }).fill("Singapore");
  await form.getByLabel("Ngày khởi hành", { exact: true }).fill(new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10));
  await form.getByRole("button", { name: "Gửi yêu cầu tư vấn", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("Đã gửi yêu cầu");
  const [ticket] = await tickets(request, user);
  expect(ticket.subject).toContain("eVisa"); expect(ticket.messages[0].body).toContain("Singapore");
  await expect(page.getByRole("link", { name: "Mở trang nhà cung cấp", exact: true })).toHaveAttribute("href", /joinsherpa\.io/);
  await expect(page.locator("aside").getByText("Quy định cần được kiểm tra với cơ quan có thẩm quyền; hệ thống nội bộ không xác nhận quyền nhập cảnh.", { exact: true })).toBeVisible();
});

async function confirmedBooking(request, user) {
  let flight;
  for (let offset = 1; offset < 25 && !flight; offset++) {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() + offset * 86400000));
    const response = await request.get(`/api/flights/search?origin=SGN&destination=HAN&date=${date}&passengers=1`);
    expect(response.ok()).toBe(true); flight = (await response.json())[0];
  }
  expect(flight).toBeTruthy();
  const created = await request.post("/api/bookings", { headers: headers(user), data: {
    segments: [{ flightId: flight.id, fareCode: "ECO", seats: [], extras: [] }],
    passengers: [{ type: "ADULT", title: "MR", lastName: "NGUYEN", firstName: "DEMO", dateOfBirth: "1990-01-01", nationality: "Việt Nam" }],
    contactEmail: user.email, contactPhone: "0901234567", promotionCode: "",
  } });
  expect(created.ok()).toBe(true); const booking = await created.json();
  const paid = await request.post("/api/payments/demo", { headers: { "X-Booking-Token": booking.accessToken }, data: { bookingId: booking.id, outcome: "SUCCESS", requestKey: randomUUID() } });
  expect(paid.ok()).toBe(true); return booking;
}

test("Ngoại tệ looks up an internal booking and saves currency preferences", async ({ page, request }) => {
  const user = await register(request), booking = await confirmedBooking(request, user); await login(page, user);
  await page.goto("/services/currency");
  await expect(page.getByRole("heading", { name: "Mua ngoại tệ cho chuyến đi", exact: true })).toBeVisible();
  const lookup = page.locator(".lookup-form");
  await lookup.getByLabel("Mã đặt chỗ", { exact: true }).fill(booking.code);
  await lookup.getByLabel("Họ", { exact: true }).fill("NGUYEN");
  await lookup.getByLabel("Tên đệm và tên", { exact: true }).fill("DEMO");
  await lookup.getByRole("button", { name: "Tra cứu đặt chỗ", exact: true }).click();
  await expect(page.locator(".service-booking-result")).toContainText(booking.code);
  const form = page.locator(".service-request");
  await form.getByLabel("Loại ngoại tệ", { exact: true }).selectOption("USD");
  await form.getByLabel("Số tiền dự kiến", { exact: true }).fill("500");
  await form.getByLabel("Nơi nhận mong muốn", { exact: true }).fill("TP. Hồ Chí Minh");
  await form.getByRole("button", { name: "Gửi yêu cầu tư vấn", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("Đã gửi yêu cầu");
  const [ticket] = await tickets(request, user);
  expect(ticket.messages[0].body).toContain(booking.code); expect(ticket.messages[0].body).toContain("USD"); expect(ticket.messages[0].body).toContain("500");
  await expect(page.getByText("Tỷ giá và điều kiện mua do HDBank xác nhận. Yêu cầu nội bộ chưa tạo giao dịch ngoại tệ.", { exact: true })).toBeVisible();
});

test("Bảo hiểm uses API pricing and completes a booking service purchase", async ({ page, request }) => {
  const user = await register(request), booking = await confirmedBooking(request, user); await login(page, user);
  const response = await request.get("/api/ancillary-services"); expect(response.ok()).toBe(true);
  const insurance = (await response.json()).find(service => service.category === "INSURANCE");
  await page.goto("/services/insurance");
  await expect(page.getByRole("heading", { name: "Bảo hiểm du lịch Vietjet Travel Safe", exact: true })).toBeVisible();
  await page.getByLabel("Chuyến bay mua bảo hiểm", { exact: true }).selectOption(booking.code);
  const card = page.locator(".service-insurance-products article").filter({ hasText: insurance.name });
  await expect(card).toContainText(new Intl.NumberFormat("vi-VN").format(insurance.price));
  await card.getByRole("link", { name: "Mua bảo hiểm cho chuyến bay", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/my-booking/${booking.code}/manage`));
  await expect(page.locator("#services").getByLabel(insurance.name)).toBeChecked();
  await page.getByRole("button", { name: "Báo giá thay đổi", exact: true }).click();
  await page.getByRole("button", { name: "Thanh toán thay đổi thành công", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã áp dụng thay đổi.");
  const result = await request.get(`/api/bookings/${booking.code}`, { headers: { "X-Booking-Token": booking.accessToken } });
  expect(result.ok()).toBe(true); const updated = await result.json();
  expect(updated.extras.some(extra => extra.service.id === insurance.id)).toBe(true);
  await page.reload(); await expect(page.locator("#services").getByLabel(insurance.name)).toBeChecked();
});

test("Bảo hiểm catalog retries after a network failure and supports guest lookup", async ({ page }) => {
  await page.route("**/api/ancillary-services", route => route.abort());
  await page.goto("/services/insurance");
  const catalog = page.locator(".service-insurance");
  await expect(catalog.getByRole("button", { name: "Thử lại", exact: true })).toBeVisible();
  await page.unroute("**/api/ancillary-services");
  await catalog.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.locator(".service-insurance-products article")).not.toHaveCount(0);
  await expect(page.locator(".lookup-form")).toBeVisible();
  await expect(catalog.getByRole("link", { name: "Mua bảo hiểm cho chuyến bay", exact: true })).toHaveCount(0);
});
