# Kiểm chứng trang chủ

Ngày 11/10/2026, Playwright Chromium truy cập `http://localhost:5173`, backend thật tại 8085 và PostgreSQL Docker tại 5438.

Đã chụp toàn chiều dài và vùng đầu ở 1920×1080, 1440×900, 768×1024, 390×844. `home-checks.json` ghi nhận từng viewport: không pageerror, không tràn ngang, không ảnh hỏng. Đã thao tác sân bay SGN/HAN và lịch hai tháng, 61 ngày của tháng 10/11. Đã build Vite thành công.

`desktop-comparison.png`: reference bên trái, local bên phải, cùng viewport. Đối chiếu trực quan đã dẫn tới sửa chiều cao tab form từ 69px xuống 52px, tăng icon/kích thước menu, giữ form rộng 380px và vị trí theo breakpoint desktop. Container 1200px và thứ tự section bám khảo sát.

Khác biệt còn lại: banner tạo mới, logo chữ/font Jambono thay thế, nền mây/section khuyến mại không dùng ảnh độc quyền của hãng, nội dung demo, ba banner thay vì chín, footer giới thiệu demo. Mobile giữ bộ chọn hành khách/mã khuyến mại để hoàn tất nghiệp vụ dù snapshot tham chiếu thu gọn các trường này. Không tuyên bố pixel-perfect tuyệt đối hoặc độ giống 100%.
