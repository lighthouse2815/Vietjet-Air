import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = "docs/verification/evoucher";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { verifiedAt: new Date().toISOString(), url: "http://localhost:5173/services/voucher", reference: "https://evoucher.vietjetair.com/", viewports: [] };
try {
  for (const [name, width, height] of [["desktop", 1920, 1080], ["laptop", 1440, 900], ["tablet", 768, 1024], ["mobile", 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(report.url);
    await page.locator(".evoucher-combos article").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 650) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(100);
    }
    await page.locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
    await page.getByRole("button", { name: "Banner 2", exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1100);
    const checks = await page.evaluate(() => {
      const footer = document.querySelector(".voucher-footer-background .footer-bottom").getBoundingClientRect();
      return {
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.getAttribute("src")),
      brokenLinks: [...document.querySelectorAll("a")].filter(link => !link.getAttribute("href") || link.getAttribute("href") === "#").length,
      headerColor: getComputedStyle(document.querySelector("header")).backgroundColor,
      bannerHeight: document.querySelector(".evoucher-banner").getBoundingClientRect().height,
      catalogHeight: document.querySelector(".evoucher-catalog").getBoundingClientRect().height,
      catalogBackgroundSize: getComputedStyle(document.querySelector(".evoucher-catalog")).backgroundSize,
      transition: getComputedStyle(document.querySelector(".evoucher-banner-track")).transitionDuration,
      combos: document.querySelectorAll(".evoucher-combos article").length,
      denominations: document.querySelectorAll(".evoucher-denominations article").length,
      footerImage: getComputedStyle(document.querySelector(".voucher-footer-background")).backgroundImage,
      footerLeftGutter: footer.left,
      footerRightGutter: innerWidth - footer.right,
    }; });
    assert.equal(checks.horizontalOverflow, false, name);
    assert.deepEqual(checks.brokenImages, [], name);
    assert.equal(checks.brokenLinks, 0, name);
    assert.deepEqual(errors, [], name);
    assert.equal(checks.combos, 8, name);
    assert.equal(checks.denominations, 5, name);
    assert.ok(Math.abs(checks.footerLeftGutter - checks.footerRightGutter) < 1, `${name}: footer căn giữa`);
    await page.screenshot({ path: `${output}/${name}-top.png` });
    await page.screenshot({ path: `${output}/${name}-full.png`, fullPage: true });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reducedTransitionProperty = await page.locator(".evoucher-banner-track").evaluate(node => getComputedStyle(node).transitionProperty);
    assert.equal(reducedTransitionProperty, "none", name);
    report.viewports.push({ name, width, height, ...checks, reducedTransitionProperty, errors });
    await page.close();
    console.log(`${name}: ảnh, liên kết, console, overflow và giảm chuyển động đạt`);
  }
  await writeFile(`${output}/checks.json`, JSON.stringify(report, null, 2) + "\n");
} finally { await browser.close(); }
