# Báo cáo kiểm chứng

Mốc 11/10/2026, Asia/Ho_Chi_Minh. Chạy trực tiếp trong workspace, PostgreSQL 17 Docker, Java 21.0.12.1, Node 26.9.0/npm 12, Chromium Playwright 1.64.0. Backend Spring Boot 3.5.16 và frontend Vite production build; website local http://localhost:5173, API 8085.

## Kết quả đã chạy

| Kiểm tra | Kết quả / bằng chứng |
|---|---|
| Maven `verify` | 17 test PostgreSQL Testcontainers, 0 failures/errors/skipped; tạo executable JAR |
| Vite `build` | Thành công; trang checkout tải theo route; bundle chính khoảng 354 kB, gzip 117 kB |
| Playwright trên JAR + Vite preview | **19/19 đạt**, bốn viewport, khoảng 1,1 phút |
| Reload checkout/success | Draft còn sau refresh; booking xác nhận đọc lại qua API |
| Restart backend | Booking, snapshot giá, hành khách, dịch vụ, ghế và boarding pass giữ nguyên; lookup vẫn hoạt động; `verification/persistence.json` |
| Trang chủ bốn viewport | Không lỗi page/console, không tràn ngang, không ảnh hỏng, không href trống/`#`; `verification/home-checks.json` |
| Tạo môi trường | Secret ngẫu nhiên, `.env` quyền 0600, không ghi đè file đã tồn tại; `verification/environment.json` |
| Catalog local | 9 sân bay, 2.340 chuyến, 168.480 ghế, 23 content item tại mốc kiểm tra |

Backend test dùng database/container riêng; database local không bị reset. Test trình duyệt tạo dữ liệu hành khách/tài khoản mẫu trong database demo. Không giao dịch với website hãng.

## Phạm vi test backend

17 test kiểm tra giá server và snapshot sau đổi fare, tuyến/ngày sai và empty, payment fail rồi retry/success lặp, lookup tên/token, unpaid check-in và check-in idempotent, hết hạn giải phóng ghế, hai booking đồng thời cùng ghế, hai booking tranh suất cuối, khứ hồi và ancillary tính tiền, limiter lần thứ 16, thiếu query parameter, payload/check-in malformed, tuổi/infant/promotion, hủy payment giải phóng chỗ, ngoài cửa sổ check-in, quyền user/phân trang và phần tử null trong array.

Hai test tranh chấp dùng hai transaction/thread trên PostgreSQL thật, không thay bằng mock. Nghiệp vụ đặt chỗ được kiểm tra tại backend.

## Phạm vi Playwright

- Một chiều: bắt đầu trang chủ, sân bay/lịch → hạng Eco → validation tuổi → hành khách → hành lý/ghế → review → SUCCESS → reload → lookup → check-in/boarding pass. Kiểm tra overflow từng trang và pageerror; trạng thái thanh toán lấy từ backend.
- Khứ hồi: SGN↔DAD, người lớn/trẻ em, Deluxe đi/Eco về, reload draft, payment FAILED rồi SUCCESS.
- Trang chủ: chuyển banner, tìm sân bay không dấu bằng bàn phím, Escape, giới hạn hành khách/infant, dropdown desktop hoặc menu mobile. Chặn kết nối `/api/home` để xác minh lỗi mạng và nút retry phục hồi bằng API thật; không thay response bằng dữ liệu mock.
- Quản lý laptop: tiếp tục payment của booking PENDING sau lookup rồi hủy, register/login sai/đúng qua API, lookup sai, flight empty state.

Booking và hai test trang chủ chạy ở 1920×1080, 1440×900, 768×1024, 390×844; ba test quản lý chạy ở laptop, tổng 19 lượt. 32 screenshot checkout tại `verification/checkout/` (tám bước × bốn viewport), cùng ảnh trang chủ full/top và đối chiếu `desktop-comparison.png`.

## Sai lệch và giới hạn

Đối chiếu header/hero/widget/container/section/footer với snapshot reference đã thu thập, đã sửa kích thước tab, menu và breakpoint. Hero đã có ba ảnh riêng, chiến dịch 12h dùng bố cục người/món ăn bên trái và tiêu đề ở giữa; tablet xếp form dưới banner theo screenshot tham chiếu. Ảnh tạo mới, logo chữ, font tiêu đề thay thế, số slide, section khuyến mại/achievement minh họa và nội dung demo vẫn khác reference. Chưa có metric chứng minh pixel-perfect; không công bố độ giống 100%.

Một số trang/interaction reference chưa xác minh do lazy loading và popup; không vượt hạn chế truy cập. Các dịch vụ đối tác, nhiều chặng, đổi/mua thêm sau booking, email và vé/boarding pass thật nằm ngoài bản demo, được ghi rõ trong README và trang nội dung. Chỉ kiểm thử môi trường local; chưa triển khai hay kiểm chứng production hosting, load test, refund thật hoặc accessibility audit đầy đủ.

Build có cảnh báo comment annotation từ Zod/Rollup và cảnh báo agent của Mockito trên Java 21; các check nêu trên vẫn đạt. Không có cấu hình ESLint/type-check riêng; JavaScript được kiểm tra qua build và browser, không báo đã chạy lint khi chưa có.

## Chạy lại

```bash
./backend/mvnw -f backend/pom.xml verify
npm --prefix frontend run build
npm run test:e2e
npm run verify:home
```

Xem README để khởi động database/backend/frontend và cài Chromium. Kết quả lần chạy sau có thể thay đổi khi môi trường, ngày hoặc dữ liệu mẫu thay đổi; các test chọn ghế còn trống thay vì cố định một ghế đã được dùng.
