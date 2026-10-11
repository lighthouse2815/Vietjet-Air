import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const output = process.env.VERIFICATION_OUTPUT || "docs/verification/services";
const slugs = ["hotels", "esim", "visa", "currency", "insurance", "skyjoy"];
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { verifiedAt: new Date().toISOString(), baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173", pages: [] };
try {
  for (const [name, width, height] of [["desktop", 1920, 1080], ["laptop", 1440, 900], ["tablet", 768, 1024], ["mobile", 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    for (const slug of slugs) {
      const errors = [];
      const onError = error => errors.push(error.message);
      const onConsole = message => { if (message.type() === "error") errors.push(message.text()); };
      page.on("pageerror", onError); page.on("console", onConsole);
      await page.goto(`${report.baseURL}/services/${slug}`);
      await page.locator("main h1").waitFor();
      if (slug === "insurance") await page.locator(".service-insurance-products article").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const providerActions = page.locator(".service-provider .button");
      for (const action of await providerActions.all()) await action.click({ trial: true, timeout: 3000 });
      await page.locator("img").evaluateAll(images => images.forEach(image => { image.loading = "eager"; }));
      await page.locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
      for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 850) {
        await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(60);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const checks = await page.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.getAttribute("src")),
        brokenLinks: [...document.querySelectorAll("a")].filter(link => !link.getAttribute("href") || link.getAttribute("href") === "#").map(link => link.textContent),
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash),
        activeNavigation: document.querySelector('.product-nav [aria-current="page"]')?.getAttribute("href"),
        heading: document.querySelector("main h1").textContent,
      }));
      const label = `${slug}/${name}`;
      assert.equal(checks.horizontalOverflow, false, label);
      assert.deepEqual(checks.brokenImages, [], label); assert.deepEqual(checks.brokenLinks, [], label); assert.deepEqual(checks.brokenAnchors, [], label);
      assert.equal(checks.activeNavigation, `/services/${slug}`, label); assert.deepEqual(errors, [], label);
      await page.screenshot({ path: `${output}/${slug}-${name}.png`, fullPage: true });
      report.pages.push({ slug, viewport: name, width, height, ...checks, actionableProviderLinks: await providerActions.count(), errors });
      page.off("pageerror", onError); page.off("console", onConsole);
      console.log(`${label}: ảnh, liên kết, điều hướng, console và overflow đạt`);
    }
    await page.close();
  }
  await writeFile(`${output}/checks.json`, JSON.stringify(report, null, 2) + "\n");
} finally { await browser.close(); }
