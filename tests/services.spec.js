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
