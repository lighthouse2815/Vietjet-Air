import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = "docs/verification/skyshop";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { verifiedAt: new Date().toISOString(), url: "http://localhost:5173/services/skyshop", reference: "https://skyshop.vietjetair.com/vi", viewports: [] };
try {
  for (const [name, width, height] of [["desktop", 1920, 1080], ["laptop", 1440, 900], ["tablet", 768, 1024], ["mobile", 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(report.url);
    await page.locator(".skyshop-catalog article").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 650) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(120);
    }
    await page.locator("img").evaluateAll((images) => Promise.all(images.map((image) => image.decode().catch(() => {}))));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1100);
    const checks = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.getAttribute("src")),
      brokenLinks: [...document.querySelectorAll("a")].filter((link) => !link.getAttribute("href") || link.getAttribute("href") === "#").length,
      heroImage: document.querySelector(".skyshop-hero-image").currentSrc,
      catalogCards: document.querySelectorAll(".skyshop-catalog article").length,
      background: getComputedStyle(document.querySelector(".skyshop-page")).backgroundAttachment,
    }));
    assert.equal(checks.horizontalOverflow, false, name);
    assert.deepEqual(checks.brokenImages, [], name);
    assert.equal(checks.brokenLinks, 0, name);
    assert.deepEqual(errors, [], name);
    await page.screenshot({ path: `${output}/${name}-top.png` });
    await page.screenshot({ path: `${output}/${name}-full.png`, fullPage: true });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedBackground = await page.locator(".skyshop-page").evaluate((node) => getComputedStyle(node).backgroundAttachment);
    assert.equal(reducedBackground, "scroll", name);
    report.viewports.push({ name, width, height, ...checks, reducedBackground, errors });
    await page.close();
    console.log(`${name}: ảnh, liên kết, console, overflow và giảm chuyển động đạt`);
  }
  await writeFile(`${output}/checks.json`, JSON.stringify(report, null, 2) + "\n");
} finally {
  await browser.close();
}
