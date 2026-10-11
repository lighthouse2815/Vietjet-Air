# Danh sách component

| Nhóm | Component | Dữ liệu/hành vi |
|---|---|---|
| Layout | AnnouncementBar, Header, ProductNavigation, MobileNavigation, Footer | Đóng thông báo, dropdown, menu bàn phím, route nội bộ |
| Home | HeroCarousel, PromotionStrip, ServiceGrid, FeatureBanner, DestinationGrid, FaqCategories, Stats | API `/api/home`, autoplay, swipe, lazy images |
| Booking | BookingForm, AirportPicker, DatePicker, PassengerPicker | API sân bay/lịch giá, validation, Escape/click outside |
| Search | FlightCard, FareSelector, SearchSummary | API chuyến/hạng vé, chọn hai chặng, giá tạm tính |
| Checkout | BookingSteps, PassengerForm, SeatMap, AncillarySelector, PriceSummary | Lưu draft, giá backend, chọn ghế theo hành khách/chặng |
| Management | BookingLookupForm, BookingDetails, BoardingPass | Tra cứu có tên, token khách, rate limit, check-in demo |
| Common | LoadingState, ErrorState, EmptyState, Modal, PageTitle | Accessible labels, focus, reduced motion |

CSS variables: màu đỏ/vàng/trời, max-width 1200px, border radius, shadow, khoảng cách. CSS theo nhóm component; không thêm thư viện animation. Router và API layer dùng chung, không hardcode nghiệp vụ chuyến bay trong React.
