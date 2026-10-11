package com.flightbooking.dto.response;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;

public final class Responses {
    private Responses() {}
    public record AirportView(Long id, String code, String city, String name, String country) {}
    public record FareView(
        String code, String name, String benefits, int baggageKg, boolean seatIncluded, BigDecimal price) {}
    public record FlightView(Long id, String flightNumber, AirportView origin, AirportView destination,
        Instant departureTime, Instant arrivalTime, long durationMinutes, String aircraft, int remainingSeats,
        List<FareView> fares) {}
    public record SeatView(
        String seatNumber, boolean extraLegroom, BigDecimal price, String status, Integer passengerIndex) {}
    public record ServiceView(
        Long id, String code, String name, String category, String description, BigDecimal price) {}
    public record
        ContentView(Long id, String category, String title, String description, String image, String target, Map<String,Object> details) {
    }
    public record CalendarPrice(LocalDate date, BigDecimal price) {}
    public record PriceView(BigDecimal baseAmount, BigDecimal taxAmount, BigDecimal extrasAmount,
        BigDecimal discountAmount, BigDecimal totalAmount, String currency) {}
    public record PassengerView(int passengerIndex, String type, String title, String lastName,
        String firstName, LocalDate dateOfBirth, String nationality) {}
    public record SegmentView(int segmentIndex, FlightView flight, FareView fare, List<SeatView> seats) {}
    public record ExtraView(Long flightId, int passengerIndex, ServiceView service, BigDecimal price) {}
    public record BoardingPassView(
        Long flightId, int passengerIndex, String seatNumber, String boardingCode, Instant checkedInAt) {}
    public record BookingView(Long id, String code, UUID accessToken, String status, String contactEmail,
        String contactPhone, Instant createdAt, Instant expiresAt, List<SegmentView> segments,
        List<PassengerView> passengers, List<ExtraView> extras, PriceView price,
        List<BoardingPassView> boardingPasses, String paymentStatus, String journeyType, boolean canPurchaseServices) {}
    public record PaymentView(
        Long id, Long bookingId, UUID requestKey, String status, BigDecimal amount, Instant createdAt) {}
    public record AuthView(String token, Long id, String email, String name, String role) {}
}
