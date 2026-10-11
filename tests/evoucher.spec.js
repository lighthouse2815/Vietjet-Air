import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { postAuth } from "./helpers/auth.js";

test.use({ trace: "off", screenshot: "off" });
test.setTimeout(120000);
const headers = (user) => ({ Authorization: `Bearer ${user.token}` });
async function register(request) {
  const response = await postAuth(request, "register", {
    email: `evoucher-${randomUUID()}@example.com`, password: "EVoucherDemo123", name: "Khách demo",
  });
  expect(response.status()).toBe(201);
  return response.json();
}
async function login(page, user) {
  await page.goto("/auth");
  await page.evaluate((user) => {
    sessionStorage.setItem("demo-auth", user.token);
    sessionStorage.setItem("demo-user", JSON.stringify(user));
  }, user);
}
async function vouchers(request, user) {
  const response = await request.get("/api/commerce/account/vouchers", { headers: headers(user) });
  expect(response.ok()).toBe(true);
  return response.json();
}

test("eVoucher quick view selects a denomination that survives reload", async ({ page }) => {
  await page.goto("/services/voucher");
  const card = page.locator(".evoucher-denominations article").filter({ hasText: "500.000" });
  await card.getByRole("button", { name: "Xem nhanh", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("500.000");
  await page.getByRole("dialog").getByRole("button", { name: "Chọn mệnh giá", exact: true }).click();
  await expect(page.getByLabel("Mệnh giá", { exact: true })).toHaveValue("500000");
  await page.reload();
  await expect(page.getByLabel("Mệnh giá", { exact: true })).toHaveValue("500000");
  await expect(page.getByRole("button", { name: "Tạo đơn voucher", exact: true })).toHaveCount(0);
});

test("eVoucher partner details explain availability and its terms menu reaches the internal rules", async ({ page }) => {
  await page.goto("/services/voucher");
  await page.locator(".evoucher-combos article").first().getByRole("button", { name: "Xem nhanh", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Dịch vụ đang chờ tích hợp nhà cung cấp.");
  await expect.poll(() => page.getByRole("dialog").locator("img").evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("dialog").getByRole("button", { name: "Tạo đơn voucher", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  if (page.viewportSize().width <= 900) await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await page.locator("header").getByRole("link", { name: "Điều kiện và Điều khoản", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Điều kiện voucher nội bộ", exact: true })).toBeVisible();
});

test("eVoucher buyer can retry payment and cancel an unused voucher", async ({ page, request }) => {
  const user = await register(request);
  await login(page, user);
  await page.goto("/services/voucher");
  await page.getByLabel("Mệnh giá", { exact: true }).selectOption("200000");
  await page.getByRole("button", { name: "Tạo đơn voucher", exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText("Đã tạo đơn voucher.");
  const [voucher] = await vouchers(request, user);
  expect(voucher.value).toBe(200000);
  const row = page.locator(".evoucher-record").filter({ hasText: voucher.code });
  await row.getByRole("button", { name: "Thử thất bại", exact: true }).click();
  await expect.poll(async () => (await vouchers(request, user))[0].status).toBe("FAILED");
  await row.getByRole("button", { name: "Thanh toán thành công", exact: true }).click();
  await expect.poll(async () => (await vouchers(request, user))[0].balance).toBe(200000);
  await page.reload();
  await row.getByRole("button", { name: "Hủy voucher chưa sử dụng", exact: true }).click();
  await expect.poll(async () => (await vouchers(request, user))[0].status).toBe("CANCELLED");
  expect((await vouchers(request, user))[0].balance).toBe(0);
  await expect(row.getByRole("button", { name: "Thanh toán thành công", exact: true })).toHaveCount(0);
});

test("eVoucher recipient finds a gifted voucher without buyer controls", async ({ page, request }) => {
  const buyer = await register(request), recipient = await register(request);
  await login(page, buyer);
  await page.goto("/services/voucher");
  await page.getByLabel("Mệnh giá", { exact: true }).selectOption("500000");
  await page.getByLabel("Email người nhận", { exact: true }).fill(recipient.email);
  await page.getByRole("button", { name: "Tạo đơn voucher", exact: true }).click();
  await expect(page.locator('p[role="status"]')).toContainText("Đã tạo đơn voucher.");
  const [voucher] = await vouchers(request, buyer);
  expect(voucher.recipientEmail).toBe(recipient.email);
  await page.locator(".evoucher-record").filter({ hasText: voucher.code }).getByRole("button", { name: "Thanh toán thành công", exact: true }).click();
  await expect.poll(async () => (await vouchers(request, buyer))[0].status).toBe("ACTIVE");
  await login(page, recipient);
  await page.goto("/services/voucher");
  await page.getByRole("searchbox", { name: "Tìm voucher", exact: true }).fill(voucher.code);
  await expect(page.locator(".evoucher-record")).toHaveCount(1);
  const row = page.locator(".evoucher-record");
  await expect(row.getByRole("button")).toHaveCount(0);
  await expect(row.getByRole("link", { name: "Đặt chuyến bay", exact: true })).toHaveAttribute("href", "/");
  await page.getByLabel("Trạng thái voucher", { exact: true }).selectOption("CANCELLED");
  await expect(row).toHaveCount(0);
  await page.getByLabel("Trạng thái voucher", { exact: true }).selectOption("ACTIVE");
  await expect(row).toHaveCount(1);
  await page.reload();
  await expect(row).toContainText(voucher.code);
});

test("eVoucher account retry recovers after a real network failure", async ({ page, request }) => {
  await login(page, await register(request));
  await page.route("**/api/commerce/account/vouchers", (route) => route.abort());
  await page.goto("/services/voucher");
  const account = page.locator(".evoucher-records");
  await expect(account.getByRole("button", { name: "Thử lại", exact: true })).toBeVisible();
  await expect(page.locator(".evoucher-denominations article")).toHaveCount(5);
  await page.unroute("**/api/commerce/account/vouchers");
  await account.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(account.getByText("Không có voucher phù hợp.", { exact: true })).toBeVisible();
});

test("eVoucher banners rotate and respond to reduced motion", async ({ page }) => {
  const start = new Date();
  await page.clock.install({ time: start });
  await page.goto("/services/voucher");
  await expect(page.getByRole("button", { name: "Banner 1", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1000));
  await page.clock.fastForward(5100);
  await expect(page.getByRole("button", { name: "Banner 2", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(5100);
  await expect(page.getByRole("button", { name: "Banner 3", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(5100);
  await expect(page.getByRole("button", { name: "Banner 2", exact: true })).toHaveAttribute("aria-pressed", "true");
  const banner = page.locator(".evoucher-banner");
  await banner.evaluate(target => target.dispatchEvent(new TouchEvent("touchstart", {
    bubbles: true, touches: [new Touch({ identifier: 1, target, clientX: 220 })],
  })));
  await page.clock.fastForward(6000);
  await expect(page.getByRole("button", { name: "Banner 2", exact: true })).toHaveAttribute("aria-pressed", "true");
  await banner.evaluate(target => target.dispatchEvent(new TouchEvent("touchend", {
    bubbles: true, changedTouches: [new Touch({ identifier: 1, target, clientX: 100 })],
  })));
  await expect(page.getByRole("button", { name: "Banner 3", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(5100);
  await expect(page.getByRole("button", { name: "Banner 2", exact: true })).toHaveAttribute("aria-pressed", "true");
  await banner.evaluate(target => target.dispatchEvent(new TouchEvent("touchstart", {
    bubbles: true, touches: [new Touch({ identifier: 1, target, clientX: 220 })],
  })));
  await page.clock.fastForward(6000);
  await expect(page.getByRole("button", { name: "Banner 2", exact: true })).toHaveAttribute("aria-pressed", "true");
  await banner.dispatchEvent("touchcancel");
  await page.clock.fastForward(5100);
  await expect(page.getByRole("button", { name: "Banner 1", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".evoucher-banner-track")).toHaveAttribute("aria-live", "polite");
  await page.clock.fastForward(10000);
  await expect(page.getByRole("button", { name: "Banner 1", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Banner 3", exact: true }).click();
  await expect(page.getByRole("button", { name: "Banner 3", exact: true })).toHaveAttribute("aria-pressed", "true");
  await banner.evaluate(target => {
    target.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, touches: [new Touch({ identifier: 1, target, clientX: 220 })] }));
    target.dispatchEvent(new TouchEvent("touchend", { bubbles: true, changedTouches: [new Touch({ identifier: 1, target, clientX: 100 })] }));
  });
  await expect(page.getByRole("button", { name: "Banner 3", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".evoucher-banner-track")).toHaveCSS("transition-property", "none");
});

test("eVoucher remains usable in English without horizontal overflow", async ({ page }) => {
  await page.goto("/services/voucher");
  await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  await expect(page.locator(".evoucher-combos").getByRole("button", { name: "Quick view", exact: true }).first()).toBeVisible();
  await expect(page.getByLabel("Face value", { exact: true })).toBeVisible();
  await expect(page.locator(".evoucher-combos").getByRole("heading", { name: "Flight and hotel packages", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
