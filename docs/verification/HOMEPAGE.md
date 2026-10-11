# Kiểm chứng trang chủ sau căn chỉnh

Ngày 11/10/2026, Chromium kiểm tra Vite preview tại `http://localhost:5173`, Spring Boot tại 8085 và PostgreSQL local tại 5438. Kết quả mới nằm trong [home-alignment-results.json](home-alignment-results.json) và [home-checks.json](home-checks.json).

Lượt bổ sung animation ngày 12/10/2026: build, 525 vị trí dịch và **52 E2E** đạt. Fade banner/ảnh, thanh thông báo trượt, nền mây khi cuộn, nút hỗ trợ nhấp nhô và điều khiển các dải cuộn đã được kiểm chứng qua khung hình/video. Xem [MOTION.md](MOTION.md) để xem video, thông số và lệnh chạy lại; các số 30/42 bên dưới là kết quả của lượt căn chỉnh trước.

Lượt sửa nền tiếp theo ngày 12/10/2026: build, kiểm tra bản dịch và **56 E2E** đạt. Đã nối nền mây đến FAQ, bổ sung đúng nền thống kê desktop/mobile, giữ tỷ lệ viền mây và dùng chung nền cho giải thưởng/footer. Xem [BACKGROUNDS.md](BACKGROUNDS.md) và [home-background-results.json](home-background-results.json) để đối chiếu CSS với trang gốc.

Trang chủ hiện dùng logo/font tiêu đề, chín banner với ảnh desktop/mobile, nền mây, ảnh khuyến mãi, sáu icon tiện ích, banner SkyJoy/mua sắm, ảnh dịch vụ/điểm đến, FAQ và giải thưởng từ bản tham chiếu. Nguồn 78 file nằm trong [sources.json](../../frontend/public/assets/reference/sources.json); asset được phục vụ từ local. V8 thêm sáu bản ghi HERO vào bảng nội dung hiện có, vẫn chỉnh được trong ADMIN.

Các lệnh xác minh:

- `./backend/mvnw -f backend/pom.xml verify`: 30 test, không lỗi/thất bại/bỏ qua; migration V8 chạy trên PostgreSQL Testcontainers độc lập.
- `npm run build`: đạt. `npm run check:i18n`: 522 vị trí dịch, 692 bản dịch tiếng Anh. Không thêm dependency của ứng dụng.
- `npm run test:e2e`: 42 ca đạt trong một lượt hoàn chỉnh, gồm chín banner/vuốt từ banner cuối về đầu, caption CMS tùy chỉnh, footer mobile qua bàn phím và resize, đặt vé/check-in, quản lý, tài khoản, thương mại và quản trị.
- `npm run verify:home`: desktop 1920×1080, laptop 1440×900, tablet 768×1024, mobile 390×844 đều không ảnh hỏng, link rỗng, lỗi console/pageerror hay tràn ngang. Ảnh được chụp sau khi cuộn và tải xong ảnh lazy.

Đối chiếu tọa độ Y tại viewport 1920px, theo `docs/reference/audit.json` và số đo DOM local; đơn vị px:

| Khối | Tham chiếu | Local |
|---|---:|---:|
| Khung đặt vé | 334 | 334 |
| Đặt vé ngang | 1480,016 | 1480 |
| Banner thông tin | 1719,016 | 1718,484 |
| Icon tiện ích | 2070,531 | 2070,984 |
| SkyJoy | 2321,531 | 2320,578 |
| Mua sắm | 3040,844 | 3040,578 |
| Điểm đến | 3570,875 | 3570,578 |
| Các ô FAQ | 4118,375 | 4118,078 |

Container rộng 1200px, khung đặt vé rộng 380px. Sai lệch dưới 1px trong bảng là tọa độ của các khối đã đo, không phải phần trăm giống ảnh của toàn trang.

Ảnh mới: [desktop đầy đủ](home-desktop-full.png), [laptop đầy đủ](home-laptop-full.png), [tablet đầy đủ](home-tablet-full.png), [mobile đầy đủ](home-mobile-full.png); các file `home-*-top.png` ghi vùng đầu trang. `desktop-comparison.png` và ảnh checkout cũ là bằng chứng của lượt triển khai trước.

Khác biệt còn lại: nhãn mô phỏng, giá/nội dung giao dịch từ API demo, chú thích số liệu, nội dung footer và nút hỗ trợ nội bộ thay chatbot hãng. Mobile giữ hành khách/mã khuyến mại để dùng đủ nghiệp vụ. Chữ bên trong poster tham chiếu vẫn là tiếng Việt khi chuyển giao diện sang tiếng Anh. Không công bố độ giống 100% hoặc xác minh hosting production.
