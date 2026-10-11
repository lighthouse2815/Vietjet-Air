# Kế hoạch căn chỉnh trang chủ

Mục tiêu: căn chỉnh giao diện theo ảnh Vietjet trong `docs/reference`, ưu tiên phần đầu trang và các khối trang chủ. Giữ nguyên API, dữ liệu giao dịch và đường dẫn nghiệp vụ.

- [x] Header và hero: logo, icon sản phẩm, vị trí bộ chọn ngôn ngữ, ảnh banner riêng cho desktop/mobile, tỷ lệ ảnh và khung đặt vé. Build, i18n và 16 test trang chủ/đặt vé đã đạt.
- [ ] Nội dung và footer: nền mây, khuyến mãi, banner thông tin, icon tiện ích, banner dịch vụ, điểm đến, FAQ, thống kê và giải thưởng. Kiểm tra cả bốn kích thước màn hình; commit và push riêng.
- [ ] Lưu ảnh kiểm chứng, kiểm tra toàn bộ E2E, cập nhật tài liệu nguồn ảnh và khác biệt còn lại; commit và push.

Quyết định: dùng asset công khai của trang tham chiếu thay cho ảnh minh họa tạo mới để đáp ứng yêu cầu giống giao diện. Lưu nguồn từng asset; ứng dụng tải từ local. Nhãn mô phỏng và nội dung nghiệp vụ demo vẫn hiển thị.

Không chỉnh `docs/reference/motion/` hoặc `scripts/reference-motion-audit.mjs` đang có sẵn ngoài Git. Không thêm dependency. Với thay đổi CSS/ảnh có thể đảo ngược, dùng kiểm tra ảnh và test trình duyệt hiện có; bổ sung test nếu thay đổi hành vi.
