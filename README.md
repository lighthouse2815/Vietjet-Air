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
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Tùy chọn; tạo tài khoản ADMIN riêng khi khởi động |

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
- Motion trang chủ: fade banner/ảnh, thông báo trượt, nền mây desktop cố định, hỗ trợ nhấp nhô và điều khiển dải vé/giải thưởng. [Kiểm chứng khung hình và video](docs/verification/MOTION.md).
- Nền trang chủ: mây chạy đến FAQ, thống kê có ảnh desktop/mobile riêng, giải thưởng và footer dùng chung nền; viền mây giữ tỷ lệ. [Đối chiếu nền và kết quả 56 E2E](docs/verification/BACKGROUNDS.md).
- Tìm chuyến một chiều/khứ hồi, hạng vé, thông tin hành khách, chọn dịch vụ/ghế theo người và chặng, review, thanh toán demo, mã đặt chỗ và dữ liệu PostgreSQL thật.
- Draft lưu sessionStorage qua refresh và các bước. Mất session vẫn tra cứu lại được qua tên/mã.
- Giá backend bằng BigDecimal, snapshot khi tạo booking, giữ chỗ có hạn, khóa transaction chống ghế trùng và overbooking, giải phóng chỗ khi hủy/hết hạn, thanh toán thành công idempotent.
- Tra cứu có xác minh tên, token truy cập UUID, giới hạn 15 lần/phút/IP; check-in có điều kiện thời gian và boarding pass demo; BCrypt/JWT cho tài khoản USER.
- Validation, lỗi JSON, loading/empty/error, các trang nội dung nội bộ, lazy loading các trang checkout.
- Hồ sơ, đổi/khôi phục mật khẩu có thu hồi phiên, hành khách thường dùng, yêu cầu hỗ trợ và trao đổi với quản trị viên.
- Mua thêm dịch vụ/đổi ghế sau xác nhận; đổi chuyến/ngày/hạng vé/liên hệ; báo giá 15 phút, thanh toán chênh lệch và lịch sử. Giữ số tiền ưu đãi cũ khi đổi vé.
- Hoàn vé đã trả tiền: yêu cầu, tính phí, duyệt/từ chối/hoàn tiền demo; trả số dư voucher và đảo điểm; chống xử lý lặp.
- Mua/tặng voucher, dùng số dư khi trả booking; cửa hàng có giữ tồn kho, đơn/nhận theo chuyến, thanh toán thử lại, hủy và xác nhận giao hàng.
- SkyShop theo bố cục cửa hàng tham chiếu: banner desktop/mobile, tìm kiếm/lọc, danh mục, chi tiết và giỏ hàng qua reload; chọn booking để mua thêm dịch vụ. [Ảnh đối chiếu và kiểm chứng](docs/verification/SKYSHOP.md).
- eVoucher theo trang tham chiếu: header đỏ, ba banner trượt, nền mây và các nhóm Combo/ưu đãi. Chọn mệnh giá qua reload, mua/tặng, tra cứu mã/email và trạng thái; người mua thanh toán/hủy, người nhận dùng số dư cho booking. [Ảnh đối chiếu và kiểm chứng](docs/verification/EVOUCHER.md).
- Điểm/hạng hội viên, sổ giao dịch, đổi điểm lấy voucher; không cộng điểm từ tiền voucher.
- ADMIN quản lý booking, hoàn vé, hỗ trợ, đơn hàng, lịch/giá chuyến, dịch vụ, sản phẩm/tồn kho, khuyến mại, nội dung và hộp thư demo.
- Đặt nhiều chặng/nhóm dùng chung checkout, tải boarding pass demo; Việt/Anh bằng i18next, lưu ngôn ngữ qua reload.

## Sử dụng nghiệp vụ nội bộ

| Chức năng | Đường dẫn |
|---|---|
| Hồ sơ, mật khẩu, hành khách thường dùng | `/account` |
| Yêu cầu và lịch sử hỗ trợ | `/services/support` |
| Mua thêm, đổi/hoàn vé | `/my-booking` → tra cứu → **Mua thêm, đổi hoặc hoàn vé** |
| Mua/tặng voucher | `/services/voucher` |
| Cửa hàng nội bộ | `/services/skyshop` |
| Điểm, hạng và đổi thưởng | `/services/skyjoy` |
| Nhiều chặng / đặt nhóm | `/services/multi-city` / `/services/groups` |
| Quản trị | `/admin` |

Tạo quản trị viên local trước khi khởi động backend:

```bash
npm run setup:admin
./scripts/start-backend.sh
```

Script lưu email và mật khẩu ngẫu nhiên riêng trong `.env` đã bị Git bỏ qua; đọc file này trên máy của bạn để đăng nhập tại `/auth`. Không có mật khẩu ADMIN dùng chung. Nếu email đã thuộc tài khoản USER, bootstrap từ chối tự nâng quyền: cấu hình email ADMIN mới. Nếu backend đang chạy, cần khởi động lại để áp dụng cấu hình.

Quên mật khẩu tạo đường dẫn dùng một lần, hết hạn sau 30 phút trong **Hộp thư demo** của ADMIN. Bản demo chưa gửi email thật. Tài khoản USER chỉ đọc dữ liệu của mình; mọi API quản trị kiểm tra ADMIN ở backend.

Sau khi thanh toán booking, tra cứu và mở quản lý để báo giá thay đổi. Thanh toán thất bại giữ booking cũ; thành công mới chuyển ghế/chuyến và cộng phần tiền tăng. Phí đổi Eco 100.000đ, Deluxe 50.000đ, SkyBoss/Business 0đ mỗi người có ghế/chặng thay đổi. Giá giảm không tự hoàn chênh lệch. Yêu cầu hoàn chặn thay đổi/check-in; ADMIN duyệt, rồi xác nhận hoàn tiền demo. Phí hoàn Eco 20%, Deluxe 10%, SkyBoss/Business 0% giá vé; phí thay đổi trước đó không hoàn.

Cửa hàng giữ hàng 15 phút; đơn hủy/hết hạn trả tồn kho. Nhận hàng theo chuyến cần booking đã xác nhận. SkyShop tìm kiếm và lọc dữ liệu nội bộ; chọn booking ở thanh công cụ rồi bấm mua thêm để mở dịch vụ trong quản lý booking. eSIM/Taxi thông báo chờ tích hợp. Voucher mua từ 100.000đ–2.000.000đ, hiệu lực một năm sau phát hành, chỉ người nhận dùng được. 10.000đ chi tiêu hợp lệ nhận một điểm; 100 điểm đổi voucher 100.000đ. Hủy/hoàn đảo điểm đã cộng; nếu điểm đã đổi thưởng, số dư có thể âm và không đổi tiếp được cho đến khi tích đủ.

## Giới hạn và khác biệt với reference

- Trang chủ dùng logo, chín banner có ảnh desktop/mobile, nền mây, icon, ảnh dịch vụ/điểm đến và font tiêu đề từ bản tham chiếu. Nguồn từng file ở [ASSETS](docs/ASSETS.md); ảnh được tải từ local. Nhãn mô phỏng, giá/giao dịch demo và nút hỗ trợ nội bộ vẫn có khác biệt. Xem [kiểm chứng giao diện](docs/verification/HOMEPAGE.md).
- Nội dung khuyến mại, giá, quyền lợi, sơ đồ 72 ghế (71 ghế bán), số liệu/giải thưởng minh họa và thời gian check-in là dữ liệu demo; không phải quy định hãng thật.
- Hỗ trợ một chiều, khứ hồi, nhiều chặng (2–6), đặt nhóm (tối đa 30 hành khách), VND và chuyển Việt/Anh. Nội dung do quản trị viên nhập được giữ nguyên nếu chưa có bản dịch tương ứng.
- Khách sạn, eSIM, eVisa, ngoại tệ, xuất vé/thu tiền/hoàn tiền thật, email/SMS và đồng bộ SkyJoy/Skyshop thật còn chờ nhà cung cấp; xem [backlog tích hợp](docs/PROVIDER_BACKLOG.md). Voucher, cửa hàng và hội viên hiện có nghiệp vụ nội bộ với dữ liệu riêng.
- Thanh toán, hoàn tiền, voucher, điểm thưởng, giao hàng và boarding pass là demo; chưa triển khai hosting production.
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
npm run setup:admin # nếu chưa có ADMIN, sau đó khởi động lại backend
npm run check:i18n
npm run test:e2e
npm run verify:skyshop
npm run verify:evoucher
```

Linux thiếu thư viện Chromium có thể cần `npx playwright install --with-deps chromium`. Suite chạy booking một chiều và khứ hồi tại 1920×1080, 1440×900, 768×1024, 390×844; kiểm tra quản lý/tài khoản/empty state và nghiệp vụ nội bộ tại laptop; kiểm tra ngôn ngữ tại cả bốn chiều rộng. ADMIN cần được tạo bằng cấu hình trên; các bài kiểm thử quản trị không lưu trace/screenshot phiên đăng nhập. Test tạo booking và tài khoản **mẫu** trong database đang chạy. Có thể đặt `CAPTURE_E2E=1 npm run test:e2e` để cập nhật ảnh trong `docs/verification/checkout`.

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
- [Phạm vi nghiệp vụ nội bộ](docs/INTERNAL_BUSINESS_PLAN.md), [backlog nhà cung cấp](docs/PROVIDER_BACKLOG.md).
- [Database và ERD](docs/DATABASE.md), [REST API](docs/API.md), [báo cáo kiểm chứng](docs/VERIFICATION.md), [đối chiếu SkyShop](docs/verification/SKYSHOP.md), [đối chiếu eVoucher](docs/verification/EVOUCHER.md).
- Ảnh reference trong `docs/reference/`; ảnh local và đối chiếu trong `docs/verification/`.
