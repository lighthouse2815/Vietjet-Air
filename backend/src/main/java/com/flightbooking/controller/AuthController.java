package com.flightbooking.controller;

import com.flightbooking.service.AuthService;
import com.flightbooking.dto.request.AuthRequests.*;
import com.flightbooking.dto.response.Responses.*;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService service;
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public AuthView register(@Valid @RequestBody Register input,HttpServletRequest request){return service.register(input,request.getRemoteAddr());}
    @PostMapping("/login") public AuthView login(@Valid @RequestBody Login input,HttpServletRequest request){return service.login(input,request.getRemoteAddr());}
    @GetMapping("/me") public AuthView me(@AuthenticationPrincipal Jwt jwt){return service.me(Long.valueOf(jwt.getSubject()));}
    @GetMapping("/bookings") public List<BookingView> bookings(@AuthenticationPrincipal Jwt jwt,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return service.bookings(Long.valueOf(jwt.getSubject()),page,size);}
}
