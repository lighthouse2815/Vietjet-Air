# Đối chiếu eVoucher

Ngày 12/10/2026, đối chiếu [eVoucher tham chiếu](https://evoucher.vietjetair.com/) bằng Chromium ở 1440×900 và 390×844, rồi triển khai tại `/services/voucher`. Trang nguồn trả HTTP 200 trong trình duyệt. [Metadata và số đo](evoucher/reference.json), [nguồn từng asset](../../frontend/public/assets/evoucher/sources.json).

## Giao diện và nghiệp vụ

- Header đỏ cao 96px trên desktop, 50px khi rút gọn; logo trắng, ngôn ngữ, đăng nhập và bốn mục eVoucher dẫn đến phần mua, nhận, sử dụng và điều kiện nội bộ. Mobile có menu đóng/mở.
- Ba banner đúng artwork nguồn, tỷ lệ 3:1; khung tối đa 1272px, cao 424px ở desktop/laptop và 114px ở mobile 390px. Trượt 0,3 giây mỗi 5 giây, chạy 1→2→3→2→1 theo cấu hình Slick `infinite: false` của nguồn. Có dots/vuốt, giới hạn vuốt ở hai đầu, tạm dừng khi hover/focus, giữ tay vuốt và khi bật giảm chuyển động. Thả tay/hủy cử chỉ khôi phục autoplay theo trạng thái hover/focus. Ảnh có fade khi tải, tắt với giảm chuyển động.
- Nền mây dùng `cover` theo chiều cao khối banner/ưu đãi. Phần mua và tài khoản được đặt sau khối này để nội dung nghiệp vụ thêm vào không phóng lớn nền đầu trang. Footer dùng nền, viền mây và góc đỏ tham chiếu, cùng nội dung/footer component đã có.
- Tám thẻ Combo vé/khách sạn, một ưu đãi chào mừng và hai thẻ Menas dùng ảnh/tên tham chiếu. Xem nhanh hoặc chi tiết mở dialog HTML, đóng bằng Escape/nút/vùng ngoài. Các thẻ ghi rõ chờ nhà cung cấp, chưa có giá/tồn phòng xác nhận hoặc giao dịch đối tác.
- Năm mệnh giá nội bộ: 100.000, 200.000, 500.000, 1.000.000 và 2.000.000đ. Xem nhanh/chọn mệnh giá dẫn đến form; lựa chọn giữ qua reload bằng sessionStorage. Khách chưa đăng nhập vẫn xem catalog và chọn mệnh giá, đăng nhập để tạo đơn.
- Mua cho mình hoặc tặng theo email, tạo đơn giữ 15 phút, thanh toán demo để phát hành; thất bại cho thử lại. Voucher hiệu lực một năm, dùng số dư trong payment booking theo nghiệp vụ hiện có. API xác nhận giá trị, quyền và trạng thái.
- Tra cứu voucher đã mua/nhận theo mã hoặc email, lọc trạng thái, xem số dư/hạn và tải lại sau lỗi mạng. Backend bổ sung `purchased` trong response để giao diện biết người mua; người nhận quà có đường đặt chuyến bay, người mua có nút thanh toán/hủy theo điều kiện. Voucher thưởng hoặc đã dùng không có nút hủy. Liên kết Cửa hàng/Voucher/Điểm thưởng nằm trong phần mua nội bộ.

Không thêm dependency, migration hay adapter nhà cung cấp. Các phần cần tích hợp được ghi tại [PROVIDER_BACKLOG.md](../PROVIDER_BACKLOG.md).

## Kiểm chứng

- `./backend/mvnw -f backend/pom.xml verify`: **31 test, 0 failures/errors/skipped**, tạo executable JAR; [kết quả](evoucher/backend-results.txt). Test mới kiểm tra người mua và người nhận cùng nhìn thấy voucher với `purchased` tương ứng; người nhận hủy trả 403, người mua hủy thành công. Trước khi bổ sung response, test thất bại vì thiếu trường `purchased`.
- `npm run build`: đạt. `npm run check:i18n`: **612 vị trí dịch, 769 bản dịch tiếng Anh**. `git diff --check`: đạt. Project không có cấu hình lint/type-check riêng.
- `npm run test:e2e`: **104/104 đạt**, 3,5 phút; [kết quả từng ca](evoucher/e2e-results.txt). Lượt cuối chạy đầy đủ sau các chỉnh sửa banner, footer, tiếng Anh và khôi phục liên kết thương mại trong phần mua voucher; lượt trước phát hiện thiếu đường từ eVoucher sang ví điểm. Bộ test gồm 76 ca có sẵn và 28 lượt eVoucher mới.
- Bảy ca eVoucher chạy tại bốn viewport: xem nhanh/mệnh giá qua reload, thông tin đối tác/menu điều kiện, người mua thử lại/thanh toán/hủy, mua tặng qua form rồi người nhận tra cứu/lọc, phục hồi lỗi mạng bằng API thật, autoplay đảo chiều/giữ tay vuốt/hủy cử chỉ/giảm chuyển động và tiếng Anh/overflow. Ca giữ tay đã thất bại trước khi sửa vì interval đổi banner trong cử chỉ; ca đảo chiều thất bại vì quay về ảnh đầu. Clock được tạm dừng sau render, chỉ tiến bằng lệnh test để kiểm tra đúng từng nhịp. Test voucher không lưu trace/screenshot phiên đăng nhập.
- `npm run verify:evoucher`: **bốn viewport đạt**, không ảnh hỏng, link rỗng, lỗi console/pageerror hoặc tràn ngang. Kiểm tra banner, gutter trái/phải của footer và `transition-property: none` khi giảm chuyển động; [checks.json](evoucher/checks.json). Ảnh dùng banner hướng dẫn (slide 2) để đối chiếu với ảnh nguồn cùng slide.

Backend test chạy trên PostgreSQL Testcontainers riêng. E2E dùng JAR và Vite preview local, một worker; tạo tài khoản/booking mẫu, thanh toán demo, giữ nguyên dữ liệu local và không gọi giao dịch website nguồn.

| Viewport | Đầu trang | Toàn trang |
|---|---|---|
| 1920×1080 | [Desktop](evoucher/desktop-top.png) | [Desktop đầy đủ](evoucher/desktop-full.png) |
| 1440×900 | [Laptop](evoucher/laptop-top.png) | [Laptop đầy đủ](evoucher/laptop-full.png) |
| 768×1024 | [Tablet](evoucher/tablet-top.png) | [Tablet đầy đủ](evoucher/tablet-full.png) |
| 390×844 | [Mobile](evoucher/mobile-top.png) | [Mobile đầy đủ](evoucher/mobile-full.png) |

Ảnh nguồn: [laptop](evoucher/reference-laptop-top.png), [mobile](evoucher/reference-mobile-top.png).

## Phần còn khác

Thanh thông báo mô phỏng làm nội dung thấp hơn nguồn 50px trên desktop và 35px trên mobile. Form mua/tra cứu/điều kiện nội bộ làm toàn trang dài hơn; thẻ đối tác thay giá/chiết khấu bằng trạng thái chờ tích hợp nên chiều cao khối và vị trí nền còn khác nhẹ. Menu dẫn đến phần nội bộ thay cho các trang/phân mục của hệ thống Vietjet; footer giữ thông tin demo. Không công bố giao diện giống 100%.

Artwork banner có nội dung chương trình nguồn, không phải quyền lợi được phát hành bởi project. Combo, quà Menas, điều kiện thành viên, GO Voucher/voucher Vietjet, email và thanh toán thật cần hệ thống được cấp quyền. Hiện chỉ voucher nội bộ dùng được cho booking của project; các mục tích hợp còn lại được lưu để bổ sung sau.
