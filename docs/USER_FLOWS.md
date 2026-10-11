# Luồng người dùng và giới hạn demo

## Đặt vé

Trang chủ → chọn sân bay/ngày/hành khách → `/flights` → chọn Eco/Deluxe/SkyBoss/Business cho một hoặc hai chặng → `/booking/passengers` → `/booking/extras` → `/booking/review` → tạo booking bằng API (backend tính lại tiền và giữ chỗ 15 phút) → `/booking/payment` → mô phỏng thành công/thất bại/hủy → `/booking/success/:bookingCode`.

Draft lưu sessionStorage để reload và chuyển bước không mất dữ liệu. Booking thật được lưu PostgreSQL; access token của khách là capability ngẫu nhiên, không đọc thông tin booking chỉ bằng mã đặt chỗ. Frontend không gửi giá làm nguồn quyết định. Ghế chọn được giữ ở transaction tạo booking, không giữ ngay khi click sơ đồ; nếu bị người khác lấy thì API trả 409 và người dùng chọn lại.

## Quản lý booking

`/my-booking` → nhập mã + họ + tên của một hành khách → API kiểm tra → hiện hành trình, dịch vụ, giá, trạng thái booking và trạng thái thanh toán → có thể hủy booking demo theo điều kiện hoặc tiếp tục thanh toán booking PENDING. Tra cứu sai trả lỗi chung và bị giới hạn số lần theo IP. Dịch vụ bổ sung được chọn trong luồng tạo booking; chưa mua thêm/đổi dịch vụ sau xác nhận.

## Check-in

`/check-in` → tra cứu → xác minh booking đã thanh toán và còn trong thời gian cấu hình → chọn hành khách/chặng và ghế còn trống nếu chưa có → chấp nhận điều kiện demo → xác nhận → boarding pass ghi rõ DEMO. Gửi lại request hoàn tất không tạo check-in mới hoặc đổi ghế đã check-in.

Quy tắc demo: mở 720 giờ (30 ngày) và đóng 1 giờ trước khởi hành, điều chỉnh bằng biến môi trường; đây không phải quy tắc Vietjet.

## Tài khoản và nội dung

Đăng ký/đăng nhập tài khoản riêng của demo bằng BCrypt/JWT. Không dùng tài khoản hãng, không hỏi số thẻ hoặc giấy tờ cá nhân thật. Menu dịch vụ có trang mô tả nội bộ và ghi rõ phần chưa tích hợp. Các link tìm vé/điểm đến dẫn đến tìm kiếm có dữ liệu API.

## Nghiệp vụ nội bộ bổ sung

| Luồng | Các bước và kết quả |
|---|---|
| Hồ sơ / hành khách thường dùng | Đăng nhập → `/account` → cập nhật tên/điện thoại hoặc thêm/sửa/xóa hành khách → chọn hành khách đã lưu tại checkout |
| Đổi mật khẩu | Nhập mật khẩu hiện tại/mới → thu hồi mọi JWT cũ → đăng nhập lại |
| Quên mật khẩu | `/auth` → Quên mật khẩu → nhập email → ADMIN đọc Hộp thư demo → mở đường dẫn một lần → lưu mật khẩu mới |
| Hỗ trợ | `/services/support` → tạo yêu cầu → khách/ADMIN trả lời → xem lịch sử → đóng; sau đóng không nhận trả lời |
| Mua thêm / đổi vé | Tra cứu `/my-booking` → mở quản lý → chọn dịch vụ/ghế/chuyến/hạng hoặc sửa liên hệ → báo giá → thanh toán SUCCESS mới áp dụng; FAILED cho thử lại |
| Hoàn vé | Booking đã trả tiền, chưa check-in → gửi lý do → ADMIN duyệt/từ chối → duyệt giải phóng ghế → hoàn tiền demo → trả voucher và đảo điểm một lần |
| Voucher | Đăng nhập → mua/tặng theo email → thanh toán phát hành → người nhận chọn voucher tại payment booking → trừ số dư, phần còn lại thanh toán demo |
| Cửa hàng | Chọn lượng → tạo đơn giữ hàng → trả tiền / thử lại → nhận tại quầy hoặc theo booking → ADMIN xác nhận giao; hủy/hết hạn trả kho |
| Điểm thưởng | Thanh toán vé/thay đổi/cửa hàng → tích điểm trên chi tiêu hợp lệ → xem số dư/hạng/lịch sử → đổi bội số 100 điểm lấy voucher |
| Nhiều chặng | `/services/multi-city` → 2–6 chặng nối tiếp → chọn vé mỗi chặng → checkout chung |
| Nhóm | `/services/groups` → tối đa 30 người, có người lớn đi cùng em bé → một chiều/khứ hồi → checkout chung và kiểm tra capacity máy chủ |
| Ngôn ngữ | Chọn Tiếng Việt/English ở header, kể cả mobile → giao diện đổi ngay → localStorage giữ lựa chọn qua reload |
| Quản trị | ADMIN `/admin` → booking/hoàn/hỗ trợ/đơn/chuyến/danh mục/nội dung/hộp thư → thao tác theo trạng thái và quyền backend |

Chỉ dữ liệu và giao dịch demo được thực hiện trong project. Dịch vụ bên ngoài và điều kiện tích hợp ở [PROVIDER_BACKLOG.md](PROVIDER_BACKLOG.md).
