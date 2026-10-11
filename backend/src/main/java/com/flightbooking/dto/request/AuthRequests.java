package com.flightbooking.dto.request;

import jakarta.validation.constraints.*;

public final class AuthRequests {
    private AuthRequests() {}
    public record Register(@NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 72) String password, @NotBlank @Size(max = 100) String name) {}
    public record
        Login(@NotBlank @Email @Size(max = 255) String email, @NotBlank @Size(max = 72) String password) {}
}
