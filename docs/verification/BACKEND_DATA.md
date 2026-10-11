# Frontend lấy dữ liệu từ backend

FE không còn dùng mảng dữ liệu trang dịch vụ, banner, FAQ, combo hoặc mệnh giá voucher dựng sẵn trong component. Nội dung đã chuyển vào CMS `content_items.details` trên PostgreSQL (migration V10); giá, tồn kho, booking, đơn hàng, voucher, điểm thưởng và ticket tiếp tục dùng các API nghiệp vụ.

| Dữ liệu | API nguồn |
|---|---|
| Trang chủ, menu, footer, banner, ảnh responsive, liên kết, FAQ, biểu mẫu và nội dung dịch vụ | `/api/home`, `/api/content/pages/{slug}` |
| Số liệu sân bay, đường bay, chuyến bay hôm nay, booking xác nhận và khách hàng | `/api/site-statistics` — truy vấn database, không dùng số minh họa 120+/400+/6000+/100+/7★ |
| Giá, tồn kho và danh mục dịch vụ | `/api/commerce/products`, `/api/ancillary-services` |
| Quy tắc điểm, giới hạn số lượng/mệnh giá, thời hạn đơn/voucher | `/api/commerce/rules` — cùng hằng số backend dùng để xử lý giao dịch |
| Phí đổi/hoàn và thời hạn báo giá | `/api/booking-rules` — cùng chính sách backend dùng để tính tiền |
| Điều kiện được mua thêm | `canPurchaseServices` trong booking do backend xác nhận (check-in, thời gian, trạng thái và hoàn vé) |
| Chỉnh nội dung | API quản trị CMS hiện có và ô cấu hình hiển thị trên trang quản trị |

Không có fallback về catalog cố định khi API lỗi hoặc trả catalog rỗng. Bản nháp giỏ hàng/lựa chọn là dữ liệu do người dùng nhập; luôn kiểm tra lại với danh mục và giới hạn BE. Ảnh và caption tham chiếu do BE quyết định; chỉnh caption trong CMS sẽ trả dữ liệu phù hợp để FE hiển thị nội dung mới.

FE vẫn giữ cấu trúc giao diện, icon, mã trạng thái, route, nhãn thao tác và bản dịch. Đây là phần render/điều khiển UI; không chứa giá, số dư, danh sách dịch vụ hay số đếm nghiệp vụ giả.

Nội dung tham chiếu được khởi tạo trong CMS, có thể sửa ở backend. Các nhà cung cấp chưa tích hợp vẫn ở trạng thái chờ, không tạo tồn phòng, gói eSIM, quyết định visa, tỷ giá hoặc hợp đồng giả; xem [backlog](../PROVIDER_BACKLOG.md).

## Kiểm chứng

- Maven: 36/36 integration tests đạt; có GET nội dung/quy tắc/thống kê, sửa metadata thực trong database, cấu hình ảnh `null` và kiểm tra quyền quản trị.
- Build và kiểm tra bản dịch đạt.
- E2E toàn bộ: 141/141 test đạt trên desktop, laptop, tablet và mobile (6,9 phút).
- Kiểm tra sáu trang dịch vụ trên bốn kích thước màn hình: 24/24 đạt về ảnh, liên kết, anchor, điều hướng, console và tràn ngang.
- E2E mới sửa CMS qua API thật rồi xác nhận tiêu đề, banner và mệnh giá trên FE; đối chiếu số liệu với API database; API lỗi có retry và catalog rỗng không tự bổ sung dữ liệu.
- Kiểm tra ảnh bảo hiểm không cấu hình vẫn dùng được catalog BE, không tự gán ảnh mẫu. Các test sửa CMS khôi phục toàn bộ bản ghi quản trị ban đầu.
- Test đăng ký/đăng nhập chờ một lần khi BE trả HTTP 429; giữ nguyên giới hạn chống lạm dụng và các assertion nghiệp vụ.

Môi trường kiểm chứng dùng FE `http://localhost:5174` và BE `8085`, với `app.frontend-origin=http://localhost:5174`. Cổng 5173 đang được một dự án khác dùng. Backend chạy với heap tối đa 384 MB để hạn chế áp lực bộ nhớ khi chạy trình duyệt.

```bash
npm run build
npm run check:i18n
backend/mvnw -f backend/pom.xml test
PLAYWRIGHT_BASE_URL=http://localhost:5174 npm run test:e2e
PLAYWRIGHT_BASE_URL=http://localhost:5174 VERIFICATION_OUTPUT=/tmp/vietjet-data-visual npm run verify:services
```

Log toàn bộ E2E: [e2e.txt](backend-data/e2e.txt). Kết quả kiểm chứng giao diện: [services-checks.json](backend-data/services-checks.json). Bằng chứng build và BE: [frontend-build.txt](backend-data/frontend-build.txt), [backend-tests.txt](backend-data/backend-tests.txt).

Ảnh đại diện: [khách sạn desktop](backend-data/hotels-desktop.png), [bảo hiểm mobile](backend-data/insurance-mobile.png), [SkyJoy mobile](backend-data/skyjoy-mobile.png).
