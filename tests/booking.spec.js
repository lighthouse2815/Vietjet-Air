import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
async function checkpoint(page, testInfo, name) {
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  if (process.env.CAPTURE_E2E === "1") {
    await mkdir("docs/verification/checkout", { recursive: true });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `docs/verification/checkout/${testInfo.project.name}-${name}.png`,
      fullPage: true,
    });
  }
}
function tomorrow(offset = 1) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
async function availableRoundTrip(request) {
  for (let offset = 1; offset < 30; offset++) {
    const date = tomorrow(offset);
    const returnDate = tomorrow(offset + 1);
    const responses = await Promise.all([
      request.get(
        `/api/flights/search?origin=SGN&destination=DAD&date=${date}&passengers=2`,
      ),
      request.get(
        `/api/flights/search?origin=DAD&destination=SGN&date=${returnDate}&passengers=2`,
      ),
    ]);
    for (const response of responses) expect(response.ok()).toBeTruthy();
    const [outbound, inbound] = await Promise.all(
      responses.map((r) => r.json()),
    );
    if (outbound.length && inbound.length) return { date, returnDate };
  }
  throw new Error(
    "Không có khứ hồi SGN–DAD đủ hai ghế trong 30 ngày demo tới.",
  );
}
async function availableOneWayDate(request) {
  for (let offset = 1; offset < 30; offset++) {
    const date = tomorrow(offset);
    const response = await request.get(
      `/api/flights/search?origin=SGN&destination=HAN&date=${date}&passengers=1`,
    );
    expect(response.ok()).toBeTruthy();
    const flights = await response.json();
    if (!flights.length) continue;
    const seatResponse = await request.get(`/api/flights/${flights[0].id}/seats`);
    expect(seatResponse.ok()).toBeTruthy();
    const seats = await seatResponse.json();
    if (seats.some(seat => seat.status === "AVAILABLE" && !seat.extraLegroom)) return date;
  }
  throw new Error("Không có chuyến SGN–HAN còn ghế thường trong 30 ngày demo tới.");
}
test("one-way checkout persists confirmed booking and allows lookup and check-in", async ({
  page,
  request,
}, testInfo) => {
  const date = await availableOneWayDate(request);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByLabel("Một chiều", { exact: true }).first().check();
  await page
    .getByRole("button", { name: "Điểm khởi hành", exact: true })
    .first()
    .click();
  await page.locator(".airport-popup").getByRole("combobox").fill("sgn");
  await page.locator(".airport-popup").getByRole("option").first().click();
  await page
    .getByRole("button", { name: "Điểm đến", exact: true })
    .first()
    .click();
  await page.locator(".airport-popup").getByRole("combobox").fill("han");
  await page.locator(".airport-popup").getByRole("option").first().click();
  await page
    .getByRole("button", { name: "Ngày đi", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: `Ngày đi ${date}`, exact: true })
    .click();
  await page
    .getByRole("button", { name: "Tìm chuyến bay", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Chọn chuyến bay" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Chọn Eco/ })
    .first()
    .click();
  await checkpoint(page, testInfo, "flights");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page).toHaveURL(/booking\/passengers/);
  await page.getByLabel("Họ", { exact: true }).fill("NGUYEN");
  await page.getByLabel("Tên đệm và tên").fill("VAN DEMO");
  await page.getByLabel("Ngày sinh").fill("1990-01-01");
  await checkpoint(page, testInfo, "passengers");
  await page.getByLabel("Email liên hệ").fill("demo@example.com");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await page
    .getByLabel("Ngày sinh")
    .fill(`${new Date().getFullYear() - 5}-01-01`);
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(
    page.getByText("Ngày sinh không phù hợp:", { exact: false }),
  ).toBeVisible();
  await expect(page).toHaveURL(/booking\/passengers/);
  await page.getByLabel("Ngày sinh").fill("1990-01-01");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page).toHaveURL(/booking\/extras/);
  await page.getByLabel("Hành lý ký gửi 20 kg").check();
  await page
    .locator(".seat-map .seat:not([disabled]):not(.special)")
    .first()
    .click();
  await expect(page.locator(".price-summary .total")).toBeVisible();
  await checkpoint(page, testInfo, "extras");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page).toHaveURL(/booking\/review/);
  await expect(
    page.getByText("NGUYEN VAN DEMO", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Hành lý ký gửi 20 kg", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".price-summary .total")).toBeVisible();
  await checkpoint(page, testInfo, "review");
  await page
    .getByRole("button", { name: "Đặt chỗ và thanh toán demo" })
    .click();
  await expect(page).toHaveURL(/booking\/payment/);
  await expect(
    page.getByRole("heading", { name: "Thanh toán demo", exact: true }),
  ).toBeVisible();
  await checkpoint(page, testInfo, "payment");
  await page.getByRole("button", { name: "Thanh toán thành công" }).click();
  await expect(page).toHaveURL(/booking\/success/);
  const code = await page.getByTestId("booking-code").innerText();
  await page.reload();
  await expect(page.getByTestId("booking-code")).toHaveText(code);
  await expect(
    page.getByText("Đã xác nhận", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Thanh toán demo: Thành công", { exact: true }),
  ).toBeVisible();
  await checkpoint(page, testInfo, "success");
  await page.goto("/my-booking");
  await page.getByLabel("Mã đặt chỗ").fill(code);
  await page.getByLabel("Họ", { exact: true }).fill("NGUYEN");
  await page.getByLabel("Tên đệm và tên").fill("VAN DEMO");
  await page.getByRole("button", { name: "Tra cứu đặt chỗ" }).click();
  await expect(page.getByTestId("booking-code")).toHaveText(code);
  await checkpoint(page, testInfo, "my-booking");
  await page.goto("/check-in");
  await page.getByLabel("Mã đặt chỗ").fill(code);
  await page.getByLabel("Họ", { exact: true }).fill("NGUYEN");
  await page.getByLabel("Tên đệm và tên").fill("VAN DEMO");
  await page.getByRole("button", { name: "Tra cứu đặt chỗ" }).click();
  await page.getByLabel("Tôi đồng ý điều kiện check-in demo").check();
  await page.getByRole("button", { name: "Hoàn tất check-in" }).click();
  await expect(page.getByText("BOARDING PASS · DEMO")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Tải boarding pass demo", exact: true }).first().click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^boarding-pass-.*\.txt$/);
  const boardingText = await readFile(await download.path(), "utf8");
  expect(boardingText).toContain("NGUYEN VAN DEMO");
  expect(boardingText).toContain("DEMO");
  await checkpoint(page, testInfo, "check-in");
  expect(errors).toEqual([]);
});
test("round-trip search selects both segments and preserves draft on reload", async ({
  page,
  request,
}) => {
  const { date, returnDate } = await availableRoundTrip(request);
  await page.goto(
    `/flights?origin=SGN&destination=DAD&date=${date}&returnDate=${returnDate}&type=ROUND_TRIP&adults=1&children=1&infants=0`,
  );
  await page
    .getByRole("button", { name: /Chọn Deluxe/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Chọn Eco/ })
    .last()
    .click();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByLabel("Họ", { exact: true }).first().fill("TRAN");
  await page.getByLabel("Tên đệm và tên").first().fill("DEMO");
  await page.getByLabel("Ngày sinh").first().fill("1990-01-01");
  await page.getByLabel("Họ", { exact: true }).last().fill("TRAN");
  await page.getByLabel("Tên đệm và tên").last().fill("BE DEMO");
  await page
    .getByLabel("Ngày sinh")
    .last()
    .fill(`${new Date().getFullYear() - 5}-01-01`);
  await page.getByLabel("Email liên hệ").fill("roundtrip@example.com");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Dịch vụ bổ sung" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(
    page.getByText("TRAN BE DEMO", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Đặt chỗ và thanh toán demo" })
    .click();
  await page.getByRole("button", { name: "Thanh toán thất bại" }).click();
  await expect(page.getByRole("alert")).toContainText("thất bại");
  await page.getByRole("button", { name: "Thanh toán thành công" }).click();
  await expect(page).toHaveURL(/booking\/success/);
});
