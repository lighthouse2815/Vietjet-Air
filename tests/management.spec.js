import { test, expect } from "@playwright/test";
test("invalid search URLs show recoverable validation errors without crashing", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const query of [
    "origin=SGN&destination=HAN&date=wrong",
    "origin=SGN&destination=HAN&date=2026-02-30",
    `origin=SGN&destination=HAN&date=${tomorrow()}&adults=0`,
    `origin=SGN&destination=HAN&date=${tomorrow()}&adults=1&infants=2`,
    `origin=SGN&destination=HAN&date=${tomorrow()}&adults=1&children=20`,
    `origin=SGN&destination=HAN&date=${tomorrow()}&type=ROUND_TRIP&returnDate=2000-01-01`,
  ]) {
    await page.goto(`/flights?${query}`);
    await expect(page.getByRole("alert")).toContainText(
      "Thông tin tìm kiếm không hợp lệ",
    );
    await expect(
      page.getByRole("link", { name: "Tìm lại chuyến bay", exact: true }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
test("pending booking can resume demo payment after lookup", async ({
  page,
  request,
}) => {
  const flights = await (
    await request.get(
      `/api/flights/search?origin=SGN&destination=CXR&date=${tomorrow()}&passengers=1`,
    )
  ).json();
  const result = await request.post("/api/bookings", {
    data: {
      segments: [
        { flightId: flights[0].id, fareCode: "ECO", seats: [], extras: [] },
      ],
      passengers: [
        {
          type: "ADULT",
          title: "MR",
          lastName: "TEST",
          firstName: "RESUME DEMO",
          dateOfBirth: "1990-01-01",
          nationality: "Việt Nam",
        },
      ],
      contactEmail: "resume@example.com",
      contactPhone: "0901234567",
      promotionCode: "",
    },
  });
  expect(result.status()).toBe(201);
  const booking = await result.json();
  await page.goto("/my-booking");
  await page.getByLabel("Mã đặt chỗ").fill(booking.code);
  await page.getByLabel("Họ", { exact: true }).fill("TEST");
  await page.getByLabel("Tên đệm và tên").fill("RESUME DEMO");
  await page.getByRole("button", { name: "Tra cứu đặt chỗ" }).click();
  await page.getByRole("button", { name: "Tiếp tục thanh toán demo" }).click();
  await page.getByRole("button", { name: "Hủy thanh toán" }).click();
  await expect(page.getByText("Đã hủy", { exact: true }).first()).toBeVisible();
});
test("demo account registration, login and authorization use the backend", async ({
  page,
}) => {
  const email = `demo-${Date.now()}@example.com`;
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Chưa có tài khoản? Đăng ký demo" })
    .click();
  await page.getByLabel("Tên hiển thị").fill("Demo User");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu").fill("DemoPassword123");
  await page.getByRole("button", { name: "Tạo tài khoản demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Xin chào, Demo User" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await page
    .getByRole("button", { name: "Đã có tài khoản? Đăng nhập" })
    .click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu").fill("WrongPassword123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("không đúng");
  await page.getByLabel("Mật khẩu").fill("DemoPassword123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Xin chào, Demo User" }),
  ).toBeVisible();
});
test("invalid lookup shows an error and empty flight search has a usable state", async ({
  page,
}) => {
  await page.goto("/my-booking");
  await page.getByLabel("Mã đặt chỗ").fill("WRONG123");
  await page.getByLabel("Họ", { exact: true }).fill("NGUYEN");
  await page.getByLabel("Tên đệm và tên").fill("DEMO");
  await page.getByRole("button", { name: "Tra cứu đặt chỗ" }).click();
  await expect(page.getByRole("alert")).toContainText("không khớp");
  const date = new Date();
  date.setDate(date.getDate() + 150);
  const d = date.toISOString().slice(0, 10);
  await page.goto(
    `/flights?origin=SGN&destination=HAN&date=${d}&type=ONE_WAY&adults=1`,
  );
  await expect(
    page.getByText("Không có chuyến bay phù hợp.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Tiếp tục" })).toBeDisabled();
});
