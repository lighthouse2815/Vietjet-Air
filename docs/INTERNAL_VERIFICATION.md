# Kiểm chứng nghiệp vụ nội bộ

Ngày 11/10/2026, môi trường local Java 21, Spring Boot 3.5.16, React 19/Vite và PostgreSQL 17. Phạm vi đối chiếu tại [INTERNAL_BUSINESS_PLAN.md](INTERNAL_BUSINESS_PLAN.md); tích hợp bên ngoài tại [PROVIDER_BACKLOG.md](PROVIDER_BACKLOG.md).

## Kết quả cuối

| Kiểm tra | Lệnh | Kết quả |
|---|---|---|
| Backend và đóng gói | `./backend/mvnw -f backend/pom.xml verify` | 30 tests, 0 failures/errors/skipped; BUILD SUCCESS lúc 22:23:28 +07 |
| Bản dịch / trùng tên hàm dịch | `npm run check:i18n` | 531 vị trí chuỗi, 684 bản dịch tiếng Anh; không thiếu khóa hoặc trùng binding |
| Frontend production build | `npm run build` | Thành công; main 37,04 kB, localization 91,10 kB, vendor 450,15 kB trước gzip |
| Trình duyệt Chromium | `npm run test:e2e` | 37 passed, 0 failed, trong một lần chạy đầy đủ kết thúc 22:27:10 +07 |
| Runtime sau khởi động lại | `GET /api/health` | UP; backend dùng mã mới, web preview trên cổng 5173 |
| Git | `git diff --check` | Không lỗi whitespace; commit/push từng phần lên main |

Backend dùng PostgreSQL Testcontainers riêng; không reset database local. Flyway V1–V7 chạy và Hibernate validate. E2E gọi API thật, tạo dữ liệu mẫu trong database local; bài kiểm tra lỗi mạng chủ động ngắt kết nối rồi retry. Không dùng response giả để tuyên bố hoàn tất giao dịch. Không có cấu hình lint/type-check JavaScript riêng, nên không báo đã chạy chúng.

## Phạm vi đã kiểm tra

| Phần | Bằng chứng |
|---|---|
| Booking / sức chứa / ghế | Các test tích hợp giữ chỗ, hạn dùng, đồng thời, ghế trùng, quote, snapshot, thanh toán thử lại và idempotency; checkout một chiều/khứ hồi ở 4 viewport |
| Tài khoản | Quyền sở hữu hồ sơ/hành khách; cập nhật và reload trên UI; đổi/khôi phục mật khẩu thu hồi token; reset token dùng một lần |
| Hỗ trợ | Yêu cầu riêng từng user, trao đổi/lịch sử, đóng và chặn trả lời sau đóng; UI gửi, bổ sung và reload |
| Thay đổi vé | Mua thêm hành lý, giữ ghế, sửa liên hệ; FAILED giữ booking cũ, SUCCESS áp dụng nguyên tử; từ chối quote revision cũ; giữ ưu đãi cũ khi đổi liên hệ |
| Hoàn vé | Từ chối vé hủy nhưng chưa trả tiền; chặn thay đổi/check-in trong lúc chờ hoàn; duyệt trước khi hoàn; lặp COMPLETE không hoàn hai lần; UI khách và ADMIN |
| Voucher | Phát hành, người nhận/quyền sở hữu, thanh toán booking và không tích điểm phần voucher; hoàn voucher một lần; UI mua/trả/áp dụng |
| Cửa hàng | Snapshot giá, giữ/trả kho, payment lặp, hủy/đảo điểm; chặn thanh toán/giao đơn theo booking đang chờ hoàn; UI payment FAILED/SUCCESS/cancel và đối chiếu kho |
| Hội viên | Tích/đảo điểm theo source một lần, đổi điểm nguyên tử, từ chối thiếu điểm; UI đổi 100 điểm và kiểm tra số dư |
| ADMIN | HTTP 401/403/quyền ADMIN; không đổi tuyến/giờ chuyến đã có booking; UI duyệt/hoàn và sửa danh mục ở tiếng Anh giữ nguyên mã category |
| Nhiều chặng / nhóm | Backend hành trình nối tiếp và giới hạn nhóm; UI chọn các chặng vào checkout chung; chuyển nhóm sang nhiều chặng đặt lại biểu mẫu |
| Ngôn ngữ / điều hướng | Việt/Anh chuyển tức thì và giữ qua reload ở 1920/1440/768/390 px; không tràn ngang; chuyển ví/cửa hàng/voucher và catalog/chuyến không đọc nhầm dữ liệu trang cũ |
| Boarding pass | Check-in và tải file .txt ở cả 4 viewport; kiểm tra tên file, tên hành khách và nhãn DEMO trong file tải thực tế |

File test: `backend/src/test/java/com/flightbooking/BookingIntegrationTest.java`, `tests/booking.spec.js`, `tests/home.spec.js`, `tests/management.spec.js`, `tests/internal.spec.js`, `tests/navigation.spec.js`. Các test nghiệp vụ quản trị không lưu trace/screenshot để tránh ghi phiên ADMIN vào artifact.

## Các lỗi đã sửa trong đợt kiểm chứng

- Ô chọn ngôn ngữ bổ sung thêm combobox; locator sân bay được giới hạn vào popup sân bay.
- Callback hành khách/yêu cầu hỗ trợ trùng tên hàm dịch; đổi tên biến và thêm kiểm tra binding vào script bản dịch.
- API hook trả dữ liệu của đường dẫn cũ trong lần render đầu sau đổi route; gắn kết quả với path/token, chỉ trả dữ liệu khi khớp yêu cầu hiện tại.
- Đổi liên hệ làm mất giảm giá đã trả; giữ số tiền ưu đãi cũ. Vé hủy chưa thanh toán không được hoàn.
- Đơn theo chuyến không tiếp tục thanh toán/giao khi booking đang chờ xét hoàn.
- React giữ biểu mẫu nhóm khi mở nhiều chặng; route có key riêng cho từng kiểu hành trình.

Các lỗi nghiệp vụ và điều hướng có test tái hiện thất bại trước khi sửa, sau đó được kiểm tra cùng toàn bộ suite. Kết quả ở bảng lấy từ lần chạy đầy đủ cuối, không ghép các lượt pass khác nhau.

## Commits triển khai và kiểm thử

| Commit | Nội dung |
|---|---|
| `85bea4e` | docs: ghi phạm vi nghiệp vụ nội bộ và backlog nhà cung cấp |
| `78395ac` | feat: bổ sung hồ sơ tài khoản và yêu cầu hỗ trợ |
| `d0e41bc` | feat: triển khai mua thêm dịch vụ và đổi hoàn vé |
| `e9dbfc5` | feat: triển khai voucher cửa hàng và điểm thưởng nội bộ |
| `be4f04d` | feat: bổ sung quản trị và phân quyền xử lý nghiệp vụ |
| `6a95432` | feat: hỗ trợ nhiều chặng đặt nhóm và tải boarding pass |
| `8f81bc6` | fix: giữ ưu đãi khi đổi vé và chặn hoàn vé chưa thanh toán |
| `c45d9a3` | fix: tránh đọc dữ liệu cũ khi chuyển trang nghiệp vụ |
| `3403272` | chore: thêm lệnh tạo quản trị viên local an toàn |
| `1ef74b9` | feat: hoàn thiện tiếng Việt tiếng Anh và điều hướng nghiệp vụ |
| `5cf2f3e` | fix: chặn giao dịch hàng theo chuyến đang chờ hoàn vé |
| `f05a99c` | fix: đặt lại biểu mẫu khi chuyển giữa nhóm và nhiều chặng |
| `96b0a15` | test: kiểm chứng nghiệp vụ nội bộ trên trình duyệt |

Tài liệu API/database/luồng/README và báo cáo này được cập nhật trong commit tài liệu kế tiếp. Mọi commit triển khai/kiểm thử phía trên đã push vào GitHub `lighthouse2815/Vietjet-Air`, branch main. File `.env`, credentials, build output và artifact tạm không được commit.

## Giới hạn còn lại

Thanh toán/hoàn tiền, voucher, điểm, đơn hàng và boarding pass chỉ có giá trị trong project demo. Khách sạn, eSIM/eVisa/ngoại tệ/bảo hiểm thật, lịch/giá/vé thật, email/SMS và đồng bộ hội viên/cửa hàng đối tác cần nhà cung cấp theo backlog. Chưa kiểm chứng hosting production, tải lớn hoặc accessibility audit đầy đủ. Giao diện Việt/Anh có bản dịch cho nhãn và dữ liệu seed; nội dung quản trị nhập mới cần bổ sung bản dịch tương ứng.

## Chạy lại

Đọc README để tạo `.env`, chạy database, tạo ADMIN bằng `npm run setup:admin`, khởi động lại backend và chạy frontend/preview. Sau đó:

```bash
./backend/mvnw -f backend/pom.xml verify
npm run check:i18n
npm run build
npm run test:e2e
```

Suite tạo tài khoản/booking/yêu cầu/đơn mẫu; các fixture tìm sức chứa và ghế còn trống. Không xóa dữ liệu để làm test pass.
