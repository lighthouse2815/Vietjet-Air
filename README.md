# Vietjet Air — bản mô phỏng đặt vé độc lập

Ứng dụng full-stack phục vụ học tập và demo, lấy giao diện công khai https://www.vietjetair.com/vi làm tham chiếu. **Không phải website chính thức, không liên kết với Vietjet, không bán vé thật.** Chỉ nhập dữ liệu hành khách mẫu; thanh toán và boarding pass đều giả lập.

React/JavaScript/Vite → REST API → Java 21/Spring Boot MVC → PostgreSQL. Backend monolith ba tầng Controller → Service → Repository; Spring Data JPA/Hibernate, Lombok, Flyway, Spring Security/BCrypt/JWT. Không sử dụng API nội bộ của hãng.

## Yêu cầu

- Java JDK 21, Node.js 22.12+, npm, Git.
- Docker Engine hoặc Docker Desktop có Docker Compose v2, đang chạy.
- Các cổng mặc định 5173 (web), 8085 (API), 5438 (PostgreSQL) còn trống.
- Maven được Maven Wrapper tải tự động; lần đầu cần Internet để tải dependency và image Docker.

## Chạy local

Từ thư mục repository:

```bash
node scripts/init-env.mjs
docker compose up -d db
docker compose ps
npm ci
npm --prefix frontend ci
```

Script tạo `.env` với mật khẩu database và JWT secret ngẫu nhiên, quyền file `0600`; giữ nguyên file nếu đã tồn tại. `.env` được Git bỏ qua. Đợi database báo `healthy`.

Terminal thứ hai, tại thư mục repository:

```bash
./scripts/start-backend.sh
```

Script đọc `.env` rồi chạy `backend/mvnw -f backend/pom.xml spring-boot:run`. Flyway tạo schema và catalog; seed tạo các chuyến trong 90 ngày tính từ ngày khởi động và bổ sung mỗi ngày. Lần chạy đầu có nhiều dữ liệu ghế nên cần đợi seed hoàn thành.

Terminal thứ ba:

```bash
npm --prefix frontend run dev
```

- Website: http://localhost:5173
- Kiểm tra API: http://localhost:8085/api/health
- Database: `localhost:5438`, database `flight_demo`, user từ `.env`.

Vite chuyển `/api` tới backend. Dừng frontend bằng Ctrl+C. Dừng backend bằng Ctrl+C; `docker compose stop db` giữ dữ liệu trong named volume. Không đổi mật khẩu trong `.env` cho volume đã khởi tạo nếu chưa cập nhật mật khẩu PostgreSQL tương ứng.

## Cấu hình môi trường

| Biến trong `.env` | Mặc định / tác dụng |
|---|---|
| `POSTGRES_USER` | `flight_demo` |
| `POSTGRES_PASSWORD` | Bắt buộc, script tạo ngẫu nhiên |
| `POSTGRES_PORT` | `5438` |
| `DB_URL` | `jdbc:postgresql://localhost:5438/flight_demo`; đổi cùng port/user nếu cần |
| `SERVER_PORT` | `8085` |
| `FRONTEND_ORIGIN` | `http://localhost:5173`, dùng cho CORS |
| `JWT_SECRET` | Bắt buộc, ít nhất 32 byte; script tạo ngẫu nhiên |
| `HOLD_MINUTES` | `15`, thời hạn giữ booking chờ thanh toán |
| `CHECK_IN_OPEN_HOURS` | `720`, mở check-in demo trước 30 ngày |
| `CHECK_IN_CLOSE_HOURS` | `1`, đóng trước một giờ |
| `SEED_DAYS` | `90`, số ngày seed cuốn chiếu |

Nếu backend dùng cổng khác, khởi động Vite với `API_PROXY_TARGET=http://localhost:<port> npm --prefix frontend run dev`. Có thể đặt `VITE_API_URL` trong môi trường Vite để gọi URL API khác; cấu hình CORS phải tương ứng. Không đưa secret vào biến có tiền tố `VITE_`.

## Hành trình demo mẫu

1. Mở trang chủ, chọn một chiều **TP.HCM (SGN) → Hà Nội (HAN), ngày mai, một người lớn**. Có thể tìm sân bay bằng mã IATA hoặc tên không dấu.
2. Chọn chuyến bay và hạng Eco/Deluxe/SkyBoss/Business; quyền lợi và giá lấy từ database demo.
3. Nhập `NGUYEN` / `VAN DEMO`, ngày sinh `1990-01-01`, email `demo@example.com`, điện thoại `0901234567`.
4. Chọn hành lý, suất ăn, ghế còn trống; xem lại giá. Có thể dùng mã **DEMO10** giảm 10% giá vé, tối đa 200.000 VND.
5. Tạo booking và chọn **Thanh toán thành công**. Hai nút còn lại mô phỏng thất bại có thể thử lại, hoặc hủy để giải phóng chỗ.
6. Lưu mã booking. Refresh trang thành công vẫn đọc lại được booking từ backend.
7. Vào **Chuyến bay của tôi**, nhập mã, họ và tên ở bước 3 để tra cứu. Booking còn chờ thanh toán có nút tiếp tục thanh toán.
8. Vào **Online Check-in**, tra cứu booking đã xác nhận, chọn hành khách/chặng, dùng ghế đã mua hoặc ghế tiêu chuẩn miễn phí, chấp nhận điều kiện và nhận boarding pass **DEMO**.

Khứ hồi mẫu: SGN → Đà Nẵng (DAD), đi ngày mai, về ngày kế tiếp; chọn cả chuyến đi và chuyến về. Tuổi hành khách được kiểm tra theo ngày khởi hành: người lớn từ 12, trẻ em 2–11, em bé dưới 2; em bé không có ghế riêng, số em bé không vượt số người lớn; tổng tối đa 9 người.

Đăng ký tài khoản riêng tại `/auth` nếu muốn gắn booking mới với tài khoản. Không seed mật khẩu dùng chung. Đăng nhập trước khi đặt vé để xem booking trong tài khoản; backend giới hạn theo user hiện tại và hỗ trợ phân trang. Khách không cần đăng nhập vẫn đặt và tra cứu được bằng thông tin tên và mã booking.

## Đã triển khai

- Khảo sát Playwright ở bốn viewport; tài liệu đo giao diện, snapshot và giới hạn khảo sát.
- Trang chủ đầy đủ nhóm section theo thứ tự khảo sát, header/dropdown/menu mobile, carousel autoplay/swipe, form sân bay/lịch giá/hành khách, footer, responsive và reduced motion.
- Tìm chuyến một chiều/khứ hồi, hạng vé, thông tin hành khách, chọn dịch vụ/ghế theo người và chặng, review, thanh toán demo, mã đặt chỗ và dữ liệu PostgreSQL thật.
- Draft lưu sessionStorage qua refresh và các bước. Mất session vẫn tra cứu lại được qua tên/mã.
- Giá backend bằng BigDecimal, snapshot khi tạo booking, giữ chỗ có hạn, khóa transaction chống ghế trùng và overbooking, giải phóng chỗ khi hủy/hết hạn, thanh toán thành công idempotent.
- Tra cứu có xác minh tên, token truy cập UUID, giới hạn 15 lần/phút/IP; check-in có điều kiện thời gian và boarding pass demo; BCrypt/JWT cho tài khoản USER.
- Validation, lỗi JSON, loading/empty/error, các trang nội dung nội bộ, lazy loading các trang checkout.

## Giới hạn và khác biệt với reference

- Banner/card được tạo mới; KoHo có giấy phép OFL, font tiêu đề và logo chữ thay thế. Không có quyền sử dụng asset độc quyền của hãng nên không sao chép chúng. Demo có ba ảnh banner riêng cho chiến dịch 12h, kết nối bầu trời và du lịch gia đình; reference tại mốc khảo sát có chín slide. Không tuyên bố giống 100%.
- Nội dung khuyến mại, giá, quyền lợi, sơ đồ 72 ghế (71 ghế bán), số liệu/giải thưởng minh họa và thời gian check-in là dữ liệu demo; không phải quy định hãng thật.
- Chỉ một chiều/khứ hồi, VND và tiếng Việt. Nhiều chặng, dịch vụ đối tác (khách sạn, eSIM, eVisa, ngoại tệ, SkyJoy, Skyshop...) có trang giải thích phạm vi; chưa tích hợp đối tác.
- Dịch vụ bổ sung được mua trong luồng tạo booking. Chưa có chỉnh sửa/mua thêm sau xác nhận, đổi vé, hoàn tiền thật, gửi email, xuất vé thật, quản trị CMS hay triển khai production.
- Boarding pass em bé đi kèm và quy trình tại sân bay nằm ngoài demo. Check-in chỉ cho hành khách có ghế riêng.
- Một số tương tác và trang sau đặt vé của reference chưa xác minh được do popup/lazy load; chi tiết trong [REFERENCE_AUDIT](docs/REFERENCE_AUDIT.md).

## Kiểm thử và build

Backend sử dụng PostgreSQL Testcontainers độc lập, không reset database local:

```bash
./backend/mvnw -f backend/pom.xml test
./backend/mvnw -f backend/pom.xml package
npm --prefix frontend run build
```

End-to-end cần backend/database/frontend đang chạy:

```bash
npm ci
npx playwright install chromium
npm run test:e2e
```

Linux thiếu thư viện Chromium có thể cần `npx playwright install --with-deps chromium`. Suite chạy booking một chiều và khứ hồi tại 1920×1080, 1440×900, 768×1024, 390×844; kiểm tra quản lý/tài khoản/empty state tại laptop. Test tạo booking và tài khoản **mẫu** trong database đang chạy. Có thể đặt `CAPTURE_E2E=1 npm run test:e2e` để cập nhật ảnh trong `docs/verification/checkout`.

Xem bản production build local: dừng Vite dev rồi chạy `npm --prefix frontend run preview`; vẫn dùng port 5173 và proxy `/api`. Backend đóng gói ở `backend/target/flight-booking-1.0.0.jar`; khi chạy `java -jar`, phải export các biến `.env` trước.

Kiểm tra persistence có thể chạy `node scripts/verify-persistence.mjs prepare`, restart backend, rồi `node scripts/verify-persistence.mjs verify`. Fixture chứa token nằm trong thư mục tạm của hệ điều hành, không ở repo; báo cáo chỉ ghi kết quả đối chiếu. Script tạo một booking đã thanh toán/check-in giả lập.

## Reset dữ liệu demo

Chỉ thực hiện khi muốn xóa **toàn bộ** booking, tài khoản và dữ liệu demo của project. Dừng backend trước, sau đó:

```bash
docker compose down -v
docker compose up -d db
./scripts/start-backend.sh
```

Named volume bị xóa; Flyway và seed tạo dữ liệu mới. Giữ `.env`, hoặc tạo lại bằng script nếu đã xóa `.env`. Đây là hướng dẫn reset, không phải bước cần làm mỗi lần chạy.

## Tài liệu

- [Khảo sát reference](docs/REFERENCE_AUDIT.md), [component](docs/UI_COMPONENTS.md), [luồng người dùng](docs/USER_FLOWS.md), [nguồn asset](docs/ASSETS.md).
- [Database và ERD](docs/DATABASE.md), [REST API](docs/API.md), [báo cáo kiểm chứng](docs/VERIFICATION.md).
- Ảnh reference trong `docs/reference/`; ảnh local và đối chiếu trong `docs/verification/`.
