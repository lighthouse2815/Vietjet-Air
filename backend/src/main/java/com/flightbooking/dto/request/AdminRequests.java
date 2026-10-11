package com.flightbooking.dto.request;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;
public final class AdminRequests {
    private AdminRequests() {}
    public record Product(@NotBlank @Size(max=200) String name,@NotBlank @Size(max=2000) String description,
        @NotNull @DecimalMin("0") @DecimalMax("100000000") BigDecimal price,@Min(0) @Max(1000000) int stock,boolean active) {}
    public record Ancillary(@NotBlank @Pattern(regexp="[A-Z0-9_]{2,30}") String code,@NotBlank @Size(max=200) String name,
        @NotBlank @Pattern(regexp="BAGGAGE|MEAL|PRIORITY|INSURANCE") String category,@NotBlank @Size(max=255) String description,
        @NotNull @DecimalMin("0") @DecimalMax("100000000") BigDecimal price) {}
    public record Promotion(@NotBlank @Pattern(regexp="[A-Z0-9_]{2,30}") String code,@Min(1) @Max(100) int percent,
        @NotNull @DecimalMin("0") @DecimalMax("100000000") BigDecimal maxDiscount,@NotNull @FutureOrPresent LocalDate expiresOn) {}
    public record Content(@NotBlank @Pattern(regexp="HERO|FEATURE|SERVICE|SHOP|TRAVEL|DESTINATION|FAQ|MEDIA|ACHIEVEMENT") String category,
        @NotBlank @Size(max=200) String title,@NotBlank @Size(max=2000) String description,
        @NotNull @Size(max=255) String image,@NotBlank @Size(max=255) String target,@Min(0) @Max(10000) int sortOrder) {}
    public record FlightEdit(@NotBlank @Pattern(regexp="[A-Z0-9]{2,12}") String flightNumber,
        @NotBlank @Pattern(regexp="[A-Z]{3}") String origin,@NotBlank @Pattern(regexp="[A-Z]{3}") String destination,
        @NotNull @Future Instant departureTime,@NotNull @Future Instant arrivalTime,
        @Min(1) @Max(71) int capacity,@NotBlank @Size(max=200) String aircraft,
        @NotNull @DecimalMin("0") @DecimalMax("100000000") BigDecimal ecoPrice,
        @NotNull @DecimalMin("0") @DecimalMax("100000000") BigDecimal deluxePrice,
        @NotNull @DecimalMin("0") @DecimalMax("100000000") BigDecimal skybossPrice,
        @NotNull @DecimalMin("0") @DecimalMax("100000000") BigDecimal businessPrice) {}
}
