package com.flightbooking.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
public final class CommerceRequests {
    private CommerceRequests() {}
    public record BuyVoucher(@NotNull @Min(100000) @Max(2000000) Long value,@NotBlank @Email @Size(max=255) String recipientEmail,@NotNull UUID requestKey) {}
    public record Redeem(@Min(100) @Max(2000) long points,@NotNull UUID requestKey) {}
    public record VoucherPay(@NotNull Long voucherId,@NotNull Long bookingId,@NotNull UUID requestKey) {}
    public record OrderItem(@NotNull Long productId,@Min(1) @Max(10) int quantity) {}
    public record CreateOrder(@NotNull @Size(min=1,max=20) List<@NotNull @Valid OrderItem> items,
        @NotBlank @Pattern(regexp="PICKUP|ON_BOARD") String delivery,@Size(max=20) String bookingCode,@Size(max=100) String bookingToken,@NotNull UUID requestKey) {}
}
