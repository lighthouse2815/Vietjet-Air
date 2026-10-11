# Các tích hợp nhà cung cấp cần bổ sung

Backlog được tách theo yêu cầu người dùng ngày 11/10/2026. Những mục này chưa phải chức năng giao dịch thật. Không tạo API giả hoặc hiển thị chứng từ demo như dịch vụ thật.

| Tích hợp | Nghiệp vụ cần bổ sung | Điều kiện/bằng chứng hoàn thành |
|---|---|---|
| Vé/chuyến bay thật | Đồng bộ lịch, giá, sức chứa, PNR, xuất vé và thay đổi hành trình | Hợp đồng/API được cấp quyền, sandbox; đồng bộ trạng thái và xử lý lỗi/lặp |
| Thanh toán/hoàn tiền | Tạo giao dịch, xác minh webhook, đối soát và hoàn tiền | Credentials môi trường, chữ ký, idempotency, sandbox; không lưu thông tin thẻ |
| Email/SMS | Gửi xác nhận vé, khôi phục mật khẩu, thông báo đơn/yêu cầu | Nhà cung cấp hoặc SMTP cấu hình, retry, không lộ token; outbox local chỉ dành demo |
| Khách sạn | Tồn phòng, giá, giữ phòng, xác nhận/hủy booking | API/allotment khách sạn; xác nhận thật và chính sách hủy; chưa chọn provider |
| eSIM | Danh mục quốc gia/gói, cấp eSIM/QR, kích hoạt và tra cứu | API đơn vị eSIM, sandbox, không tạo QR demo rồi tuyên bố dùng được |
| eVisa | Thông tin yêu cầu, chuyển hồ sơ, phí và cập nhật tiến độ | Dịch vụ hồ sơ được cấp quyền; quyết định visa thuộc cơ quan có thẩm quyền |
| Ngoại tệ | Tỷ giá, hồ sơ, điểm nhận, xác nhận/cấp ngoại tệ | Đơn vị thực hiện, điều kiện giao dịch và quyền tích hợp; không dùng tỷ giá mẫu cho giao dịch thật |
| Bảo hiểm | Phí, phát hành hợp đồng/chứng nhận, hủy và bồi thường | API doanh nghiệp bảo hiểm, điều kiện sản phẩm và sandbox |
| SkyJoy thật/quà đối tác | Liên kết hội viên, đồng bộ điểm/hạng, đổi thưởng và đối soát | Quyền kết nối hệ thống SkyJoy; điểm nội bộ demo không phải SkyPoint thật |
| Voucher Vietjet thật | Kiểm tra PIN/số dư, trừ/hoàn và đối soát | Quyền tích hợp hệ thống phát hành; voucher nội bộ chỉ dùng trong project |
| Skyshop/hàng miễn thuế thật | Đồng bộ hàng/tồn kho, đơn, giao nhận theo chuyến | Nguồn hàng, đơn vị giao nhận và API được cấp quyền; cửa hàng nội bộ có kho/đơn riêng |
| Gửi hàng/du lịch/ngân hàng | Báo giá, tạo đơn/hồ sơ, thực hiện và cập nhật trạng thái | Nhà cung cấp tương ứng; không coi form giới thiệu là nghiệp vụ hoàn tất |

Mỗi tích hợp cần tài liệu endpoint/schema, cơ chế xác thực, môi trường sandbox, timeout/retry, callback có xác minh, quy tắc hủy/hoàn và kiểm thử đầu cuối. Secret chỉ lưu trong môi trường; không commit credentials. Chỉ thêm adapter cụ thể khi đã chọn provider và có tài liệu, không dựng lớp trừu tượng trước nhu cầu.

Nguồn khảo sát để xem lại, không phải cam kết có API công khai: [eVisa/điều hướng Vietjet](https://www.vietjetair.com/vi/e-visa), [eSIM](https://www.vietjetair.com/vi/pages/bay-khap-the-gioi-mua-ngay-esim-sieu-toc-1726636005286), [Travel Safe](https://www.vietjetair.com/vi/FAQ/faqs-travel-safe-16883976458321), [SkyJoy](https://skyjoy.vietjetair.com/cau-hoi-thuong-gap/).
