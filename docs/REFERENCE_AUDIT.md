# Khảo sát Vietjet Air

Mốc khảo sát: 11/10/2026, múi giờ Asia/Ho_Chi_Minh. URL: https://www.vietjetair.com/vi. Công cụ: Playwright 1.64.0, Chromium headless. Đây là khảo sát giao diện công khai; không lấy source JavaScript, không gọi trực tiếp API nội bộ, không gửi booking lên hãng.

## Bằng chứng

- `reference/{desktop,laptop,tablet,mobile}-initial.png`: trạng thái truy cập đầu tiên, popup/cookie khi xuất hiện.
- `reference/{desktop,laptop,tablet,mobile}-top.png`: vùng đầu trang sau thao tác đóng thông báo.
- `reference/{desktop,laptop,tablet,mobile}-full.png`: chụp toàn chiều dài sau cuộn để kích hoạt lazy loading.
- `reference/interaction-*.png`: dropdown sân bay, lịch, hành khách khi thao tác thành công.
- `reference/audit.json`: thời điểm, viewport, văn bản DOM công khai, vị trí, computed font/màu/kích thước, URL liên kết và lỗi thao tác.
- `scripts/reference-audit.mjs`: quy trình có thể chạy lại. DOM HTML tạm được ignore, không sao chép mã ứng dụng của hãng vào sản phẩm.

Viewport: desktop 1920×1080; laptop 1440×900; tablet 768×1024; mobile 390×844.

## Cấu trúc quan sát được

1. Thanh thông báo trắng, desktop cao 50px, icon chuông đỏ, điều hướng và đóng ở bên phải.
2. Header chồng lên banner, nền xanh/xám trong suốt. Container desktop khoảng 1200px; logo tại x=120 ở viewport 1440. Logo rộng 265px, cao khoảng 46px. Hàng trên có hỗ trợ, tài khoản, ngôn ngữ. Hàng dưới có chuyến bay của tôi, online check-in, dịch vụ chuyến bay, dịch vụ khác.
3. Thanh sản phẩm: Đặt vé → Skyshop → Khách sạn → E-Voucher → E-Sim → E-Visa → Mua ngoại tệ → Bảo hiểm → SkyJoy. Menu dùng icon nhỏ, mục đặt vé màu vàng và gạch dưới.
4. Hero là carousel nhiều banner (9 dot tại thời điểm khảo sát). Hình quảng cáo và nội dung đổi theo thời gian; snapshot desktop-full là chiến dịch 12h, laptop-top từng ghi được chiến dịch kết nối bầu trời. Không coi banner theo ngày là dữ liệu bất biến.
5. Form đặt vé bên phải: viewport 1440 có x≈940, rộng 380px, y≈214; viewport 1920 có x≈1180, y≈334. Ba tab phía trên, nền đỏ trong suốt, chữ trắng. Tab phụ SkyPoint vàng. Khứ hồi/một chiều/nhiều chặng và VND trên cùng hàng. Hai hàng sân bay/ngày, ô hành khách, mã khuyến mại, checkbox tìm vé rẻ nhất, nút vàng. Ô trắng cao khoảng 48px, radius 10px, cách nhau khoảng 11px. Nút rộng 200px, cao 40px. Có nút đổi chiều nằm giữa hai ô sân bay.
6. Đường viền mây chuyển vào khu vực giá khuyến mại; giá trong huy hiệu vàng, carousel hành trình; nền du lịch/xe mui trần ở snapshot.
7. Widget ngang phía dưới và dải banner thông tin. Sáu quick access: đặt chuyến bay, dịch vụ bổ sung, ưu tiên thủ tục, hàng miễn thuế, bảo hiểm, e-Voucher.
8. Banner Tận hưởng chuyến bay/SkyJoy; ba card Bảo hiểm, Gửi hàng nhanh, Bay cùng thẻ HDBank Vietjet.
9. Banner Mua sắm, giải trí trên mây; ba card Khách sạn, Du lịch trọn gói, Săn vé giá rẻ.
10. Điểm đến hấp dẫn: lưới 3×2 desktop. Quảng Bình, Gia Lai, Nghệ An, Hà Nội, TP.HCM, Phú Quốc.
11. Câu hỏi thường gặp: sáu ô vàng theo chủ đề.
12. Banner truyền thông và số liệu, huy hiệu thành tựu, footer nhiều cột có nền mây, social/app links.

## Design tokens đo được

- Font nội dung: `KoHo`, sans-serif; tiêu đề/nút quảng cáo: `JambonoMedium`/`jambono-medium`.
- Nội dung thường 16px, tiêu đề card 18px, tiêu đề banner 24px. Tiêu đề banner ribbon cao 42px tại desktop.
- Container 1200px; ba cột dịch vụ có bước x≈410px, gap khoảng 30px. Sáu điểm đến có nhịp tương ứng.
- Màu chủ đạo: đỏ, vàng, trắng, nền trời xanh. Màu computed chi tiết nằm trong JSON. Sản phẩm sẽ dùng biến CSS và KoHo (Google Fonts, SIL OFL), font thay thế cho Jambono chưa có giấy phép.
- Chuyển slide được quan sát tự động. Không đo chắc chắn easing/duration nội bộ, không khẳng định autoplay pause-on-hover đã xác minh.

## Responsive và tương tác

- Mobile có header nhỏ, hamburger, ngôn ngữ rút gọn; thanh sản phẩm desktop ẩn. Banner nằm trên form, form chiếm toàn chiều ngang. Hàng sân bay/ngày vẫn chia đôi. Ở snapshot mobile, các ô hành khách/mã khuyến mại không hiển thị như desktop. Có navigation cố định dưới màn hình gồm đặt vé, chuyến bay của tôi, mua dịch vụ, check-in.
- Đối chiếu bổ sung `tablet-top.png`: tại 768px, thanh thông báo khoảng 35px, header khoảng 40px; form bắt đầu ở y≈696 dưới banner, không nằm bên phải. Bản demo dùng cùng cấu trúc xếp dọc cho tablet/mobile, giữ ô hành khách/mã khuyến mại để thao tác đủ nghiệp vụ.
- Popup cookie phủ tối và khóa scroll; nút từ chối hoạt động. Popup ưu đãi nằm trong iframe; đóng qua nút Để sau của iframe. Không đăng ký nhận thông báo.
- Dropdown sân bay, lịch ngày đi, bộ đếm người lớn/trẻ em/em bé đã quan sát qua browser. Lịch có giá; bản demo chỉ hiển thị giá khi API có dữ liệu.
- Có robot/chat nổi. Demo thay bằng nút hỗ trợ dẫn tới nội dung nội bộ, không tích hợp chatbot hãng.

## Giới hạn và quyết định

- Lazy loading không ổn định: một số lượt chụp laptop chỉ tải được vùng đầu trong thời gian chờ; desktop-full có nội dung đầy đủ là mốc cấu trúc chính. Không xem vùng trắng trong ảnh lỗi tải là layout cần sao chép.
- Một số click bằng label bị input intercept hoặc popup trước đó còn mở. Lỗi giữ nguyên trong JSON; không khẳng định mọi menu, bàn phím, lịch giá, sticky behavior hay trang sau thanh toán của hãng đã được kiểm tra.
- Không thực hiện giao dịch thật, không thử đăng nhập hãng và không vượt reCAPTCHA.
- Chưa xác minh quyền tái sử dụng banner, ảnh, mascot và Jambono của hãng. Không đưa chúng vào frontend. Banner sẽ là ảnh tạo mới theo cùng bố cục; card dùng ảnh có giấy phép hoặc asset tạo mới. Logo là chữ dựng bằng CSS kèm nhãn mô phỏng, không dùng SVG gốc.
- Bản demo giữ bố cục và thứ tự quan sát được, nhưng nội dung khuyến mại, giá, quy tắc check-in và quyền lợi hạng vé đều là dữ liệu demo. Nhãn độc lập hiển thị thường xuyên.
- Chỉ VND cho giao dịch demo; ngôn ngữ và sản phẩm ngoài phạm vi có trang thông tin rõ ràng. Nhiều chặng được đánh dấu chưa hỗ trợ trong demo, không tạo luồng giả.

## Thứ tự triển khai

Nền tảng → header/hero → booking widget → section/footer/responsive → API tìm chuyến → booking/hạng vé/hành khách/dịch vụ/thanh toán → quản lý/check-in → kiểm thử PostgreSQL, Playwright, đối chiếu screenshot. Báo cáo cuối phải phân biệt kiểm chứng thực tế với giới hạn độ giống hình ảnh.
