# Danh sách component

| Nhóm | Component | Dữ liệu/hành vi |
|---|---|---|
| Layout | Header, Footer | Announcement/product/mobile navigation nằm trong Header/Footer; dropdown focus/hover, route nội bộ |
| Home | HeroCarousel, HomePage | Hero tách component; promotion/service/feature/destination/FAQ/stats là section trong HomePage (266 dòng); API `/api/home`, autoplay, swipe, lazy images |
| Booking | BookingForm, AirportPicker, DatePicker, PassengerPicker | API sân bay/lịch giá, validation, Escape/click outside |
| Search | FlightResultsPage, FlightCard | Fare selector trong FlightCard; API chuyến/hạng vé, chọn hai chặng, giá tạm tính |
| Checkout | BookingSteps, PassengerPage, ExtrasPage, SeatMap, PriceSummary, BookingReviewPage, PaymentPage | RHF/Zod, lưu draft, giá backend, chọn ghế/dịch vụ theo hành khách/chặng |
| Management | BookingLookupForm, BookingDetails, MyBookingPage, CheckInPage, BookingSuccessPage, AuthPage | Boarding pass trong BookingDetails; token khách, rate limit, check-in và JWT demo |
| Common | LoadingState, ErrorState, EmptyState; ContentPage, NotFoundPage | Accessible labels, focus, reduced motion; template nội dung và trang 404 |

CSS variables: màu đỏ/vàng/trời, max-width 1200px, border radius, shadow, khoảng cách. CSS theo nhóm component; không thêm thư viện animation. Router và API layer dùng chung, không hardcode nghiệp vụ chuyến bay trong React.

BookingContext chỉ giữ draft của luồng; trạng thái nhỏ nằm tại component. API layer Axios dùng `/api`; useApi cleanup AbortController, useQuote debounce/cancel, usePopup xử lý click outside/Escape. Các page checkout tải bằng React.lazy/Suspense, giúp trang chủ không tải RHF/Zod ngay từ đầu. Không thêm Motion hoặc CMS.
