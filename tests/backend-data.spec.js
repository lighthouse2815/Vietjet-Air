import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { postAuth } from "./helpers/auth.js";

test.use({ trace: "off", screenshot: "off" });
test.setTimeout(120000);
async function administrator(request) {
  const local = readFileSync(".env", "utf8");
  const value = name => process.env[name] || local.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1];
  const data = { email: value("ADMIN_EMAIL"), password: value("ADMIN_PASSWORD") };
  const result = await postAuth(request, "login", data);
  expect(result.ok()).toBe(true); return result.json();
}
async function cms(request, slug, admin) {
  const response = await request.get("/api/admin/catalog", { headers: { Authorization: `Bearer ${admin.token}` } });
  expect(response.ok()).toBe(true);
  const record = (await response.json()).content.find(item => item.category === "PAGE" && item.target === `/services/${slug}`);
  expect(record).toBeDefined(); return record;
}
async function update(request, admin, record) {
  const response = await request.post(`/api/admin/content/${record.id}`, { headers: { Authorization: `Bearer ${admin.token}` }, data: record });
  expect(response.ok()).toBe(true); return response;
}

test("Service content API failure shows retry without a local data fallback", async ({ page }) => {
  await page.route("**/api/content/pages/hotels", route => route.abort());
  await page.goto("/services/hotels");
  await expect(page.locator("main").getByRole("button", { name: "Thử lại", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Khách sạn cho hành trình của bạn", exact: true })).toHaveCount(0);
  await page.unroute("**/api/content/pages/hotels");
  await page.locator("main").getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Khách sạn cho hành trình của bạn", exact: true })).toBeVisible();
});

test("A real CMS edit updates service content and voucher denominations", async ({ page, request }) => {
  const admin = await administrator(request), hotel = await cms(request, "hotels", admin), voucher = await cms(request, "voucher", admin);
  try {
    await update(request, admin, { ...hotel, details: { ...hotel.details, heading: "Khách sạn từ backend" } });
    await page.goto("/services/hotels"); await expect(page.getByRole("heading", { name: "Khách sạn từ backend", exact: true })).toBeVisible();
    await update(request, admin, { ...voucher, details: { ...voucher.details, values: [300000] } });
    await page.goto("/services/voucher"); await expect(page.locator(".evoucher-denominations article")).toHaveCount(1);
    await expect(page.locator(".evoucher-denominations article")).toContainText("300.000");
    await expect(page.getByLabel("Mệnh giá", { exact: true }).locator("option")).toHaveCount(1);
  } finally { await update(request, admin, hotel); await update(request, admin, voucher); }
});

test("Statistics values and labels exactly match the database API", async ({ page, request }) => {
  const response = await request.get("/api/site-statistics"); expect(response.ok()).toBe(true); const data = await response.json();
  await page.goto("/");
  for (const metric of data.metrics) {
    const cell = page.locator(".stats-grid > div").filter({ hasText: metric.label });
    await expect(cell).toContainText(new Intl.NumberFormat("vi-VN").format(metric.value));
  }
});

test("Empty backend voucher catalog stays empty and has no seeded fallback", async ({ page, request }) => {
  const admin = await administrator(request), voucher = await cms(request, "voucher", admin);
  try {
    await update(request, admin, { ...voucher, details: {} });
    await page.goto("/services/voucher");
    await expect(page.locator(".evoucher-denominations article")).toHaveCount(0);
    await expect(page.getByLabel("Mệnh giá", { exact: true }).locator("option")).toHaveCount(0);
    await expect(page.locator(".evoucher-combos article")).toHaveCount(0);
    await expect(page.locator(".evoucher-banner-track a")).toHaveCount(0);
  } finally { await update(request, admin, voucher); }
});

test("Empty backend insurance artwork keeps the catalog usable without a local image fallback", async ({ page, request }) => {
  const admin = await administrator(request), shop = await cms(request, "skyshop", admin);
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  try {
    await update(request, admin, { ...shop, details: {} });
    await page.goto("/services/insurance");
    const products = page.locator(".service-insurance-products article");
    await expect(products.first()).toBeVisible();
    await expect(products.locator("img")).toHaveCount(0);
    await expect(products.first().getByRole("link", { name: "Chọn hoặc tra cứu chuyến bay", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  } finally { await update(request, admin, shop); }
});

test("Actual CMS hero and feature edits show their captions on the homepage", async ({ page, request }) => {
  const admin = await administrator(request);
  const response = await request.get("/api/admin/catalog", { headers: { Authorization: `Bearer ${admin.token}` } });
  expect(response.ok()).toBe(true); const { content } = await response.json();
  const hero = content.find(item => item.category === "HERO" && item.sortOrder === 0) || content.filter(item => item.category === "HERO").sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const feature = content.find(item => item.category === "FEATURE");
  try {
    await update(request, admin, { ...hero, title: "Banner từ CMS backend", description: "Nội dung đã lưu trong database" });
    await update(request, admin, { ...feature, title: "Dịch vụ từ CMS backend", description: "Nội dung dịch vụ đã lưu" });
    await page.goto("/");
    await expect(page.locator(".hero-copy h1")).toHaveText("Banner từ CMS backend");
    expect((await page.locator(".hero-copy").boundingBox()).height).toBeGreaterThan(20);
    await expect(page.getByRole("heading", { name: "Dịch vụ từ CMS backend", exact: true })).toBeVisible();
    await expect(page.getByText("Nội dung dịch vụ đã lưu", { exact: true })).toBeVisible();
  } finally { await update(request, admin, hero); await update(request, admin, feature); }
});
