import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = "docs/verification";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = {
  verifiedAt: new Date().toISOString(),
  url: "http://localhost:5173",
  reference: "https://www.vietjetair.com/vi",
  viewports: [],
};

// Sample rendered frames, including intermediate values, rather than CSS alone.
const sampleMotion = (page, target, trigger, property) => page.evaluate(
  ({ target, trigger, property }) => new Promise((resolve) => {
    const element = document.querySelector(target);
    const values = [];
    getComputedStyle(element).opacity;
    document.querySelector(trigger).click();
    const started = performance.now();
    const tick = () => {
      const value = property === "opacity"
        ? Number(getComputedStyle(element).opacity) : element.scrollLeft;
      values.push(Math.round(value * 1000) / 1000);
      if (performance.now() - started < 900) requestAnimationFrame(tick);
      else resolve(values);
    };
    requestAnimationFrame(tick);
  }), { target, trigger, property },
);

try {
  for (const [name, width, height] of [
    ["desktop", 1920, 1080], ["laptop", 1440, 900],
    ["tablet", 768, 1024], ["mobile", 390, 844],
  ]) {
    const recording = name === "laptop" || name === "mobile";
    const page = await browser.newPage({
      viewport: { width, height },
      ...(recording ? { recordVideo: {
        dir: "/tmp/vietjet-home-motion-videos", size: { width, height },
      } } : {}),
    });
    const video = page.video();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(report.url);
    await page.locator(".hero-copy h1").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(1, 65);
    if (recording) {
      await page.waitForFunction(() =>
        document.querySelector('[aria-label="Banner 2"]')?.getAttribute("aria-pressed") === "true",
      null, { timeout: 12000 });
    }
    const index = recording ? 2 : 1;
    const fade = await sampleMotion(page, `.slide-${index}`,
      `[aria-label="Banner ${index + 1}"]`, "opacity");
    assert.ok(fade.some((value) => value > 0 && value < 1), `${name}: fade frames`);
    assert.equal(fade.at(-1), 1, `${name}: fade completed`);
    const fadeDuration = await page.locator(".hero-slide").first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    assert.equal(fadeDuration, "0.5s");

    let scroll = [];
    if (width <= 900) {
      await page.locator(".promotion-strip").scrollIntoViewIfNeeded();
      scroll = await sampleMotion(page, ".promotion-strip",
        ".promotion-region .scroll-arrow.next", "scrollLeft");
      assert.ok(new Set(scroll).size > 2, `${name}: smooth scroll frames`);
      assert.ok(scroll.at(-1) > 0);
    }
    await page.locator(".information-banners").scrollIntoViewIfNeeded();
    const image = page.locator(".information-banners img").first();
    await image.evaluate((el) => el.decode());
    await page.locator(".information-banners .home-image-loaded").first().waitFor();
    const imageAnimation = await image.evaluate((el) => ({
      name: getComputedStyle(el).animationName,
      duration: getComputedStyle(el).animationDuration,
    }));
    assert.deepEqual(imageAnimation, { name: "home-image-in", duration: "1s" });
    const background = await page.locator(".home-cloud-background")
      .evaluate((el) => getComputedStyle(el).backgroundAttachment);
    assert.equal(background, width > 900 ? "fixed" : "scroll");
    const support = await page.locator(".help-bubble")
      .evaluate((el) => getComputedStyle(el).animationDuration);
    assert.equal(support, "3s");

    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await image.evaluate((el) => getComputedStyle(el).animationName), "none");
    assert.equal(await page.locator(".help-bubble")
      .evaluate((el) => getComputedStyle(el).animationName), "none");
    assert.equal(await page.locator(".home-cloud-background")
      .evaluate((el) => getComputedStyle(el).backgroundAttachment), "scroll");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    await page.close();
    const videoPath = recording ? `${output}/home-motion-${name}.webm` : null;
    if (video) await video.saveAs(videoPath);
    report.viewports.push({ name, width, height, fadeDuration, fade, scroll,
      imageAnimation, background, supportDuration: support,
      reducedMotion: "stopped", errors, video: videoPath });
    console.log(`${name}: fade, ảnh, nền, hỗ trợ và giảm chuyển động đạt`);
  }
  await writeFile(`${output}/home-motion-results.json`, JSON.stringify(report, null, 2) + "\n");
} finally {
  await browser.close();
}
