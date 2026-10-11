# Đối chiếu nền trang chủ

Ngày 12/10/2026, đối chiếu các lớp nền trên [trang tham chiếu](https://www.vietjetair.com/vi) với Chromium ở 1920×1080, 1440×900, 768×1024 và 390×844. Số đo và CSS của cả hai bên nằm trong [home-background-results.json](home-background-results.json); nguồn ảnh nằm trong [sources.json](../../frontend/public/assets/reference/sources.json).

Các nguyên nhân lệch đã sửa:

- Nền mây kết thúc sau các card dịch vụ, khiến mua sắm, du lịch, điểm đến và FAQ nằm trên nền trắng. Các khối này nay dùng chung nền mây; desktop giữ nền cố định khi cuộn, mobile dùng nền cuộn theo trang.
- Thống kê dùng nhầm nền footer/sky. Đã dùng đúng `bg-donate.40a2c077.webp` trên desktop và `bay_vao_tuong_lai_bg_mb.9d307f6a.webp` ở viewport ≤900px. Phần trong suốt trên desktop chồng lên nền mây theo chiều rộng màn hình.
- Viền mây phía dưới thống kê bị ép toàn bộ ảnh vào một dải thấp. Nay ảnh giữ tỷ lệ và cắt phần đầu, với chiều rộng 102%, chiều cao dải 6vw; mobile bỏ viền này theo bản tham chiếu.
- Giải thưởng và footer trước đây có hai vùng nền tách biệt. Nay dùng chung một vùng nền. Mobile dùng `sky-bg.42123689.webp`, căn giữa từ Y=200px, cùng họa tiết góc phải rộng 200px; desktop dùng `bg_footer.2f611c1f.webp` và họa tiết 300px.
- Nền khuyến mãi mobile dùng `cover`, làm phóng lớn hình mây. Nay giữ kích thước tự nhiên và lặp ngang như bản tham chiếu.

| Lớp nền | Desktop | Tablet/mobile |
|---|---|---|
| Khuyến mãi | `cover`, giữa/trên, không lặp | `auto`, giữa/trên, lặp ngang |
| Mây nội dung | `cover`, phải/trên, cố định | `cover`, giữa/trên, cuộn |
| Thống kê | `cover`, giữa/trên | `auto`, giữa/trên |
| Giải thưởng và footer | Họa tiết 300px; nền `cover` giữa/trên | Họa tiết 200px; nền `cover` giữa/200px |

Không thêm dependency. Ảnh giải thưởng vẫn fade sau khi tải; cài đặt giảm chuyển động vẫn tắt fade và chuyển nền desktop sang cuộn. Nội dung demo và chiều cao một số khối vẫn khác bản tham chiếu; đây là kiểm chứng lớp nền, không phải đánh giá toàn trang giống 100%.

Kiểm tra ngày 12/10/2026:

- `npm run build`: đạt. `npm run check:i18n`: 525 vị trí dịch, 695 bản dịch tiếng Anh.
- `npm run test:e2e`: **56/56 đạt**, gồm bốn lượt của ca hồi quy nền trên các viewport. Ca này kiểm tra nền liên tục đến FAQ, giải thưởng dùng chung nền footer, phần chồng nền desktop và ảnh đúng tại breakpoint tablet/mobile. Trước khi sửa, ca này thất bại vì các khối dưới nằm ngoài nền mây.
- Hai ảnh nền thống kê local trùng SHA-256 với file tải trực tiếp từ URL nguồn; desktop 25.868 byte, mobile 20.706 byte.
- `npm run verify:home`: cả bốn viewport không có ảnh hỏng, link rỗng, lỗi console/pageerror hay tràn ngang. Đã cập nhật tám ảnh đầu trang/toàn trang và [home-checks.json](home-checks.json).
- `node scripts/verify-home-motion.mjs`: cả bốn viewport đạt kiểm tra khung hình fade/cuộn và giảm chuyển động. Video laptop/mobile đã được ghi lại với các lớp nền mới; xem [MOTION.md](MOTION.md).

Ảnh chụp với chuyển động thông thường: [nền desktop và đoạn nối footer](home-background-laptop.png), [nền mobile](home-background-mobile.png). Các ảnh toàn trang trong [HOMEPAGE.md](HOMEPAGE.md) được chụp với cài đặt giảm chuyển động, nên nền desktop cuộn theo trang.
