import { test, expect } from "@playwright/test";

test("mobile promotion carousel scrolls with controls and keyboard, then adapts to desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const carousel = page.getByRole("group", { name: "Vé khuyến mãi", exact: true });
  const track = carousel.locator(".promotion-strip");
  const next = carousel.getByRole("button", { name: "Xem mục tiếp", exact: true });
  const previous = carousel.getByRole("button", { name: "Xem mục trước", exact: true });
  await expect(carousel).toBeVisible();
  await carousel.scrollIntoViewIfNeeded();
  await expect(previous).toBeDisabled();
  const before = await track.locator("a").first().boundingBox();
  await next.click();
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);
  await expect(previous).toBeEnabled();
  const after = await track.locator("a").first().boundingBox();
  expect(after.x).toBeLessThan(before.x - 50);
  await previous.click();
  await expect(previous).toBeDisabled();
  await track.focus();
  await page.keyboard.press("ArrowRight");
  await expect(previous).toBeEnabled();
  await page.keyboard.press("ArrowLeft");
  await expect(previous).toBeDisabled();
  for (let i = 0; i < 5 && await next.isEnabled(); i++) {
    const finished = track.evaluate((el) => new Promise((resolve) =>
      el.addEventListener("scrollend", resolve, { once: true })));
    await next.click();
    await finished;
  }
  await expect(next).toBeDisabled();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(next).not.toBeVisible();
  await expect(previous).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("award carousel stays operable with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const carousel = page.getByRole("group", { name: "Thành tựu trong giao diện tham chiếu", exact: true });
  const track = carousel.locator(".awards");
  const next = carousel.getByRole("button", { name: "Xem mục tiếp", exact: true });
  const previous = carousel.getByRole("button", { name: "Xem mục trước", exact: true });
  await expect(carousel).toBeVisible();
  await carousel.scrollIntoViewIfNeeded();
  await expect(previous).toBeDisabled();
  await next.click();
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);
  await previous.click();
  await expect(previous).toBeDisabled();
  await track.focus();
  await page.keyboard.press("ArrowRight");
  await expect(previous).toBeEnabled();
  await expect(page).toHaveURL("/");
});
