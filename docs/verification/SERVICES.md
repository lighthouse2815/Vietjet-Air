# Khách sạn, eSIM, eVisa, ngoại tệ, bảo hiểm và SkyJoy

Các route `/services/hotels`, `/services/esim`, `/services/visa`, `/services/currency`, `/services/insurance`, `/services/skyjoy` đã thay trang chung bằng giao diện riêng. Điều hướng đánh dấu đúng mục đang mở. Giữ stack và dependency hiện tại; migration V9 bổ sung khóa yêu cầu tùy chọn để chống trùng ticket, không sửa hoặc xóa dữ liệu cũ.

- Khách sạn: ảnh lưu trú từ trang chủ tham chiếu, form điểm đến/ngày/phòng/khách, kiểm tra ngày và lưu ticket.
- eSIM: banner gốc SkyFi, hướng dẫn thiết bị/QR, lưu nhu cầu quốc gia/thời gian/thiết bị; không cấp gói hoặc QR giả.
- eVisa: banner và bố cục quy định xuất nhập cảnh, form quốc tịch/điểm đến/quá cảnh/ngày đi, nguồn Sherpa; không xác nhận quyền nhập cảnh.
- Ngoại tệ: banner và hai ảnh hướng dẫn gốc; tra cứu booking nội bộ thực, kèm mã trong ticket nhu cầu tiền tệ/nơi nhận; không đặt tỷ giá.
- Bảo hiểm: banner gốc; catalog giá API; chọn booking đã xác nhận, chưa check-in/còn hơn một giờ trước khởi hành; chuyển vào quản lý để báo giá và thanh toán mua thêm. Dịch vụ được lưu qua backend hiện có.
- SkyJoy: banner gốc, đổi slide tự động/thủ công, dừng khi tương tác và tuân thủ reduced motion; hạng/số dư/lịch sử ví hiện có; đổi điểm tạo voucher nội bộ.

Các yêu cầu tư vấn giữ bản nháp riêng qua reload/đăng nhập, gửi qua API hỗ trợ và được theo dõi/trao đổi/đóng trong Trung tâm hỗ trợ. Đăng nhập quay lại chỉ chấp nhận sáu route dịch vụ và route hỗ trợ được cho phép. Gửi nhanh hai lần trong lúc chờ chỉ tạo một yêu cầu; lỗi mạng giữ nội dung và khóa yêu cầu để thử lại. Nếu server đã lưu nhưng phản hồi bị mất, gửi lại cùng khóa trả về ticket cũ; cùng khóa với nội dung khác bị từ chối. Khóa được giới hạn theo tài khoản và bảo vệ bằng khóa giao dịch cùng unique index. Mã booking ngoại tệ cũng được giữ qua reload/đăng nhập.

## Nguồn và giới hạn

Đối chiếu công khai ngày 12/10/2026 tại [audit](../reference/services/audit.json), gồm sáu ảnh trang gốc. [Manifest](../../frontend/public/assets/services/sources.json) lưu URL nguồn và kích thước ảnh. Agoda affiliate trả trang 404 tại thời điểm đối chiếu, nên trang nội bộ dùng ảnh/nội dung lưu trú đang có của trang chủ. eSIM/Sherpa trên web gốc dùng iframe đối tác; bản demo có form tư vấn nội bộ cùng link nguồn.

Ảnh là tư liệu tham chiếu giao diện; banner đối tác có thể chứa thông tin quảng bá. Giá và giao dịch nội bộ dùng API của bản demo. Không gọi API đối tác, đăng nhập tài khoản thật, gửi biểu mẫu ngoài hoặc vượt CAPTCHA. Các kết nối còn thiếu được ghi tại [PROVIDER_BACKLOG](../PROVIDER_BACKLOG.md).

## Kiểm tra

- `npm run build`: frontend build thành công.
- `npm run check:i18n`: các vị trí dịch tĩnh và bản dịch mới; E2E còn kiểm tra văn bản động hiển thị của cả sáu trang ở tiếng Anh.
- `tests/services.spec.js` và `tests/services-layout.spec.js`: ticket theo tài khoản, bản nháp và ngày, eSIM/eVisa/ngoại tệ, lookup booking, mua bảo hiểm và lưu sau reload, booking hủy bị chặn, ví/đổi điểm tạo voucher, API retry, gửi trùng, redirect đăng nhập, animation và điều hướng/bản dịch/overflow. Các giao dịch dữ liệu chạy một lần trên laptop; bố cục, bản dịch, điều hướng và chuyển động chạy cả bốn viewport. Fixture tôn trọng giới hạn đăng ký/đăng nhập 15 lần/phút, chờ cửa sổ tiếp theo nếu bị HTTP 429; không sửa hoặc tắt giới hạn của backend.
- `npm run test:e2e`: **131/131 đạt** trên desktop/laptop/tablet/mobile, gồm 27 lượt kiểm tra mới cho các dịch vụ; [log kết quả](services/e2e.txt).
- Sau khi kiểm tra ảnh phát hiện mây thống kê che nút, sửa CSS riêng cho trang dịch vụ và chạy **16/16 kiểm tra bố cục đạt** ở bốn viewport; [log](services/layout-checks.txt). Kiểm tra click dùng `trial: true`, không mở hoặc gửi dữ liệu sang trang đối tác.
- `npm run verify:services`: 24 ảnh full-page (6 route × 1920/1440/768/390), kiểm tra ảnh, anchor, link, nút nhận click, điều hướng, console và tràn ngang tại [checks.json](services/checks.json).

Backend có thêm khóa yêu cầu tùy chọn; đã chạy toàn bộ Maven integration tests: **33/33 đạt** ([summary](services/backend-checks.json)), gồm gửi lại, gửi đồng thời, phân quyền và tương thích request cũ. Không có cấu hình lint/typecheck riêng trong project.
