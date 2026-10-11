# Kế hoạch căn chỉnh trang chủ

Mục tiêu: căn chỉnh giao diện theo ảnh Vietjet trong `docs/reference`, ưu tiên phần đầu trang và các khối trang chủ. Giữ nguyên API, dữ liệu giao dịch và đường dẫn nghiệp vụ.

- [x] Header và hero: logo, icon sản phẩm, vị trí bộ chọn ngôn ngữ, ảnh banner riêng cho desktop/mobile, tỷ lệ ảnh và khung đặt vé. Build, i18n và 16 test trang chủ/đặt vé đã đạt.
- [x] Nội dung và footer: đã căn chỉnh nền, ảnh, icon, tỷ lệ, khoảng cách và footer thu gọn trên mobile. 42 test E2E đạt, gồm kiểm tra nội dung CMS tùy chỉnh và mở footer bằng bàn phím.
- [x] Slider đủ chín banner: V8 bổ sung sáu nội dung HERO, ảnh riêng desktop/mobile. PostgreSQL migration và 30 test backend đạt; 42 E2E đạt, gồm chuyển banner 9 và vuốt về banner 1.
- [x] Lưu ảnh kiểm chứng cả bốn viewport, kết quả 30 backend/42 E2E, số đo đối chiếu và nguồn 76 asset. Cập nhật tài liệu và các khác biệt còn lại.

Quyết định: dùng asset công khai của trang tham chiếu thay cho ảnh minh họa tạo mới để đáp ứng yêu cầu giống giao diện. Lưu nguồn từng asset; ứng dụng tải từ local. Nhãn mô phỏng và nội dung nghiệp vụ demo vẫn hiển thị.

Không chỉnh `docs/reference/motion/` hoặc `scripts/reference-motion-audit.mjs` đang có sẵn ngoài Git. Không thêm dependency. Với thay đổi CSS/ảnh có thể đảo ngược, dùng kiểm tra ảnh và test trình duyệt hiện có; bổ sung test nếu thay đổi hành vi.
