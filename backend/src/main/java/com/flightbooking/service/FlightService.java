package com.flightbooking.service;

import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.entity.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FlightService {
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final FlightRepository flights;
    private final FlightFareRepository fares;
    private final FlightSeatRepository seats;
    private final BookingSegmentRepository segments;
    private final AirportRepository airports;

    @Transactional(readOnly = true)
    public List<FlightView> search(String origin, String destination, LocalDate date, int passengers) {
        validateRoute(origin, destination);
        if (date.isBefore(LocalDate.now(ZONE)) || passengers < 1 || passengers > 9)
            throw BusinessException.badRequest("Ngày bay hoặc số hành khách không hợp lệ");
        return routeFlights(origin, destination, date, date.plusDays(1))
            .stream()
            .filter(f -> f.getDepartureTime().isAfter(Instant.now()))
            .map(this::view)
            .filter(f -> f.remainingSeats() >= passengers)
            .toList();
    }
    @Transactional(readOnly = true)
    public List<CalendarPrice> calendar(String origin, String destination, LocalDate month) {
        validateRoute(origin, destination);
        LocalDate start = month.withDayOfMonth(1), end = start.plusMonths(1);
        if (start.isBefore(LocalDate.now(ZONE).withDayOfMonth(1))
            || start.isAfter(LocalDate.now(ZONE).plusMonths(12)))
            throw BusinessException.badRequest("Tháng ngoài phạm vi tìm kiếm");
        Map<LocalDate, BigDecimal> result = new TreeMap<>();
        for (Flight f : routeFlights(origin, destination, start, end)) {
            if (f.getDepartureTime().isBefore(Instant.now()) || remaining(f) <= 0)
                continue;
            List<FareView> prices = fareViews(f.getId());
            if (!prices.isEmpty())
                result.merge(f.getDepartureTime().atZone(ZONE).toLocalDate(), prices.getFirst().price(),
                    BigDecimal::min);
        }
        return result.entrySet().stream().map(e -> new CalendarPrice(e.getKey(), e.getValue())).toList();
    }
    private void validateRoute(String origin, String destination) {
        if (origin.equals(destination) || airports.findByCode(origin).isEmpty()
            || airports.findByCode(destination).isEmpty())
            throw BusinessException.badRequest("Điểm đi và điểm đến phải là hai sân bay hợp lệ, khác nhau");
    }
    private List<Flight> routeFlights(String from, String to, LocalDate start, LocalDate end) {
        return flights.search(
            from, to, start.atStartOfDay(ZONE).toInstant(), end.atStartOfDay(ZONE).toInstant());
    }
    @Transactional(readOnly = true)
    public FlightView get(Long id) {
        return view(entity(id));
    }
    public Flight entity(Long id) {
        return flights.findById(id).orElseThrow(
            () -> BusinessException.notFound("Không tìm thấy chuyến bay"));
    }
    public int remaining(Flight f) {
        return Math.max(0, f.getCapacity() - (int) segments.reservedCount(f.getId(), Instant.now()));
    }
    public FlightView view(Flight f) {
        return new FlightView(f.getId(), f.getFlightNumber(), AirportService.view(f.getOrigin()),
            AirportService.view(f.getDestination()), f.getDepartureTime(), f.getArrivalTime(),
            Duration.between(f.getDepartureTime(), f.getArrivalTime()).toMinutes(), f.getAircraft(),
            remaining(f), fareViews(f.getId()));
    }
    @Transactional(readOnly = true)
    public List<FareView> fareViews(Long id) {
        return fares.findByFlightIdOrderByPriceAsc(id)
            .stream()
            .map(f -> fareView(f.getFareClass(), f.getPrice()))
            .toList();
    }
    public static FareView fareView(FareClass c, BigDecimal price) {
        return new FareView(
            c.getCode(), c.getName(), c.getBenefits(), c.getBaggageKg(), c.isSeatIncluded(), price);
    }
    @Transactional(readOnly = true)
    public List<SeatView> seatViews(Long id) {
        entity(id);
        return seats.findByFlightIdOrderByIdAsc(id).stream().map(s -> seatView(s, null)).toList();
    }
    public static SeatView seatView(FlightSeat s, Long bookingId) {
        boolean mine =
            bookingId != null && s.getBooking() != null && bookingId.equals(s.getBooking().getId());
        boolean reserved = s.getBooking() != null
            && (s.getBooking().getStatus() == com.flightbooking.enums.BookingStatus.CONFIRMED
                || (s.getBooking().getStatus() == com.flightbooking.enums.BookingStatus.PENDING
                    && s.getBooking().getExpiresAt().isAfter(Instant.now())));
        return new SeatView(s.getSeatNumber(), s.isExtraLegroom(), s.getPrice(),
            s.isBlocked()  ? "UNAVAILABLE"
                : mine     ? "SELECTED"
                : reserved ? "RESERVED"
                           : "AVAILABLE",
            mine ? s.getPassengerIndex() : null);
    }
}
