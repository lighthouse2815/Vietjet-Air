import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { postAuth } from "./helpers/auth.js";

test.setTimeout(120000);

test("SkyShop searches and filters the live service catalog", async ({ page, request }) => {
  const services = await (await request.get("/api/ancillary-services")).json();
  const products = await (await request.get("/api/commerce/products")).json();
  const meal = services.find((service) => service.category === "MEAL");
  await page.goto("/services/skyshop");
  const catalog = page.locator(".skyshop-catalog");
  await expect(catalog.getByRole("heading", { name: meal.name, exact: true })).toBeVisible();
  if (page.viewportSize().width <= 900) await page.getByRole("button", { name: "Tìm kiếm sản phẩm", exact: true }).click();
  await page.getByRole("searchbox", { name: "Tìm kiếm sản phẩm", exact: true }).fill(meal.name);
  await expect(catalog.locator("article")).toHaveCount(1);
  await expect(catalog.getByRole("heading", { name: meal.name, exact: true })).toBeVisible();
  await page.getByRole("searchbox").fill("khong-co-san-pham-nay");
  await expect(catalog.getByText("Không tìm thấy sản phẩm phù hợp.", { exact: true })).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.getByRole("button", { name: "Hotmeal", exact: true }).click();
  await expect(catalog.locator("article")).toHaveCount(services.filter((service) => service.category === "MEAL").length);
  await page.getByRole("combobox", { name: "Phương thức giao hàng", exact: true }).selectOption("PICKUP");
  await expect(catalog.locator("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Xem tất cả", exact: true }).first().click();
  await expect(catalog.locator("article")).toHaveCount(products.length);
});

test("SkyShop preserves the cart after reload and caps quantities at the order limit", async ({ page, request }) => {
  const products = await (await request.get("/api/commerce/products")).json();
  const product = products.find((item) => item.stock >= 10);
  await page.goto("/services/skyshop");
  const card = page.locator(".skyshop-catalog article").filter({ has: page.getByRole("heading", { name: product.name, exact: true }) });
  await card.getByLabel("Số lượng", { exact: true }).fill("2");
  await page.reload();
  await expect(card.getByLabel("Số lượng", { exact: true })).toHaveValue("2");
  await card.getByLabel("Số lượng", { exact: true }).fill("11");
  await expect(card.getByLabel("Số lượng", { exact: true })).toHaveValue("10");
  await page.locator(".skyshop-toolbar").getByRole("link", { name: /Giỏ hàng/ }).click();
  await expect(page.getByRole("heading", { name: "Giỏ hàng", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tạo đơn hàng", exact: true })).not.toBeVisible();
});

test("SkyShop product details retain API prices and close by keyboard", async ({ page, request }) => {
  const services = await (await request.get("/api/ancillary-services")).json();
  const meal = services.find((service) => service.category === "MEAL");
  await page.goto("/services/skyshop");
  const card = page.locator(".skyshop-catalog article").filter({ has: page.getByRole("heading", { name: meal.name, exact: true }) });
  await card.getByRole("button", { name: "Xem chi tiết", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: meal.name, exact: true })).toBeVisible();
  await expect(dialog).toContainText(new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(meal.price));
  await expect(dialog.getByRole("link", { name: "Chọn chuyến bay", exact: true })).toHaveAttribute("href", "/my-booking");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("SkyShop identifies supplier services and keeps its layout usable in English", async ({ page }) => {
  await page.goto("/services/skyshop");
  await page.getByRole("button", { name: "Taxi", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Dịch vụ đang chờ tích hợp nhà cung cấp.");
  await page.keyboard.press("Escape");
  await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
  if (page.viewportSize().width <= 900) await page.getByRole("button", { name: "Search products", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Search products", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("SkyShop opens a confirmed booking with the chosen service prepared", async ({ page, request }) => {
  const auth = await postAuth(request, "register", {
    email: `skyshop-${randomUUID()}@example.com`, name: "Khách demo", password: "SkyShopDemo123",
  });
  expect(auth.status()).toBe(201);
  const user = await auth.json();
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() + 86400000));
  const flights = await (await request.get(`/api/flights/search?origin=SGN&destination=HAN&date=${date}&passengers=1`)).json();
  const created = await request.post("/api/bookings", { headers: { Authorization: `Bearer ${user.token}` }, data: {
    segments: [{ flightId: flights[0].id, fareCode: "ECO", seats: [], extras: [] }],
    passengers: [{ type: "ADULT", title: "MR", lastName: "NGUYEN", firstName: "DEMO", dateOfBirth: "1990-01-01", nationality: "Việt Nam" }],
    contactEmail: user.email, contactPhone: "0901234567", promotionCode: "",
  } });
  expect(created.ok()).toBe(true);
  const booking = await created.json();
  const payment = await request.post("/api/payments/demo", { headers: { "X-Booking-Token": booking.accessToken }, data: {
    bookingId: booking.id, outcome: "SUCCESS", requestKey: randomUUID(),
  } });
  expect(payment.ok()).toBe(true);
  await page.goto("/auth");
  await page.evaluate((user) => {
    sessionStorage.setItem("demo-auth", user.token);
    sessionStorage.setItem("demo-user", JSON.stringify(user));
  }, user);
  const services = await (await request.get("/api/ancillary-services")).json();
  const meal = services.find((service) => service.category === "MEAL");
  await page.goto("/services/skyshop");
  await page.getByLabel("Chọn chuyến bay SkyShop", { exact: true }).selectOption(booking.code);
  const card = page.locator(".skyshop-catalog article").filter({ has: page.getByRole("heading", { name: meal.name, exact: true }) });
  await card.getByRole("link", { name: "Mua thêm dịch vụ", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/my-booking/${booking.code}/manage`));
  const section = page.locator("#services");
  await expect(section.getByLabel(meal.name)).toBeChecked();
});
