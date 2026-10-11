import { test, expect } from "@playwright/test";

test("homepage displays captions edited in the content catalog", async ({
  page,
}) => {
  await page.route("**/api/home", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    const banner = data.items.find((item) => item.category === "HERO");
    banner.title = "Hành trình mới từ danh mục nội dung";
    banner.description = "Nội dung banner đã được cập nhật";
    const feature = data.items.find((item) => item.category === "FEATURE");
    feature.title = "Dịch vụ được cập nhật";
    feature.description = "Nội dung dịch vụ từ danh mục";
    await route.fulfill({ response, json: data });
  });
  await page.goto("/");
  await expect(page.locator(".hero-copy h1")).toHaveText(
    "Hành trình mới từ danh mục nội dung",
  );
  const caption = await page.locator(".hero-copy").boundingBox();
  expect(caption.height).toBeGreaterThan(20);
  await expect(
    page.getByRole("heading", { name: "Dịch vụ được cập nhật", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Nội dung dịch vụ từ danh mục", { exact: true }),
  ).toBeVisible();
});

test("homepage carousel, airport keyboard navigation and passenger limits work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const heading = page.locator(".hero-copy h1");
  await expect(heading).toBeVisible();
  const firstTitle = await heading.innerText();
  const images = await page
    .locator(".hero-slide")
    .evaluateAll((slides) =>
      slides.map((slide) => getComputedStyle(slide).backgroundImage),
    );
  expect(new Set(images).size).toBe(images.length);
  await page.getByRole("button", { name: "Banner 2", exact: true }).click();
  await expect(heading).not.toHaveText(firstTitle);
  await expect(
    page.getByRole("button", { name: "Banner 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Banner 3", exact: true }).click();
  await expect(page.locator(".hero-slide.visible")).toHaveClass(/slide-2/);
  await page.locator(".hero-images").evaluate((target) => {
    const start = new Touch({ identifier: 1, target, clientX: 300 });
    const end = new Touch({ identifier: 1, target, clientX: 40 });
    target.dispatchEvent(
      new TouchEvent("touchstart", { bubbles: true, touches: [start] }),
    );
    target.dispatchEvent(
      new TouchEvent("touchend", { bubbles: true, changedTouches: [end] }),
    );
  });
  await expect(
    page.getByRole("button", { name: "Banner 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  if (page.viewportSize().width <= 900) {
    const background = await page.locator(".hero-images").boundingBox();
    const booking = await page.locator(".hero-booking").boundingBox();
    const hero = await page.locator(".hero").boundingBox();
    expect(booking.y).toBeGreaterThanOrEqual(
      background.y + background.height - 1,
    );
    expect(hero.y + hero.height).toBeGreaterThanOrEqual(
      booking.y + booking.height - 1,
    );
  }
  const origin = page
    .getByRole("button", { name: "Điểm khởi hành", exact: true })
    .first();
  await origin.click();
  await page.locator(".airport-popup").getByRole("combobox").fill("ha noi");
  await expect(
    page.locator(".airport-popup").getByRole("option"),
  ).toContainText("HAN");
  await page.keyboard.press("Escape");
  await expect(
    page.locator(".airport-popup").getByRole("combobox"),
  ).not.toBeVisible();
  await origin.click();
  await page.locator(".airport-popup").getByRole("combobox").fill("ha noi");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(origin).toContainText("HAN");
  await page
    .getByRole("button", { name: /Hành khách.*1 người lớn/ })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Giảm người lớn" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Tăng em bé" }).click();
  await expect(page.getByRole("button", { name: "Tăng em bé" })).toBeDisabled();
  await page.getByRole("button", { name: "Xong", exact: true }).click();
  const mobileMenu = page.getByRole("button", { name: "Mở menu", exact: true });
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await page
      .getByRole("navigation", { name: "Menu di động" })
      .getByRole("link", { name: "Chuyến bay của tôi", exact: true })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Menu chính" })
      .getByRole("button", { name: "DỊCH VỤ CHUYẾN BAY", exact: true })
      .hover();
    await expect(
      page.getByRole("link", {
        name: "Mua hành lý, suất ăn, chọn chỗ ngồi",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Menu chính" })
      .getByRole("link", { name: "CHUYẾN BAY CỦA TÔI", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Chuyến bay của tôi", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("homepage reports a real network failure and retry recovers", async ({
  page,
}) => {
  await page.route("**/api/home", (route) => route.abort("failed"));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Không kết nối được máy chủ",
  );
  await page.unroute("**/api/home");
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await expect(page.locator(".hero-copy h1")).toBeVisible();
  await expect(page.getByRole("alert")).not.toBeVisible();
});
