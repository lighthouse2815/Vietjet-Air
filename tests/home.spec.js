import { test, expect } from "@playwright/test";

test("homepage carousel, airport keyboard navigation and passenger limits work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const heading = page.locator(".hero-copy h1");
  await expect(heading).toBeVisible();
  const firstTitle = await heading.innerText();
  await page.getByRole("button", { name: "Banner 2", exact: true }).click();
  await expect(heading).not.toHaveText(firstTitle);
  await expect(
    page.getByRole("button", { name: "Banner 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const origin = page
    .getByRole("button", { name: "Điểm khởi hành", exact: true })
    .first();
  await origin.click();
  await page.getByRole("combobox").fill("ha noi");
  await expect(page.getByRole("option")).toContainText("HAN");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("combobox")).not.toBeVisible();
  await origin.click();
  await page.getByRole("combobox").fill("ha noi");
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
