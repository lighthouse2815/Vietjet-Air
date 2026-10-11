# Kế hoạch hoàn thiện theo đặc tả người dùng

Mục tiêu: website demo độc lập chạy đầu cuối với React/JavaScript/Vite, Java 21/Spring Boot MVC ba tầng và PostgreSQL/Flyway. Tham chiếu giao diện và giới hạn khảo sát nằm trong REFERENCE_AUDIT.md; luồng nghiệp vụ trong USER_FLOWS.md. Người dùng đã yêu cầu triển khai liên tục, không hỏi lại từng bước.

- [x] Khảo sát Playwright, bốn viewport, tài liệu và snapshot; commit/push.
- [x] Nền tảng backend, schema/seed catalog, PostgreSQL, API sân bay; commit/push.
- [x] Trang chủ, header/hero/form/section/footer, asset hợp lệ, responsive và browser/build; commit/push.
- [x] Backend booking: kiểm thử PostgreSQL thật cho giá server, khứ hồi, ghế trùng, sức chứa, hạn giữ, thanh toán lặp, hủy, quyền tra cứu và check-in. Hoàn thiện service/controller đang có, chạy Maven suite, commit/push.
- [x] Frontend checkout: FlightResultsPage → PassengerPage → ExtrasPage → BookingReviewPage → PaymentPage → BookingSuccessPage. Dùng BookingContext/sessionStorage, API quote và token khách. Viết Playwright luồng chưa có trước khi triển khai, chạy fail rồi pass; commit/push.
- [x] Quản lý: MyBookingPage, CheckInPage, AuthPage. Dùng API thật, check-in từng hành khách/chặng, boarding pass DEMO. Kiểm thử trạng thái sai và đúng; commit/push.
- [x] Kiểm chứng cuối: frontend build, backend tests, Playwright one-way/round-trip/payment/lookup/check-in, reload và restart backend, responsive không overflow/console error. README, ERD, API và báo cáo giới hạn; commit/push.

Điểm cần review: payload thiếu/null; seat race ở transaction; giá bị sửa ở client; booking hết hạn và thanh toán lặp; reload/chuyển bước không mất draft. Không xóa dữ liệu khác hoặc thay stack. Chỉ nhập dữ liệu mẫu và chỉ thanh toán giả lập.

Hoàn thành triển khai và kiểm chứng local ngày 11/10/2026: 17 backend tests và 19 lượt Playwright đạt; persistence qua restart đạt. Các giới hạn sản phẩm/reference được ghi rõ trong README và VERIFICATION.md.
