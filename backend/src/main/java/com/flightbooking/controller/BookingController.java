package com.flightbooking.controller;

import com.flightbooking.dto.request.BookingRequests.*;
import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService service;
    private final LookupService lookup;
    @PostMapping("/quote")
    public PriceView quote(@Valid @RequestBody CreateBooking input) {
        return service.quote(input);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingView create(@Valid @RequestBody CreateBooking input, @AuthenticationPrincipal Jwt user) {
        return service.create(input, user == null ? null : Long.valueOf(user.getSubject()));
    }
    @GetMapping("/{code}")
    public BookingView get(
        @PathVariable String code, @RequestHeader(value = "X-Booking-Token", required = false) String token) {
        return service.get(code, token);
    }
    @PostMapping("/lookup")
    public BookingView lookup(@Valid @RequestBody Lookup input, HttpServletRequest request) {
        return lookup.lookup(input, request.getRemoteAddr());
    }
    @PostMapping("/{id}/cancel")
    public BookingView cancel(
        @PathVariable Long id, @RequestHeader(value = "X-Booking-Token", required = false) String token) {
        return service.cancel(id, token);
    }
}
