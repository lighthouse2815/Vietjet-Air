import { test, expect } from "@playwright/test";

test("Service pages translate, activate navigation and keep drafts separate", async ({ page }) => {
  const routes = [["hotels", "Khách sạn cho hành trình của bạn", "Hotels for your journey"], ["esim", "Bay khắp thế giới với eSIM", "Travel the world with eSIM"],
    ["visa", "Quy định xuất nhập cảnh", "Immigration requirements"], ["currency", "Mua ngoại tệ cho chuyến đi", "Currency exchange for your trip"],
    ["insurance", "Bảo hiểm du lịch Vietjet Travel Safe", "Vietjet Travel Safe travel insurance"], ["skyjoy", "SkyJoy · Tích điểm, đổi niềm vui", "SkyJoy · Earn points, redeem joy"]];
  for (const [slug, vi, en] of routes) {
    await page.goto(`/services/${slug}`); await expect(page.getByRole("heading", { name: vi, exact: true })).toBeVisible();
    await expect(page.locator(`.product-nav a[href="/services/${slug}"]`)).toHaveAttribute("aria-current", "page");
    await page.getByLabel("Ngôn ngữ", { exact: true }).selectOption("en");
    await expect(page.getByRole("heading", { name: en, exact: true })).toBeVisible();
    const untranslated = await page.locator("main").evaluate(main => {
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT); const bad = []; let node;
      while ((node = walker.nextNode())) if (/[À-ỹ]/u.test(node.textContent) && node.parentElement.checkVisibility()) bad.push(node.textContent.trim());
      return bad;
    });
    expect(untranslated, slug).toEqual([]);
    await page.getByLabel("Language", { exact: true }).selectOption("vi");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), slug).toBe(false);
  }
  await page.goto("/services/hotels"); await page.getByLabel("Điểm đến", { exact: true }).fill("Phú Quốc");
  await page.goto("/services/visa"); await expect(page.locator(".service-request").getByLabel("Điểm đến", { exact: true })).toHaveValue("");
  await page.goto("/services/hotels"); await expect(page.getByLabel("Điểm đến", { exact: true })).toHaveValue("Phú Quốc");
});

test("SkyJoy autoplay pauses on hover and responds to motion preference changes", async ({ page }) => {
  await page.clock.install(); await page.goto("/services/skyjoy");
  const carousel = page.locator(".skyjoy-carousel");
  const first = page.getByRole("button", { name: "Banner SkyJoy 1", exact: true });
  const second = page.getByRole("button", { name: "Banner SkyJoy 2", exact: true });
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 1000));
  await page.clock.fastForward(6100); await expect(second).toHaveAttribute("aria-pressed", "true");
  await carousel.hover(); await expect(carousel).toHaveAttribute("aria-live", "polite");
  await page.clock.fastForward(10000); await expect(second).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0); await expect(carousel).toHaveAttribute("aria-live", "off");
  await page.clock.fastForward(6100); await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" }); await expect(carousel).toHaveAttribute("aria-live", "polite");
  await page.clock.fastForward(10000); await expect(first).toHaveAttribute("aria-pressed", "true");
});

test("SkyJoy stays paused while keyboard focus remains inside", async ({ page }) => {
  await page.goto("/services/skyjoy"); const carousel = page.locator(".skyjoy-carousel");
  await carousel.hover(); await page.getByRole("button", { name: "Banner SkyJoy 2", exact: true }).focus();
  await page.mouse.move(0, 0); await expect(carousel).toHaveAttribute("aria-live", "polite");
});

test("Provider actions stay clickable above the statistics section", async ({ page }) => {
  for (const slug of ["hotels", "esim", "visa", "currency", "insurance"]) {
    await page.goto(`/services/${slug}`);
    const actions = page.locator(".service-provider .button");
    await expect(actions).toHaveCount(2);
    for (const action of await actions.all()) await action.click({ trial: true, timeout: 2500 });
  }
});
