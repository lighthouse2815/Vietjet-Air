# Luồng người dùng và giới hạn demo

## Đặt vé

Trang chủ → chọn sân bay/ngày/hành khách → `/flights` → chọn Eco/Deluxe/SkyBoss/Business cho một hoặc hai chặng → `/booking/passengers` → `/booking/extras` → `/booking/review` → tạo booking bằng API (backend tính lại tiền và giữ chỗ 15 phút) → `/booking/payment` → mô phỏng thành công/thất bại/hủy → `/booking/success/:bookingCode`.

Draft lưu sessionStorage để reload và chuyển bước không mất dữ liệu. Booking thật được lưu PostgreSQL; access token của khách là capability ngẫu nhiên, không đọc thông tin booking chỉ bằng mã đặt chỗ. Frontend không gửi giá làm nguồn quyết định. Ghế chọn được giữ ở transaction tạo booking, không giữ ngay khi click sơ đồ; nếu bị người khác lấy thì API trả 409 và người dùng chọn lại.

## Quản lý booking

`/my-booking` → nhập mã + họ + tên của một hành khách → API kiểm tra → hiện hành trình, dịch vụ, giá/trạng thái → có thể hủy booking demo theo điều kiện. Tra cứu sai trả lỗi chung và bị giới hạn số lần theo IP.

## Check-in

`/check-in` → tra cứu → xác minh booking đã thanh toán và còn trong thời gian cấu hình → chọn hành khách/chặng và ghế còn trống nếu chưa có → chấp nhận điều kiện demo → xác nhận → boarding pass ghi rõ DEMO. Gửi lại request hoàn tất không tạo check-in mới hoặc đổi ghế đã check-in.

Quy tắc demo: mở 720 giờ (30 ngày) và đóng 1 giờ trước khởi hành, điều chỉnh bằng biến môi trường; đây không phải quy tắc Vietjet.

## Tài khoản và nội dung

Đăng ký/đăng nhập tài khoản riêng của demo bằng BCrypt/JWT. Không dùng tài khoản hãng, không hỏi số thẻ hoặc giấy tờ cá nhân thật. Menu dịch vụ có trang mô tả nội bộ và ghi rõ phần chưa tích hợp. Các link tìm vé/điểm đến dẫn đến tìm kiếm có dữ liệu API.
