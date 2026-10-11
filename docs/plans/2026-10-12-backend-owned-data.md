# Dữ liệu frontend lấy từ backend

Yêu cầu: dữ liệu FE phải lấy BE, không dùng mockdata phía client. Giữ giao diện/luồng hiện có và commit/push từng phần đã kiểm tra.

1. Mở rộng CMS `content_items` bằng `details JSONB`, seed nội dung/ảnh/FAQ/cấu hình các trang hiện có. GET trang theo slug và CRUD quản trị sử dụng database; không thêm dependency.
2. Quy tắc voucher/điểm/giới hạn đơn hàng lấy từ API backend; giá, tồn kho, booking, đơn hàng và số dư tiếp tục dùng API hiện có. Backend xác nhận điều kiện mua thêm, không dựa vào đồng hồ client.
3. FE bỏ mảng dữ liệu dịch vụ/SkyShop/eVoucher/SkyJoy, ảnh mapping và số đếm giả. Nội dung/option/banner từ CMS; số liệu trang chủ truy vấn database. UI giữ nhãn nút, icon, route, bản dịch và trạng thái nhập của người dùng.
4. Kiểm tra đổi dữ liệu CMS làm FE đổi theo; lỗi API/empty không tạo dữ liệu dự phòng; backend validation/permissions; build/bản dịch và các E2E liên quan, commit/push.

Các nội dung tham chiếu được lưu CMS với trạng thái chờ tích hợp. Không tạo tồn phòng/gói eSIM/visa/tỷ giá/hợp đồng nhà cung cấp giả. Các luồng nội bộ vẫn dùng dữ liệu PostgreSQL của project.
