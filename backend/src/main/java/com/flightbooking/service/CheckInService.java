package com.flightbooking.service;

import com.flightbooking.dto.request.BookingRequests.*;
import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.entity.*;
import com.flightbooking.enums.BookingStatus;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CheckInService {
    private final BookingService bookings;
    private final LookupService lookup;
    private final CheckInRepository checkIns;
    private final FlightSeatRepository seats;
    @Value("${app.check-in-open-hours}") private int opens;
    @Value("${app.check-in-close-hours}") private int closes;
    public record CheckInLookup(BookingView booking, int openHours, int closeHours) {}
    public CheckInLookup lookup(Lookup input, String ip) {
        return new CheckInLookup(lookup.lookup(input, ip), opens, closes);
    }
    @Transactional
    public BookingView complete(CheckInInput input, String token) {
        Booking b = bookings.locked(input.bookingId(), token);
        if (b.getStatus() != BookingStatus.CONFIRMED)
            throw BusinessException.conflict("Chỉ booking đã thanh toán thành công được check-in");
        bookings.validatePassengerIndex(b, input.passengerIndex());
        Flight flight =
            b.getSegments()
                .stream()
                .map(BookingSegment::getFlight)
                .filter(f -> f.getId().equals(input.flightId()))
                .findFirst()
                .orElseThrow(() -> BusinessException.badRequest("Chuyến bay không thuộc booking"));
        long until = Duration.between(Instant.now(), flight.getDepartureTime()).getSeconds();
        if (until > opens * 3600L || until < closes * 3600L)
            throw BusinessException.conflict(
                "Ngoài thời gian check-in demo (" + opens + " đến " + closes + " giờ trước khởi hành)");
        var existing = checkIns.findByBookingIdAndFlightIdAndPassengerIndex(
            b.getId(), flight.getId(), input.passengerIndex());
        if (existing.isPresent()) {
            if (!existing.get().getSeatNumber().equals(input.seatNumber()))
                throw BusinessException.conflict("Hành khách đã check-in với ghế khác");
            return bookings.view(b);
        }
        bookings.lockFlights(List.of(flight.getId()));
        var assigned = seats.findByFlightIdAndBookingIdAndPassengerIndex(
            flight.getId(), b.getId(), input.passengerIndex());
        FlightSeat seat;
        if (assigned.isPresent()) {
            seat = assigned.get();
            if (!seat.getSeatNumber().equals(input.seatNumber()))
                throw BusinessException.conflict("Vui lòng dùng ghế đã mua cho hành khách");
        } else {
            seat = bookings.availableSeat(flight.getId(), input.seatNumber());
            if (seat.isExtraLegroom())
                throw BusinessException.badRequest(
                    "Ghế đặc biệt cần được mua trước; check-in miễn phí chỉ chọn ghế tiêu chuẩn");
            seat.setBooking(b);
            seat.setPassengerIndex(input.passengerIndex());
        }
        CheckIn checkIn = new CheckIn();
        checkIn.setBooking(b);
        checkIn.setFlight(flight);
        checkIn.setPassengerIndex(input.passengerIndex());
        checkIn.setSeatNumber(seat.getSeatNumber());
        checkIn.setBoardingCode(
            "DEMO-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT));
        checkIn.setCheckedInAt(Instant.now());
        checkIns.save(checkIn);
        return bookings.view(b);
    }
}
