# Danh sách component

| Nhóm | Component | Dữ liệu/hành vi |
|---|---|---|
| Layout | Header, Footer | Announcement/product/mobile navigation nằm trong Header/Footer; dropdown focus/hover, route nội bộ |
| Home | HeroCarousel, ScrollCarousel, HomePage | API `/api/home`, autoplay/fade, swipe, lazy images; dải vé/giải thưởng có điều khiển scroll và bàn phím |
| SkyShop | SkyShopStorefront, CommercePage, StatsSection | Banner, tìm kiếm/lọc, danh mục và dải dịch vụ; dialog HTML, giỏ hàng sessionStorage; API dịch vụ/sản phẩm/đơn và booking nội bộ |
| Booking | BookingForm, AirportPicker, DatePicker, PassengerPicker | API sân bay/lịch giá, validation, Escape/click outside |
| Search | FlightResultsPage, FlightCard | Fare selector trong FlightCard; API chuyến/hạng vé, chọn hai chặng, giá tạm tính |
| Checkout | BookingSteps, PassengerPage, ExtrasPage, SeatMap, PriceSummary, BookingReviewPage, PaymentPage | RHF/Zod, lưu draft, giá backend, chọn ghế/dịch vụ theo hành khách/chặng |
| Management | BookingLookupForm, BookingDetails, MyBookingPage, CheckInPage, BookingSuccessPage, AuthPage | Boarding pass trong BookingDetails; token khách, rate limit, check-in và JWT demo |
| Common | LoadingState, ErrorState, EmptyState; ContentPage, NotFoundPage | Accessible labels, focus, reduced motion; template nội dung và trang 404 |

CSS variables: màu đỏ/vàng/trời, max-width 1200px, border radius, shadow, khoảng cách. CSS theo nhóm component; không thêm thư viện animation. Router và API layer dùng chung, không hardcode nghiệp vụ chuyến bay trong React.

BookingContext chỉ giữ draft của luồng; trạng thái nhỏ nằm tại component. API layer Axios dùng `/api`; useApi cleanup AbortController, useQuote debounce/cancel, usePopup xử lý click outside/Escape. Các page checkout tải bằng React.lazy/Suspense; RHF chỉ tải ở trang hành khách, Zod dùng chung cho validation tìm chuyến và các form. Không thêm Motion hoặc CMS.

Hero dùng chín banner từ `content_items` (V3/V8), với bản desktop/mobile trong `assets/reference`. Artwork có chữ giữ tiêu đề cho trình đọc màn hình; khi ADMIN chỉnh tiêu đề/mô tả, component chuyển sang hiển thị caption HTML để nội dung mới không bị che. Dịch vụ và FAQ tùy chỉnh cũng giữ caption mới. `artwork.js` chỉ ánh xạ hình của catalog mặc định, không tính giá hay nghiệp vụ chuyến bay.

Hero fade 0,5 giây, chu kỳ 8 giây; ảnh nội dung fade 1 giây sau load. Header tự trượt thông báo mỗi 5 giây, nền mây desktop dùng background cố định, nút hỗ trợ có chu kỳ nhấp nhô 3 giây. `useReducedMotion` xử lý thay đổi cài đặt đang mở trang. `ScrollCarousel` dùng scroll-snap, ResizeObserver và API scroll có sẵn; các listener/timer/observer đều được dọn khi unmount. Bằng chứng và video nằm trong [verification/MOTION.md](verification/MOTION.md).

Nền mây bao trọn nội dung từ đặt vé phụ đến FAQ. `Footer` hiển thị dải giải thưởng ở trang chủ và SkyShop để cùng dùng một nền với nội dung footer. Thống kê có nền desktop/mobile riêng; xem [verification/BACKGROUNDS.md](verification/BACKGROUNDS.md) để đối chiếu ảnh và cách căn.

SkyShop có header phủ banner và thanh công cụ riêng; tìm kiếm mobile mở bằng nút kính lúp. `StatsSection` được dùng chung với trang chủ, dải giải thưởng dùng lại `ScrollCarousel`; SkyShop không hiển thị thanh đặt vé cố định dưới màn hình. Nền mây cố định và ảnh fade được tắt khi giảm chuyển động. Không thêm dependency.

Tìm kiếm, danh mục và cách nhận lọc catalog từ `/ancillary-services` và `/commerce/products`. Giỏ hàng giữ qua reload trong phiên, giới hạn mỗi sản phẩm theo tồn kho và tối đa 10. Booking thuộc tài khoản, đã xác nhận, chưa check-in và chưa khởi hành mới xuất hiện ở thanh chọn chuyến. Mua thêm mở quản lý booking với dịch vụ được chọn sẵn cho hành khách có ghế đầu tiên ở chặng đầu; người dùng có thể chỉnh trước khi báo giá/thanh toán. eSIM/Taxi mở thông báo chờ nhà cung cấp. Xem [verification/SKYSHOP.md](verification/SKYSHOP.md).

Ở viewport ≤900px, banner nằm trên form toàn chiều ngang; header rút gọn và navigation cố định bên dưới. Mobile giữ các ô hành khách/mã khuyến mại để thao tác đầy đủ trong demo. Các dãy card cuộn ngang bằng CSS scroll-snap; footer dùng `details/summary` thu gọn, mở được bằng bàn phím và tự hiển thị đầy đủ khi đổi sang desktop. Ảnh lazy có tỷ lệ/kích thước dự phòng để tránh đẩy các khối dưới khi tải.
