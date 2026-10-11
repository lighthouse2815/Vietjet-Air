# Hoàn thiện sáu nút dịch vụ còn lại

> For agentic workers: use superpowers:executing-plans to implement these tasks sequentially.

**Goal:** Làm các trang Khách sạn, eSIM, eVisa, ngoại tệ, bảo hiểm và SkyJoy theo nguồn công khai; nút nội bộ phải thực hiện nghiệp vụ có lưu dữ liệu.
**Architecture:** Giữ React/Spring/PostgreSQL. Dùng trang dịch vụ chung cho bố cục có thật sự dùng lại, form yêu cầu dùng API hỗ trợ đã có; bảo hiểm dùng catalog và quản lý booking; SkyJoy dùng ví điểm hiện tại. Không thêm dependency/database/API mới.
**Tech Stack:** React 19, React Router, i18next, Lucide, Playwright, Spring Boot.
**Spec:** Các yêu cầu của người dùng trong phiên: làm lần lượt nút khác, giao diện theo web gốc, hoàn thiện nghiệp vụ nội bộ, ghi phần nhà cung cấp để bổ sung sau, commit/push riêng.

## Global Constraints

- Không sửa hai đường dẫn motion chưa được tracking của người dùng.
- Không tạo giá khách sạn, gói eSIM, quyết định visa, tỷ giá hay chứng nhận bảo hiểm giả.
- Giữ route và giao dịch hiện có; dùng ảnh công khai lưu cục bộ và manifest nguồn.
- Các yêu cầu tư vấn là ticket nội bộ; hiển thị rõ việc gửi yêu cầu chưa đặt dịch vụ với đối tác.
- Mỗi phần build, kiểm tra bản dịch, E2E phù hợp, review diff rồi commit tiếng Việt có dấu và push origin/main theo yêu cầu đã có.

## Review Focus

Ngày nhận/trả phòng không hợp lệ; dữ liệu nhập có độ dài giới hạn; draft không bị lẫn giữa các dịch vụ; quay lại trang sau login chỉ cho phép route nội bộ; lỗi API và gửi trùng khi bấm nhanh; booking hết hạn/đã check-in/không thuộc tài khoản; giá bảo hiểm lấy API; ví lỗi/không đủ điểm; animation tuân thủ reduced motion; mobile không tràn ngang; nguồn đối tác và phạm vi giao dịch hiển thị đúng.

### Task 1: Khách sạn

Files: App.jsx, Header.jsx, AuthPage.jsx, pages/PartnerServicePage.jsx, components/services/ServiceRequestForm.jsx, styles/services.css, locales, tests/services.spec.js.
Interfaces: POST /support/tickets {subject,category:OTHER,body}; đăng nhập returnTo allowlist; inquiry draft riêng từng slug trong sessionStorage.
Steps: E2E RED cho form khách sạn → trang riêng với ảnh nghỉ dưỡng, điểm đến/ngày/phòng/khách, FAQ, gửi ticket và theo dõi → GREEN, build/i18n → commit/push.
Expected: yêu cầu có dữ liệu đã chọn tồn tại qua reload và thuộc đúng tài khoản; ngày không hợp lệ không tạo ticket.

### Task 2: eSIM

Files: PartnerServicePage.jsx, locales, tests/services.spec.js, assets/services.
Interfaces: dùng form/ticket Task 1 với điểm đến/thời gian/thiết bị. Không cấp QR.
Steps: RED điều hướng/form → banner SkyFi công khai, hướng dẫn kiểm tra thiết bị và kích hoạt, CTA nguồn → GREEN, build/i18n → commit/push.
Expected: dữ liệu eSIM gửi đúng ticket; không có đơn thanh toán hay mã QR giả.

### Task 3: eVisa

Files: PartnerServicePage.jsx, locales, tests/services.spec.js.
Interfaces: Task 1, quốc tịch/điểm đến/quá cảnh/ngày đi; không thu hộ chiếu.
Steps: RED → bố cục quy định xuất nhập cảnh, form yêu cầu và accordion hướng dẫn, link Sherpa → GREEN, build/i18n → commit/push.
Expected: giữ thông tin yêu cầu, không tuyên bố đủ điều kiện nhập cảnh.

### Task 4: Ngoại tệ

Files: PartnerServicePage.jsx, locales, tests/services.spec.js, assets/services.
Interfaces: Task 1, tiền tệ/số tiền/booking/chi nhánh; tái sử dụng BookingLookupForm để kiểm tra booking nội bộ.
Steps: RED → banner và hướng dẫn gốc, lookup nội bộ, form yêu cầu HDBank rõ phạm vi → GREEN, build/i18n → commit/push.
Expected: lookup thực, ticket lưu nhu cầu; không tạo tỷ giá/biên nhận ngân hàng.

### Task 5: Bảo hiểm

Files: PartnerServicePage.jsx, components/services/InsuranceBooking.jsx, locales, tests/services.spec.js.
Interfaces: GET /ancillary-services, /auth/bookings; route manage?service=id#services và booking token hiện có; BookingLookupForm cho khách.
Steps: RED → banner, catalog giá thật nội bộ, chọn booking đủ điều kiện, chuyển dịch vụ sang luồng quote/thanh toán có sẵn → GREEN, build/i18n → commit/push.
Expected: checkbox bảo hiểm được chọn đúng; backend định giá và lưu mua thêm qua luồng hiện có; provider cấp hợp đồng/bồi thường vẫn backlog.

### Task 6: SkyJoy và xác minh toàn bộ

Files: CommercePage.jsx, components/services/LoyaltyLanding.jsx, styles/services.css, locales, tests/services.spec.js, scripts/verify-services.mjs, docs/verification/SERVICES.md, docs/PROVIDER_BACKLOG.md.
Interfaces: ví/đổi điểm/lịch sử hiện tại; lấy voucher từ redemption hiện có. Tái dùng HeroCarousel/useReducedMotion cho banner nếu phù hợp.
Steps: RED → landing theo SkyJoy công khai, CTA ví/đăng ký, quy tắc nội bộ/hạng/lịch sử/đổi thưởng → GREEN → full E2E và ảnh 4 viewport cho 6 trang, review cuối → commit/push.
Expected: đổi điểm trừ ví, tạo voucher và giữ sau reload; lỗi ví có retry; 6 trang không lỗi console/ảnh/tràn ngang.

## Verification

Mỗi task: npm run build; npm run check:i18n; npx playwright test tests/services.spec.js --project=laptop --grep '<dịch vụ>'.
Cuối: npm run test:e2e; npm run verify:services; git diff --check. Maven không cần chạy lại nếu backend không đổi (31 integration tests đã pass ở phần eVoucher).
