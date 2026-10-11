# Kiểm chứng chuyển động trang chủ

Lượt bổ sung ngày 12/10/2026 đối chiếu trực tiếp `https://www.vietjetair.com/vi` trên Chromium. [reference-motion-summary.json](reference-motion-summary.json) lưu cấu hình slider và keyframe đọc từ DOM/CSS công khai. Nhịp hero khoảng 8 giây được đo từ các lần đổi slide; nội dung/cấu hình của website tham chiếu có thể đổi theo chiến dịch.

| Chuyển động | Triển khai local |
|---|---|
| Banner chính | Fade 0,5 giây; tự đổi mỗi 8 giây; dot/vuốt vẫn hoạt động |
| Ảnh nội dung | Fade từ opacity 0 tới 1 trong 1 giây khi tải xong |
| Thanh thông báo | Trượt ngang 0,5 giây, tự đổi mỗi 5 giây, có nút trước/tiếp/đóng |
| Nền mây | Giữ cố định khi cuộn desktop; cuộn thông thường trên tablet/mobile |
| Nút hỗ trợ | Nhấp nhô 10px theo chu kỳ 3 giây |
| Vé khuyến mãi và giải thưởng | Scroll-snap với nút trước/tiếp và phím mũi tên khi có nội dung tràn ngang |
| Giảm chuyển động | Dừng autoplay/fade/nhấp nhô/nền cố định; thao tác thủ công vẫn dùng được |

Timer dừng khi hover, thanh thông báo đóng hoặc component unmount. `useReducedMotion` theo dõi thay đổi cài đặt trong khi trang đang mở. Live region bật khi tạm dừng hoặc giảm chuyển động; không đọc liên tục các lần tự đổi. `ScrollCarousel` dùng scroll trình duyệt và ResizeObserver, dọn listener/observer khi unmount. Tốc độ scroll mượt do trình duyệt điều khiển. Không thêm dependency của ứng dụng.

Kiểm tra đã chạy:

- `npm run build`: đạt.
- `npm run check:i18n`: 525 vị trí dịch, 695 bản dịch tiếng Anh.
- `npm run test:e2e`: **52 ca đạt** trong lượt chạy đầy đủ (2,2 phút), gồm autoplay, đổi cài đặt giảm chuyển động, pause/đóng thông báo, dot/vuốt, điều khiển carousel bằng phím và resize, các luồng nghiệp vụ hiện có.
- `node scripts/verify-home-motion.mjs`: bốn viewport đạt; lấy mẫu từng khung hình để xác nhận opacity trung gian và nhiều vị trí scroll trung gian. [home-motion-results.json](home-motion-results.json) lưu kết quả thực tế.
- `npm run verify:home`: bốn viewport không tràn ngang, ảnh hỏng, link rỗng hay lỗi console/pageerror. [home-checks.json](home-checks.json) và ảnh `home-*-top/full.png` đã cập nhật.

Video chạy trang local với chuyển động bình thường: [laptop 1440×900](home-motion-laptop.webm), [mobile 390×844](home-motion-mobile.webm). Video ghi cả autoplay và chuyển banner thủ công; bản mobile có thao tác trượt vé khuyến mãi.

Nút hỗ trợ vẫn dẫn tới trung tâm hỗ trợ nội bộ. Hình/nội dung demo và danh sách carousel không phải toàn bộ danh mục đang chạy trên website hãng. Lượt này chỉ sửa frontend; kết quả 30 test backend của lượt căn chỉnh trước được giữ riêng trong [home-alignment-results.json](home-alignment-results.json).
