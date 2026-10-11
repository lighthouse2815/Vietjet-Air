import { test, expect } from "@playwright/test";

test("homepage paints continuous scenery beneath lower content and the footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".destination-section")).toBeVisible();
  const scenery = await page.evaluate(() => {
    const scene = (element) => {
      for (let node = element; node; node = node.parentElement)
        if (getComputedStyle(node).backgroundImage.includes("url(")) return node;
      return null;
    };
    const cloud = scene(document.querySelector(".cards-service"));
    const footer = scene(document.querySelector(".site-footer"));
    const stats = document.querySelector(".stats-section");
    return {
      lowerContentSharesCloud: [".feature-shop", ".cards-travel", ".destination-section", ".faq-section"]
        .every((selector) => scene(document.querySelector(selector)) === cloud),
      awardsShareFooterScene: !!footer && scene(document.querySelector(".awards")) === footer,
      cloudOverlap: cloud.getBoundingClientRect().bottom - stats.getBoundingClientRect().top,
      statsImage: getComputedStyle(stats).backgroundImage,
      mobilePromotionSize: getComputedStyle(document.querySelector(".promotion-region")).backgroundSize,
      footerImage: footer && getComputedStyle(footer).backgroundImage,
    };
  });
  expect(scenery.lowerContentSharesCloud).toBe(true);
  expect(scenery.awardsShareFooterScene).toBe(true);
  expect(scenery.cloudOverlap).toBeCloseTo(page.viewportSize().width > 900
    ? page.viewportSize().width * 0.08 : 0, 0);
  expect(scenery.statsImage).toContain(page.viewportSize().width > 900
    ? "stats-background.webp" : "stats-background-mobile.webp");
  if (page.viewportSize().width <= 900) {
    expect(scenery.mobilePromotionSize).toBe("auto");
    expect(scenery.footerImage).toContain("sky-background.webp");
  }
});

test("homepage displays captions edited in the content catalog", async ({
  page,
}) => {
  await page.route("**/api/home", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    const banner = data.items.find((item) => item.category === "HERO");
    banner.title = "Hành trình mới từ danh mục nội dung";
    banner.description = "Nội dung banner đã được cập nhật";
    // Match the backend contract: edited captions disable reference artwork.
    delete banner.details.artwork;
    const feature = data.items.find((item) => item.category === "FEATURE");
    feature.title = "Dịch vụ được cập nhật";
    feature.description = "Nội dung dịch vụ từ danh mục";
    delete feature.details.artwork;
    delete feature.details.displayTitle;
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
  await expect(page.locator(".carousel-dots button")).toHaveCount(9);
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
  await page.getByRole("button", { name: "Banner 9", exact: true }).click();
  await expect(page.locator(".hero-slide.visible")).toHaveClass(/slide-8/);
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

test("homepage autoplay follows the reference rhythm and responds to reduced motion", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto("/");
  await expect(page.locator(".hero-copy h1")).toBeVisible();
  await page.mouse.move(0, 0);
  const active = page.locator('.carousel-dots button[aria-pressed="true"]');
  await page.clock.fastForward(7999);
  await expect(active).toHaveAttribute("aria-label", "Banner 1");
  await page.clock.fastForward(1);
  await expect(active).toHaveAttribute("aria-label", "Banner 2");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".hero-copy")).toHaveAttribute("aria-live", "polite");
  await page.clock.fastForward(24000);
  await expect(active).toHaveAttribute("aria-label", "Banner 2");
  await page.getByRole("button", { name: "Banner 3", exact: true }).click();
  await expect(active).toHaveAttribute("aria-label", "Banner 3");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(0, 0);
  await expect(page.locator(".hero-copy")).toHaveAttribute("aria-live", "off");
  await page.clock.fastForward(8000);
  await expect(active).toHaveAttribute("aria-label", "Banner 4");

  await page.mouse.move(40, 260);
  await page.clock.fastForward(16000);
  await expect(active).toHaveAttribute("aria-label", "Banner 4");
  await page.mouse.move(0, 0);
  await page.clock.fastForward(8000);
  await expect(active).toHaveAttribute("aria-label", "Banner 5");
});

test("announcements rotate, pause during interaction and remain manually controllable", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto("/");
  const message = page.locator('.announcement-message[aria-hidden="false"]');
  await expect(message).toContainText("BẢN MÔ PHỎNG ĐỘC LẬP");
  await page.mouse.move(0, 80);
  await page.clock.fastForward(5000);
  await expect(message).toContainText("DEMO10");
  await page.locator(".announcement").hover();
  await page.clock.fastForward(10000);
  await expect(message).toContainText("DEMO10");
  await page.getByRole("button", { name: "Thông báo tiếp", exact: true }).click();
  await expect(message).toContainText("Check-in demo");
  await page.getByRole("button", { name: "Thông báo tiếp", exact: true }).click();
  await expect(message).toContainText("BẢN MÔ PHỎNG ĐỘC LẬP");
  await page.mouse.move(0, 80);
  await expect(page.locator(".announcement-viewport")).toHaveAttribute("aria-live", "off");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".announcement-viewport")).toHaveAttribute("aria-live", "polite");
  await page.clock.fastForward(10000);
  await expect(message).toContainText("BẢN MÔ PHỎNG ĐỘC LẬP");
  await page.getByRole("button", { name: "Thông báo trước", exact: true }).click();
  await expect(message).toContainText("Check-in demo");
  await page.getByRole("button", { name: "Đóng thông báo", exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(page.locator(".announcement")).not.toBeVisible();
});
