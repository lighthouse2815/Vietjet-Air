# REST API

Base URL local `http://localhost:8085/api`, JSON. Success trả DTO record (không trả JPA entity). Error thống nhất `{ "code": "...", "message": "...", "timestamp": "...Z" }`. Tiền là số thập phân VND; thời điểm ISO-8601 UTC; ngày `YYYY-MM-DD` theo Asia/Ho_Chi_Minh.

## Endpoint

| Method | Path | Input / mô tả |
|---|---|---|
| GET | `/health` | Trạng thái API |
| GET | `/airports?q=ha%20noi` | Tìm mã, thành phố, tên không phân biệt dấu |
| GET | `/flights/search?origin=SGN&destination=HAN&date=YYYY-MM-DD&passengers=1` | Danh sách của một tuyến/ngày; passengers 1–30, chỉ số người có ghế |
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

Không có endpoint `/confirm` riêng: xác nhận thuộc transaction thanh toán SUCCESS để tránh bỏ qua trạng thái thanh toán. Flight search giới hạn một tuyến/ngày; airport/content/ancillary là danh mục nhỏ. Danh sách booking tài khoản được phân trang, trả array; khi hết dữ liệu trả array rỗng. API công khai không liệt kê booking khách; danh sách quản trị nằm ở `/admin/bookings` và yêu cầu ADMIN.

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

`journeyType` tùy chọn: ONE_WAY, ROUND_TRIP, MULTI_CITY hoặc GROUP. Thiếu trường này vẫn suy ra một chiều/khứ hồi như API cũ. `segments` 1–6; thường tối đa 9 hành khách, GROUP tối đa 30. MULTI_CITY có 2–6 chặng nối tiếp, khởi hành sau giờ đến chặng trước; khứ hồi hai chặng đảo chiều. GROUP có một chiều hoặc khứ hồi. `passengerIndex` là vị trí zero-based trong mảng passengers, dùng nhất quán trong mỗi chặng. `seats` và `extras` bắt buộc là array, có thể rỗng. Mỗi người/chặng chỉ một ghế, mỗi nhóm dịch vụ chỉ một gói. `title` thuộc MR/MS/MSTR/MISS; passenger type ADULT/CHILD/INFANT. Không yêu cầu giấy tờ cá nhân thật.

Booking DTO gồm id/code/accessToken/status, contact, createdAt/expiresAt, segments, passengers, extras, price, boardingPasses, paymentStatus và journeyType. `paymentStatus` là giao dịch mới nhất (SUCCESS/FAILED/CANCELLED) hoặc UNPAID; độc lập với trạng thái booking, nên booking hủy sau khi đã thanh toán vẫn có SUCCESS. `price` gồm baseAmount/taxAmount/extrasAmount/discountAmount/totalAmount/currency. UUID token phải được giữ kín như quyền truy cập booking; chỉ mã không đủ đọc dữ liệu. Refresh trang có thể dùng token đã lưu trong sessionStorage, hoặc tra cứu lại bằng mã và tên.

## Lỗi và quyền truy cập

- 400: payload/query/định dạng sai, tuổi hoặc hành trình sai, mã khuyến mại không hợp lệ.
- 401: đăng nhập không đúng, JWT thiếu/hết hạn ở API tài khoản.
- 403: token booking sai/thiếu hoặc truy cập chức năng không có quyền.
- 404: không có chuyến/booking/dịch vụ; lookup sai tên và sai mã đều dùng thông báo “Thông tin đặt chỗ không khớp”.
- 409: ghế đã giữ, hết capacity, booking hết hạn, trạng thái/seat check-in xung đột, email/giao dịch trùng.
- 429: lookup hoặc login/register vượt 15 yêu cầu/phút/IP. Limiter trong bộ nhớ của monolith, reset khi process restart; không dùng forwarded IP không tin cậy.
- 500: lỗi không mong muốn, chỉ trả thông báo chung, không stack trace.

API công khai cho phép tìm chuyến/catalog và đặt vé khách; đọc/hủy/thanh toán/check-in booking kiểm tra UUID token trong Service. Tài khoản dùng JWT có role USER hoặc ADMIN; mọi `/admin/**` yêu cầu ADMIN. JWT kiểm tra phiên bản token trong database: đổi/khôi phục mật khẩu thu hồi các phiên cũ. Nếu booking được tạo với JWT, backend gắn user từ JWT; client không được chọn userId.

## Hồ sơ, hỗ trợ và khôi phục mật khẩu

Các endpoint `/account/**` và `/support/**` yêu cầu Bearer JWT; dữ liệu chỉ thuộc user hiện tại.

| Method | Path | Payload / kết quả |
|---|---|---|
| GET / POST | `/account/profile` | GET hồ sơ; POST `{name,phone}` |
| POST | `/account/password` | `{currentPassword,newPassword}`; thu hồi phiên |
| POST | `/auth/password-reset` | `{email}`; thông báo chung, thư demo trong outbox ADMIN |
| POST | `/auth/password-reset/complete` | `{token,password}`; token một lần, hạn 30 phút |
| GET / POST | `/account/travelers` | Danh sách / tạo `{type,title,lastName,firstName,dateOfBirth,nationality}` |
| POST | `/account/travelers/{id}` / `/{id}/delete` | Sửa / xóa hành khách của mình |
| GET / POST | `/support/tickets` | Danh sách / tạo `{subject,category,body}`; category BOOKING/PAYMENT/BAGGAGE/OTHER |
| POST | `/support/tickets/{id}/reply` / `/{id}/close` | `{body}` / đóng; yêu cầu đã đóng không nhận trả lời |

## Thay đổi và hoàn vé

Tất cả endpoint sau yêu cầu `X-Booking-Token`.

| Method | Path | Payload / kết quả |
|---|---|---|
| POST | `/bookings/{id}/changes` | CreateBooking payload; báo giá `{id,status,amount,fee,targetAmount,expiresAt,requested}` |
| POST | `/bookings/{id}/changes/{changeId}/pay` | `{requestKey,outcome}`; SUCCESS/FAILED/CANCELLED |
| GET | `/bookings/{id}/history` | `{changes,refunds}` |
| POST | `/bookings/{id}/refund` | `{reason}`; tính phí và tiền hoàn ở máy chủ |

Thay đổi giữ số hành khách/chặng và loại hành khách; chỉ booking CONFIRMED, chưa check-in, trước khởi hành ít nhất một giờ và không có yêu cầu hoàn đang xử lý. Báo giá 15 phút gắn revision booking; báo giá cũ sau thay đổi khác bị từ chối. SUCCESS mới áp dụng thay đổi nguyên tử; thất bại không chuyển ghế. Giữ giá vé/dịch vụ cũ cho lựa chọn không đổi và số tiền ưu đãi đã nhận (tối đa giá vé mới), không áp mã mới sau thanh toán. Phí/chênh lệch tính ở máy chủ, không nhận giá client.

Hoàn chỉ booking có payment SUCCESS, chưa check-in và còn trước khởi hành một giờ. REQUESTED → APPROVED/REJECTED; APPROVED → COMPLETED. Duyệt giải phóng chỗ, hoàn tất trả phần tiền voucher tối đa số đã dùng và đảo điểm booking/thay đổi. Thao tác hoàn tất lặp không trừ/cộng lại. Hoàn và thanh toán đều giả lập.

## Voucher, cửa hàng và hội viên

`/commerce/products` công khai; `/commerce/account/**` yêu cầu Bearer JWT.

| Method | Path | Payload / kết quả |
|---|---|---|
| GET | `/commerce/products` | Sản phẩm mở bán, giá và tồn khả dụng |
| GET / POST | `/commerce/account/orders` | Danh sách / `{items:[{productId,quantity}],delivery,bookingCode,bookingToken,requestKey}` |
| POST | `/commerce/account/orders/{id}/pay` | `{requestKey,outcome}` |
| POST | `/commerce/account/orders/{id}/cancel` | Trả tồn kho; đơn đã giao không hủy |
| GET / POST | `/commerce/account/vouchers` | Đã mua/nhận / `{value,recipientEmail,requestKey}` |
| POST | `/commerce/account/vouchers/{id}/pay` | `{requestKey,outcome}`; thành công phát hành |
| POST | `/commerce/account/vouchers/{id}/cancel` | Chỉ người mua; voucher thưởng/đã dùng không hủy |
| POST | `/commerce/account/vouchers/pay-booking` | `{voucherId,bookingId,requestKey}`; thêm X-Booking-Token; trừ voucher rồi thanh toán demo phần còn lại |
| GET | `/commerce/account/wallet` | `{points,spend,tier,entries}` |
| POST | `/commerce/account/wallet/redeem` | `{points,requestKey}`; 100–2.000 điểm, bội số 100 |

Mỗi `requestKey` UUID phải giữ nguyên khi thử lại **cùng** yêu cầu. Key đã dùng cho payload/kết quả khác trả 409. Kho giữ 15 phút; payment thất bại có thể thử lại. delivery PICKUP hoặc ON_BOARD; ON_BOARD cần booking/token hợp lệ, đã trả tiền và còn thời gian bay. Đơn nhận theo chuyến không thanh toán/giao hàng khi booking đang chờ xử lý hoàn vé. Đơn/voucher/điểm thuộc tài khoản; thông tin giá/tồn/điểm đều được xác nhận trong transaction.

Voucher trả `{id,code,recipientEmail,status,value,balance,expiresAt,reward,purchased}`. `purchased` cho biết người dùng hiện tại có phải người mua; người nhận được nhìn thấy voucher nhưng không có quyền thanh toán/hủy. Trường mới chỉ bổ sung vào response, không đổi request hoặc quy tắc kiểm tra quyền ở server. Frontend ẩn nút thanh toán/hủy với voucher nhận từ người khác, voucher thưởng hoặc voucher đã dùng theo điều kiện tương ứng.

## Quản trị

Bearer JWT có role ADMIN; USER nhận 403, thiếu JWT nhận 401.

| Method | Path | Payload / kết quả |
|---|---|---|
| GET | `/admin/{resource}?page=0&size=20` | resource bookings/refunds/tickets/orders/flights/mail; array, size 1–50; catalog trả products/ancillaries/promotions/content |
| POST | `/admin/products` / `/{id}` | `{name,description,price,stock,active}` |
| POST | `/admin/ancillaries` / `/{id}` | `{code,name,category,description,price}` |
| POST | `/admin/promotions` / `/{id}` | `{code,percent,maxDiscount,expiresOn}` |
| POST | `/admin/content` / `/{id}` | `{category,title,description,image,target,sortOrder}` |
| POST | `/admin/flights` / `/{id}` | `{flightNumber,origin,destination,departureTime,arrivalTime,capacity,aircraft,ecoPrice,deluxePrice,skybossPrice,businessPrice}` |
| POST | `/admin/refunds/{id}` | `{action,note}`; APPROVE/REJECT/COMPLETE |
| POST | `/admin/tickets/{id}/reply` / `/{id}/close` | `{body}` / đóng |
| POST | `/admin/orders/{id}/fulfill` | Xác nhận giao hàng demo của đơn đã trả tiền |

Flight có booking đang chiếm sức chứa không đổi tuyến/giờ; sức chứa không dưới chỗ đang giữ và không quá 71 ghế bán. Giá mới không sửa snapshot booking đã tạo. Nội dung/ảnh chỉ nhận đường dẫn nội bộ được kiểm tra. Mail outbox chỉ ADMIN truy cập, không phải email đã gửi thật. Tài khoản ADMIN bootstrap từ cấu hình môi trường, không có API tự nâng quyền.
