# Đối chiếu SkyShop

Ngày 12/10/2026, kiểm tra [SkyShop tham chiếu](https://skyshop.vietjetair.com/vi) bằng Chromium, rồi triển khai tại `/services/skyshop`. Ảnh và số đo nguồn ở [skyshop/reference.json](skyshop/reference.json); URL từng asset ở [sources.json](../../frontend/public/assets/skyshop/sources.json).

## Giao diện và nghiệp vụ

- Header phủ banner, tab SkyShop đang chọn, thanh tìm kiếm/cách nhận/chuyến bay/đơn hàng/giỏ hàng. Mobile mở tìm kiếm bằng kính lúp.
- Banner desktop cao 600px, mobile cao 375px và dùng ảnh riêng ở chiều rộng ≤767px. Viền mây desktop bắt đầu 72px trước cuối banner; mobile bỏ viền. Nền mây dùng `cover`, phải/trên, cố định; giảm chuyển động chuyển sang cuộn và tắt fade ảnh.
- Dải danh mục, dịch vụ nổi bật, các nhóm sản phẩm với tiêu đề ribbon, nền pastel và ảnh minh họa của bản tham chiếu. Thống kê, giải thưởng và footer dùng lại component hiện có. Không thêm dependency.
- Tìm kiếm/lọc danh mục và cách nhận trên dữ liệu API thật của project; trạng thái tải, lỗi/retry và không tìm thấy có xử lý. Giá, tồn kho và mô tả từ API nội bộ. Mốc kiểm tra có sáu dịch vụ và bốn sản phẩm.
- Chi tiết bằng dialog HTML, đóng được bằng Escape, nút đóng và vùng ngoài. Giỏ hàng lưu trong phiên qua reload, giới hạn theo tồn kho và tối đa 10 mỗi sản phẩm. Đăng nhập vẫn giữ giỏ đã chọn; tạo đơn, giữ hàng 15 phút, thanh toán thử lại, hủy và lịch sử dùng nghiệp vụ nội bộ hiện có.
- Chọn booking của tài khoản đã xác nhận, còn trong tương lai và chưa check-in. Mua thêm mở đúng quản lý booking, chọn sẵn dịch vụ cho hành khách có ghế đầu tiên ở chặng đầu. Người dùng chỉnh người/chặng, báo giá và thanh toán bằng luồng hiện có; thao tác ở cửa hàng chưa mua dịch vụ ngay.
- eSIM và Taxi mở thông báo chờ tích hợp cùng đường dẫn hỗ trợ. Các công việc nhà cung cấp được ghi ở [PROVIDER_BACKLOG.md](../PROVIDER_BACKLOG.md).

## Kiểm chứng

- `npm run build`: đạt. `npm run check:i18n`: **565 vị trí dịch, 721 bản dịch tiếng Anh**. `git diff --check`: đạt. Project không có cấu hình lint/type-check riêng.
- `npm run test:e2e`: **76/76 đạt**, một worker, 2,7 phút. [Kết quả từng ca](skyshop/e2e-results.txt) gồm đặt vé/check-in, quản lý tài khoản, đổi/hoàn vé, voucher/điểm, mua hàng/thanh toán thử lại/hủy và các hồi quy trang chủ.
- Năm ca SkyShop × bốn viewport kiểm tra tìm kiếm/danh mục/cách nhận, giỏ hàng qua reload và giới hạn số lượng, giá API/đóng dialog bằng bàn phím, dịch vụ nhà cung cấp/tiếng Anh/overflow, và chuyển booking với dịch vụ được chọn sẵn. Trước triển khai, bốn ca đầu thất bại vì cửa hàng thiếu các tương tác; ca booking thất bại vì dịch vụ chưa được chọn sẵn.
- Sau chỉnh ribbon và icon tab cuối cùng, chạy lại `npx playwright test tests/skyshop.spec.js`: **20/20 đạt**, 30,3 giây; [kết quả](skyshop/skyshop-results.txt). Không thay đổi logic nghiệp vụ trong lượt chỉnh này.
- `npm run verify:skyshop`: bốn viewport không có ảnh hỏng, link rỗng, lỗi console/pageerror hay tràn ngang; kiểm tra ảnh hero đúng breakpoint và nền chuyển sang cuộn khi giảm chuyển động. [Báo cáo](skyshop/checks.json), ảnh đầu trang/toàn trang ở bảng dưới.
- `npm run verify:home`: bốn viewport đạt kiểm tra ảnh/link/console/overflow sau khi dùng chung thống kê và chỉnh Header/Footer. Ảnh trang chủ không đổi; [home-checks.json](home-checks.json) đã cập nhật mốc kiểm tra.

Test tạo tài khoản/booking mẫu và thanh toán demo trên API local, không gọi giao dịch website tham chiếu. Backend không thay đổi trong lượt này; không tính lại các test backend của đợt trước.

| Viewport | Đầu trang | Toàn trang |
|---|---|---|
| 1920×1080 | [Desktop](skyshop/desktop-top.png) | [Desktop đầy đủ](skyshop/desktop-full.png) |
| 1440×900 | [Laptop](skyshop/laptop-top.png) | [Laptop đầy đủ](skyshop/laptop-full.png) |
| 768×1024 | [Tablet](skyshop/tablet-top.png) | [Tablet đầy đủ](skyshop/tablet-full.png) |
| 390×844 | [Mobile](skyshop/mobile-top.png) | [Mobile đầy đủ](skyshop/mobile-full.png) |

Ảnh gốc để đối chiếu: [laptop](skyshop/reference-laptop-top.png), [mobile](skyshop/reference-mobile-top.png). Ảnh local giữ chuyển động thông thường; screenshot toàn trang của nền cố định có thể khác hình nền khi cuộn trong viewport thực tế.

## Phần còn khác

Nhãn mô phỏng ở trên cùng làm phần banner/nội dung thấp hơn nguồn 50px trên desktop và 35px trên mobile. Header rút gọn ở ≤900px theo project, trong khi ảnh banner dùng breakpoint 767px của SkyShop. Catalog nội bộ có số lượng và tên/giá riêng; không có số lượt bán hay nhãn bán chạy giả. Ảnh món ăn/bảo hiểm là minh họa, chưa xác nhận trùng SKU demo; quà lưu niệm dùng icon có sẵn. Không công bố giao diện giống 100%.

Bảo hiểm demo không phát hành hợp đồng; eSIM, điều phối xe, kho hàng/đơn miễn thuế thật và thanh toán thật cần nhà cung cấp. Những mục này được lưu để triển khai sau theo yêu cầu; không có đơn hay chứng từ nhà cung cấp giả.
