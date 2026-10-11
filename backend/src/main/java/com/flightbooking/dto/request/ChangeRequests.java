package com.flightbooking.dto.request;
import jakarta.validation.constraints.*;
import java.util.UUID;
public final class ChangeRequests {
    private ChangeRequests() {}
    public record Pay(@NotNull UUID requestKey,@NotBlank @Pattern(regexp="SUCCESS|FAILED|CANCELLED") String outcome) {}
    public record Refund(@NotBlank @Size(max=2000) String reason) {}
    public record RefundDecision(@NotBlank @Pattern(regexp="APPROVE|REJECT|COMPLETE") String action,@NotBlank @Size(max=2000) String note) {}
}
