# REST API

Base URL local `http://localhost:8085/api`, JSON. Success trả DTO record (không trả JPA entity). Error thống nhất `{ "code": "...", "message": "...", "timestamp": "...Z" }`. Tiền là số thập phân VND; thời điểm ISO-8601 UTC; ngày `YYYY-MM-DD` theo Asia/Ho_Chi_Minh.

## Endpoint

| Method | Path | Input / mô tả |
|---|---|---|
| GET | `/health` | Trạng thái API |
| GET | `/airports?q=ha%20noi` | Tìm mã, thành phố, tên không phân biệt dấu |
| GET | `/flights/search?origin=SGN&destination=HAN&date=YYYY-MM-DD&passengers=1` | Danh sách của một tuyến/ngày; passengers 1–9, chỉ số người có ghế |
| GET | `/flights/calendar?origin=SGN&destination=HAN&month=YYYY-MM-01` | Giá Eco thấp nhất theo ngày trong tháng, dữ liệu sẵn có |
| GET | `/flights/{id}` | Chi tiết chuyến và fares |
| GET | `/flights/{id}/fares` | Bốn hạng demo và quyền lợi |
| GET | `/flights/{id}/seats` | Ghế, giá, extraLegroom, AVAILABLE/RESERVED/UNAVAILABLE; ghế của booking trong Booking DTO có SELECTED |
| GET | `/ancillary-services` | Danh mục dịch vụ có category và giá |
| GET | `/home` | `{items, promotions}`; nội dung category và chuyến giá demo |
| GET | `/promotions` | Hành trình/giá lấy từ các chuyến ngày mai |
| GET | `/destinations` | Content category DESTINATION |
| POST | `/bookings/quote` | CreateBooking payload, giá server; chưa giữ chỗ |
| POST | `/bookings` | CreateBooking payload; 201, giữ chỗ và trả booking/accessToken |
| GET | `/bookings/{code}` | Bắt buộc X-Booking-Token hợp lệ |
| POST | `/bookings/lookup` | bookingCode, lastName, firstName; trả booking và accessToken khi khớp |
| POST | `/bookings/{id}/cancel` | X-Booking-Token, hủy theo điều kiện demo |
| POST | `/payments/demo` | bookingId, requestKey UUID, outcome SUCCESS/FAILED/CANCELLED; X-Booking-Token |
| GET | `/payments/{id}` | X-Booking-Token của booking tương ứng |
| POST | `/check-in/lookup` | Payload lookup; trả `{booking, openHours, closeHours}` |
| POST | `/check-in/complete` | bookingId, flightId, passengerIndex, seatNumber, acceptedConditions=true; X-Booking-Token |
| POST | `/auth/register` | email, password, name; 201, BCrypt/JWT |
| POST | `/auth/login` | email, password; JWT 2 giờ |
| GET | `/auth/me` | Authorization: Bearer JWT |
| GET | `/auth/bookings?page=0&size=20` | Bearer JWT; chỉ booking của user hiện tại, mới nhất trước; size 1–50 |

Không có endpoint `/confirm` riêng: xác nhận thuộc transaction thanh toán SUCCESS để tránh bỏ qua trạng thái thanh toán. Flight search giới hạn một tuyến/ngày; airport/content/ancillary là danh mục nhỏ. Danh sách booking tài khoản được phân trang, trả array; khi hết dữ liệu trả array rỗng. Không có API liệt kê toàn bộ booking khách.

## CreateBooking payload

Thay FLIGHT_ID và SERVICE_ID bằng ID từ API; không gửi giá client:

```json
{
  "segments": [
    {
      "flightId": 1,
      "fareCode": "ECO",
      "seats": [{ "passengerIndex": 0, "seatNumber": "3A" }],
      "extras": [{ "serviceId": 1, "passengerIndex": 0 }]
    }
  ],
  "passengers": [
    {
      "type": "ADULT",
      "title": "MR",
      "lastName": "NGUYEN",
      "firstName": "VAN DEMO",
      "dateOfBirth": "1990-01-01",
      "nationality": "Việt Nam"
    }
  ],
  "contactEmail": "demo@example.com",
  "contactPhone": "0901234567",
  "promotionCode": "DEMO10"
}
```

`segments` một hoặc hai phần tử, chặng về đảo chiều và sau giờ đến chặng đi. `passengerIndex` là vị trí zero-based trong mảng passengers, dùng nhất quán trong mỗi chặng. `seats` và `extras` bắt buộc là array, có thể rỗng. Mỗi người/chặng chỉ một ghế, mỗi nhóm dịch vụ chỉ một gói. `title` thuộc MR/MS/MSTR/MISS; passenger type ADULT/CHILD/INFANT. Không yêu cầu giấy tờ cá nhân thật.

Booking DTO gồm id/code/accessToken/status, contact, createdAt/expiresAt, segments, passengers, extras, price, boardingPasses và paymentStatus. `paymentStatus` là giao dịch mới nhất (SUCCESS/FAILED/CANCELLED) hoặc UNPAID; độc lập với trạng thái booking, nên booking hủy sau khi đã thanh toán vẫn có SUCCESS. `price` gồm baseAmount/taxAmount/extrasAmount/discountAmount/totalAmount/currency. UUID token phải được giữ kín như quyền truy cập booking; chỉ mã không đủ đọc dữ liệu. Refresh trang có thể dùng token đã lưu trong sessionStorage, hoặc tra cứu lại bằng mã và tên.

## Lỗi và quyền truy cập

- 400: payload/query/định dạng sai, tuổi hoặc hành trình sai, mã khuyến mại không hợp lệ.
- 401: đăng nhập không đúng, JWT thiếu/hết hạn ở API tài khoản.
- 403: token booking sai/thiếu hoặc truy cập chức năng không có quyền.
- 404: không có chuyến/booking/dịch vụ; lookup sai tên và sai mã đều dùng thông báo “Thông tin đặt chỗ không khớp”.
- 409: ghế đã giữ, hết capacity, booking hết hạn, trạng thái/seat check-in xung đột, email/giao dịch trùng.
- 429: lookup hoặc login/register vượt 15 yêu cầu/phút/IP. Limiter trong bộ nhớ của monolith, reset khi process restart; không dùng forwarded IP không tin cậy.
- 500: lỗi không mong muốn, chỉ trả thông báo chung, không stack trace.

API công khai cho phép tìm chuyến/catalog và đặt vé khách; đọc/hủy/thanh toán/check-in booking kiểm tra UUID token trong Service. Tài khoản dùng JWT có role USER; chưa có trang/API quản trị ADMIN. Nếu booking được tạo với JWT, backend gắn user từ JWT; client không được chọn userId.
