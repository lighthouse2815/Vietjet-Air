package com.flightbooking.dto.request;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public final class AccountRequests {
    private AccountRequests() {}
    public record Profile(@NotBlank @Size(max=100) String name, @Pattern(regexp="[+0-9 ()-]{8,20}") String phone) {}
    public record Password(@NotBlank @Size(max=72) String currentPassword, @NotBlank @Size(min=8,max=72) String newPassword) {}
    public record ResetStart(@NotBlank @Email @Size(max=255) String email) {}
    public record ResetFinish(@NotBlank @Size(max=100) String token, @NotBlank @Size(min=8,max=72) String password) {}
    public record Traveler(@NotBlank @Pattern(regexp="ADULT|CHILD|INFANT") String type,
        @NotBlank @Pattern(regexp="MR|MS|MSTR|MISS") String title, @NotBlank @Size(max=100) String lastName,
        @NotBlank @Size(max=100) String firstName, @NotNull @PastOrPresent LocalDate dateOfBirth,
        @NotBlank @Size(max=100) String nationality) {}
    public record Ticket(@NotBlank @Size(max=200) String subject,
        @NotBlank @Pattern(regexp="BOOKING|PAYMENT|BAGGAGE|OTHER") String category,
        @NotBlank @Size(max=4000) String body) {}
    public record Reply(@NotBlank @Size(max=4000) String body) {}
}
