package com.flightbooking.service;

import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.entity.AncillaryService;
import com.flightbooking.entity.ContentItem;
import com.flightbooking.enums.BookingStatus;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.time.LocalDate;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentItemRepository content;
    private final AncillaryServiceRepository services;
    private final FlightService flights;
    private final FlightRepository flightRepository;
    private final AirportRepository airports;
    private final BookingRepository bookings;
    private final UserAccountRepository users;
    public record Promotion(String origin, String destination, String originCity, String destinationCity,
        LocalDate date, java.math.BigDecimal price) {}
    public record HomeView(List<ContentView> items, List<Promotion> promotions) {}
    @Transactional(readOnly = true)
    public HomeView home() {
        return new HomeView(items(null), promotions());
    }
    @Transactional(readOnly = true)
    public List<ContentView> items(String category) {
        return (category == null ? content.findAllByOrderBySortOrderAscIdAsc()
                                 : content.findByCategoryOrderBySortOrderAsc(category))
            .stream()
            .map(this::view)
            .toList();
    }
    @Transactional(readOnly = true)
    public ContentView page(String slug) {
        return content.findByCategoryAndTarget("PAGE",slug.equals("home")?"/":"/services/"+slug)
            .map(this::view).orElseThrow(()->BusinessException.notFound("Không tìm thấy nội dung trang"));
    }
    private ContentView view(ContentItem item) {
        Map<String,Object> details=new LinkedHashMap<>(item.getDetails());
        if(details.containsKey("artwork") && (
            details.containsKey("artworkTitle") && !details.get("artworkTitle").equals(item.getTitle()) ||
            details.containsKey("artworkDescription") && !details.get("artworkDescription").equals(item.getDescription()) ||
            details.containsKey("artworkSourceImage") && !details.get("artworkSourceImage").equals(item.getImage()) ||
            details.containsKey("artworkTarget") && !details.get("artworkTarget").equals(item.getTarget()))) {
            details.remove("artwork");details.remove("displayTitle");
        }
        return new ContentView(item.getId(),item.getCategory(),item.getTitle(),item.getDescription(),item.getImage(),item.getTarget(),details);
    }
    public record Metric(String code,String label,long value) {}
    public record Statistics(List<Metric> metrics,Object titleImage,Object footerImage) {}
    @Transactional(readOnly=true)
    public Statistics statistics() {
        var start=LocalDate.now(FlightService.ZONE).atStartOfDay(FlightService.ZONE).toInstant();
        var end=LocalDate.now(FlightService.ZONE).plusDays(1).atStartOfDay(FlightService.ZONE).toInstant();
        var page=page("home");
        return new Statistics(List.of(new Metric("AIRPORTS","Sân bay trong hệ thống",airports.count()),
            new Metric("ROUTES","Đường bay đang mở",flightRepository.countRoutes(java.time.Instant.now())),
            new Metric("FLIGHTS_TODAY","Chuyến bay hôm nay",flightRepository.countDepartures(start,end)),
            new Metric("CONFIRMED_BOOKINGS","Booking đã xác nhận",bookings.countByStatus(BookingStatus.CONFIRMED)),
            new Metric("CUSTOMERS","Khách hàng đã đăng ký",users.countByRole("USER"))),
            page.details().get("statsTitleImage"),page.details().get("statsFooterImage"));
    }
    @Transactional(readOnly = true)
    public List<Promotion> promotions() {
        List<Promotion> result = new ArrayList<>();
        LocalDate date = LocalDate.now(FlightService.ZONE).plusDays(1);
        for (String destination : List.of("HAN", "DAD", "PQC", "CXR", "DLI")) {
            flights.search("SGN", destination, date, 1)
                .stream()
                .findFirst()
                .ifPresent(f
                    -> result.add(new Promotion("SGN", destination, f.origin().city(), f.destination().city(),
                        date, f.fares().getFirst().price())));
        }
        return result;
    }
    @Transactional(readOnly = true)
    public List<ServiceView> services() {
        return services.findAllByOrderByIdAsc().stream().map(ContentService::view).toList();
    }
    public static ServiceView view(AncillaryService s) {
        return new ServiceView(
            s.getId(), s.getCode(), s.getName(), s.getCategory(), s.getDescription(), s.getPrice());
    }
}
