package com.flightbooking.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
public final class CommerceRequests {
    private CommerceRequests() {}
    public static final int QUANTITY_LIMIT=10, MIN_VOUCHER_VALUE=100000, MAX_VOUCHER_VALUE=2000000,
        MIN_REDEEM_POINTS=100, MAX_REDEEM_POINTS=2000, REDEMPTION_STEP=100;
    public record BuyVoucher(@NotNull @Min(MIN_VOUCHER_VALUE) @Max(MAX_VOUCHER_VALUE) Long value,@NotBlank @Email @Size(max=255) String recipientEmail,@NotNull UUID requestKey) {}
    public record Redeem(@Min(MIN_REDEEM_POINTS) @Max(MAX_REDEEM_POINTS) long points,@NotNull UUID requestKey) {}
    public record VoucherPay(@NotNull Long voucherId,@NotNull Long bookingId,@NotNull UUID requestKey) {}
    public record OrderItem(@NotNull Long productId,@Min(1) @Max(QUANTITY_LIMIT) int quantity) {}
    public record CreateOrder(@NotNull @Size(min=1,max=20) List<@NotNull @Valid OrderItem> items,
        @NotBlank @Pattern(regexp="PICKUP|ON_BOARD") String delivery,@Size(max=20) String bookingCode,@Size(max=100) String bookingToken,@NotNull UUID requestKey) {}
}
