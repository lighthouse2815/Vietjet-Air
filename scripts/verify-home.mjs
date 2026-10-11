import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const browser = await chromium.launch();
const report = {
  verifiedAt: new Date().toISOString(),
  url: "http://localhost:5173",
  viewports: [],
};
await mkdir("docs/verification", { recursive: true });
try {
  for (const [name, width, height] of [
    ["desktop", 1920, 1080],
    ["laptop", 1440, 900],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(report.url);
    await page.locator(".hero-copy h1").waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (
      let y = 0;
      y < (await page.evaluate(() => document.body.scrollHeight));
      y += 650
    ) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page
      .locator("img")
      .evaluateAll((images) =>
        Promise.all(images.map((image) => image.decode().catch(() => {}))),
      );
    const checks = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
      brokenLinks: [...document.querySelectorAll("a")].filter(
        (a) => !a.getAttribute("href") || a.getAttribute("href") === "#",
      ).length,
        documentHeight: document.body.scrollHeight,
    }));
    assert.equal(checks.horizontalOverflow, false, name);
    assert.deepEqual(checks.brokenImages, [], name);
    assert.equal(checks.brokenLinks, 0, name);
    assert.deepEqual(errors, [], name);
    await page.screenshot({ path: `docs/verification/home-${name}-top.png` });
    await page.screenshot({
      path: `docs/verification/home-${name}-full.png`,
      fullPage: true,
    });
    report.viewports.push({ name, width, height, ...checks, errors });
    await page.close();
    console.log(`${name}: ảnh/console/overflow/link hợp lệ`);
  }
  await writeFile(
    "docs/verification/home-checks.json",
    JSON.stringify(report, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
