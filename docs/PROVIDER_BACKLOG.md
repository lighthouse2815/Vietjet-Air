# Các tích hợp nhà cung cấp cần bổ sung

Backlog được tách theo yêu cầu người dùng ngày 11/10/2026. Những mục này chưa phải chức năng giao dịch thật. Không tạo API giả hoặc hiển thị chứng từ demo như dịch vụ thật.

| Tích hợp | Nghiệp vụ cần bổ sung | Điều kiện/bằng chứng hoàn thành |
|---|---|---|
| Vé/chuyến bay thật | Đồng bộ lịch, giá, sức chứa, PNR, xuất vé và thay đổi hành trình | Hợp đồng/API được cấp quyền, sandbox; đồng bộ trạng thái và xử lý lỗi/lặp |
| Thanh toán/hoàn tiền | Tạo giao dịch, xác minh webhook, đối soát và hoàn tiền | Credentials môi trường, chữ ký, idempotency, sandbox; không lưu thông tin thẻ |
| Email/SMS | Gửi xác nhận vé, khôi phục mật khẩu, thông báo đơn/yêu cầu | Nhà cung cấp hoặc SMTP cấu hình, retry, không lộ token; outbox local chỉ dành demo |
| Khách sạn | Tồn phòng, giá, giữ phòng, xác nhận/hủy booking | API/allotment khách sạn; xác nhận thật và chính sách hủy; chưa chọn provider |
| Combo vé + khách sạn trên eVoucher | Danh mục gói, giá theo nơi đi/ngày, giữ vé/phòng, phát hành và đặt/hủy combo | Quyền tích hợp đơn vị cung cấp combo và hệ thống voucher; xử lý đồng bộ vé/phòng, điều kiện sử dụng và hoàn/hủy |
| Quà Menas/ưu đãi thành viên đối tác | Xác minh điều kiện nối chuyến/thành viên, cấp/nhận quà, sử dụng và đối soát | Thỏa thuận/API đối tác, điều kiện chương trình hiện hành; các thẻ hiện chỉ cung cấp thông tin chờ tích hợp |
| eSIM | Danh mục quốc gia/gói, cấp eSIM/QR, kích hoạt và tra cứu | API đơn vị eSIM, sandbox, không tạo QR demo rồi tuyên bố dùng được |
| Taxi/đặt xe trên SkyShop | Điểm đón/trả, báo giá, đặt/hủy xe, điều phối và trạng thái chuyến | Chọn đơn vị vận chuyển, API được cấp quyền, sandbox và quy tắc hủy/hoàn; danh mục hiện chỉ thông báo chờ tích hợp |
| eVisa | Thông tin yêu cầu, chuyển hồ sơ, phí và cập nhật tiến độ | Dịch vụ hồ sơ được cấp quyền; quyết định visa thuộc cơ quan có thẩm quyền |
| Ngoại tệ | Tỷ giá, hồ sơ, điểm nhận, xác nhận/cấp ngoại tệ | Đơn vị thực hiện, điều kiện giao dịch và quyền tích hợp; không dùng tỷ giá mẫu cho giao dịch thật |
| Bảo hiểm | Phí, phát hành hợp đồng/chứng nhận, hủy và bồi thường | API doanh nghiệp bảo hiểm, điều kiện sản phẩm và sandbox |
| SkyJoy thật/quà đối tác | Liên kết hội viên, đồng bộ điểm/hạng, đổi thưởng và đối soát | Quyền kết nối hệ thống SkyJoy; điểm nội bộ demo không phải SkyPoint thật |
| Voucher Vietjet thật/GO Voucher | Phát hành, kiểm tra PIN/số dư, trừ/hoàn, tra cứu đơn và đối soát | Quyền tích hợp hệ thống phát hành; voucher nội bộ chỉ dùng trong project |
| Skyshop/hàng miễn thuế thật | Đồng bộ hàng/tồn kho, đơn, giao nhận theo chuyến | Nguồn hàng, đơn vị giao nhận và API được cấp quyền; cửa hàng nội bộ có kho/đơn riêng |
| Gửi hàng/du lịch/ngân hàng | Báo giá, tạo đơn/hồ sơ, thực hiện và cập nhật trạng thái | Nhà cung cấp tương ứng; không coi form giới thiệu là nghiệp vụ hoàn tất |

Mỗi tích hợp cần tài liệu endpoint/schema, cơ chế xác thực, môi trường sandbox, timeout/retry, callback có xác minh, quy tắc hủy/hoàn và kiểm thử đầu cuối. Secret chỉ lưu trong môi trường; không commit credentials. Chỉ thêm adapter cụ thể khi đã chọn provider và có tài liệu, không dựng lớp trừu tượng trước nhu cầu.

Nguồn khảo sát để xem lại, không phải cam kết có API công khai: [eVisa/điều hướng Vietjet](https://www.vietjetair.com/vi/e-visa), [eSIM](https://www.vietjetair.com/vi/pages/bay-khap-the-gioi-mua-ngay-esim-sieu-toc-1726636005286), [Travel Safe](https://www.vietjetair.com/vi/FAQ/faqs-travel-safe-16883976458321), [SkyJoy](https://skyjoy.vietjetair.com/cau-hoi-thuong-gap/), [SkyShop](https://skyshop.vietjetair.com/vi), [eVoucher](https://evoucher.vietjetair.com/).

SkyShop nội bộ dùng danh mục, giá, tồn kho và đơn hàng từ API của project. Hành lý, suất ăn, ưu tiên và bảo hiểm demo đi qua luồng mua thêm của booking đã xác nhận; bảo hiểm demo không phát hành hợp đồng. eSIM và Taxi chỉ hiển thị thông tin chờ tích hợp, không tạo đơn nhà cung cấp. Phần hàng hóa thật, phát hành bảo hiểm, eSIM và điều phối xe vẫn thuộc các mục trên.

eVoucher nội bộ mua/tặng theo email, thanh toán demo để phát hành, dùng số dư cho booking và hủy theo quyền của người mua. Các thẻ Combo, chào mừng thành viên và Menas là nội dung tham chiếu; không có giá/tồn phòng xác nhận, không tự cấp quà hay tạo đơn đối tác. Email gửi thật tiếp tục nằm trong mục Email/SMS.

## Sáu nút dịch vụ còn lại — cập nhật 12/10/2026

| Mục | Nghiệp vụ nội bộ đã nối | Phần còn cần nhà cung cấp |
|---|---|---|
| Khách sạn | Form điểm đến, nhận/trả phòng, phòng/khách; kiểm tra ngày; bản nháp riêng; đăng nhập quay lại trang; tạo và theo dõi ticket hỗ trợ theo tài khoản | Agoda: danh mục, giá, tồn phòng, giữ chỗ, xác nhận, thanh toán, hủy/hoàn. Link affiliate công khai hiện trả trang 404 khi đối chiếu; cần xác minh lại link trước tích hợp. |
| eSIM | Lưu quốc gia, thời gian, thiết bị và nhu cầu kiểm tra tương thích; nhân viên trao đổi trên ticket | SkyFi: gói data, giá/khả dụng theo quốc gia, mua gói, cấp QR, kích hoạt, theo dõi và hủy/hoàn. |
| eVisa | Lưu quốc tịch, điểm đến, quá cảnh và ngày đi để tư vấn; không thu hộ chiếu trong form này | Sherpa/cơ quan cấp visa: dữ liệu quy định cập nhật, hồ sơ bảo mật, lệ phí, tình trạng xử lý, quyết định cấp visa. |
| Ngoại tệ | Tra cứu booking nội bộ qua API hiện có; lưu mã booking cùng loại tiền, số tiền và nơi nhận mong muốn trong ticket | HDBank: kiểm tra PNR thật/điều kiện, tỷ giá, hạn mức, chi nhánh, xác minh hồ sơ, xác nhận giao dịch và biên nhận. |
| Bảo hiểm | Giá từ `/ancillary-services`; chọn booking đủ điều kiện (còn hơn một giờ trước khởi hành) hoặc tra cứu bằng mã/tên; chọn trước bảo hiểm ở quản lý booking; báo giá, thanh toán, lưu dịch vụ và lịch sử | Nhà bảo hiểm: điều khoản/phạm vi chính thức, số hợp đồng, chứng nhận điện tử, hiệu lực, hủy/hoàn và bồi thường. Bảo hiểm demo không phải hợp đồng thực. |
| SkyJoy | Landing, banner có giảm chuyển động, đăng ký/đăng nhập quay lại, số dư/hạng/lịch sử ví, đổi điểm thành voucher dùng trong thanh toán nội bộ | GalaxyJoy: liên kết tài khoản, SkyPoint thật, đồng bộ/đối soát điểm, danh mục quà và giao dịch đổi thưởng đối tác. |

Form tư vấn dùng `POST /api/support/tickets` với nhóm `OTHER` và khóa yêu cầu chống trùng tùy chọn; phản hồi, bổ sung và đóng yêu cầu dùng nghiệp vụ hỗ trợ hiện có. Ticket là yêu cầu tư vấn nội bộ, chưa tạo đơn hoặc xác nhận giao dịch ở nhà cung cấp. Các bản nháp nằm trong `sessionStorage`, riêng theo từng dịch vụ; yêu cầu đã gửi được lưu trên PostgreSQL theo tài khoản.

Nguồn và ảnh đối chiếu: [audit sáu dịch vụ](reference/services/audit.json), [manifest ảnh](../frontend/public/assets/services/sources.json). Không nhúng iframe/provider tracker vào bản demo; các liên kết ngoài được mở rõ ràng trên kênh nhà cung cấp.

## Nguồn dữ liệu FE/BE

Nội dung và cấu hình FE đã chuyển vào CMS backend, bao gồm các dịch vụ đối tác chưa tích hợp. Trạng thái này là nội dung quản lý trong PostgreSQL; không phải phản hồi giả từ nhà cung cấp. Số liệu vận hành lấy từ truy vấn database; giá, tồn kho, giao dịch và điểm lấy API nghiệp vụ. Chi tiết tại [BACKEND_DATA](verification/BACKEND_DATA.md).
