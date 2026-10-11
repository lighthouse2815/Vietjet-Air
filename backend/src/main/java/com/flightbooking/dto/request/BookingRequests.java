package com.flightbooking.dto.request;

import com.flightbooking.enums.PassengerType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class BookingRequests {
    private BookingRequests() {}
    public record PassengerInput(@NotNull PassengerType type, @NotBlank @Size(max = 20) String title,
        @NotBlank @Size(max = 100) String lastName, @NotBlank @Size(max = 100) String firstName,
        @NotNull @PastOrPresent LocalDate dateOfBirth, @NotBlank @Size(max = 100) String nationality) {}
    public record SeatInput(
        @Min(0) int passengerIndex, @NotBlank @Pattern(regexp = "[1-9][0-9]?[A-F]") String seatNumber) {}
    public record ExtraInput(@NotNull Long serviceId, @Min(0) int passengerIndex) {}
    public record SegmentInput(@NotNull Long flightId, @NotBlank String fareCode,
        @NotNull @Size(max = 9) List<@NotNull @Valid SeatInput> seats,
        @NotNull @Size(max = 40) List<@NotNull @Valid ExtraInput> extras) {}
    public record CreateBooking(@NotNull @Size(min = 1, max = 2) List<@NotNull @Valid SegmentInput> segments,
        @NotNull @Size(min = 1, max = 9) List<@NotNull @Valid PassengerInput> passengers,
        @NotBlank @Email @Size(max = 255) String contactEmail,
        @NotBlank @Pattern(regexp = "[+0-9 ()-]{8,20}") String contactPhone,
        @Size(max = 30) String promotionCode) {}
    public record Lookup(@NotBlank @Size(max = 20) String bookingCode,
        @NotBlank @Size(max = 100) String lastName, @NotBlank @Size(max = 100) String firstName) {}
    public record DemoPayment(@NotNull Long bookingId, @NotNull UUID requestKey,
        @NotBlank @Pattern(regexp = "SUCCESS|FAILED|CANCELLED") String outcome) {}
    public record CheckInInput(@NotNull Long bookingId, @NotNull Long flightId, @Min(0) int passengerIndex,
        @NotBlank @Pattern(regexp = "[1-9][0-9]?[A-F]") String seatNumber,
        @AssertTrue boolean acceptedConditions) {}
}
