package com.flightbooking.controller;

import com.flightbooking.service.PaymentService;
import com.flightbooking.dto.request.BookingRequests.DemoPayment;
import com.flightbooking.dto.response.Responses.PaymentView;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;
    @PostMapping("/demo") public PaymentView pay(@Valid @RequestBody DemoPayment input,@RequestHeader(value="X-Booking-Token",required=false) String token){return service.pay(input,token);}
    @GetMapping("/{id}") public PaymentView get(@PathVariable Long id,@RequestHeader(value="X-Booking-Token",required=false) String token){return service.get(id,token);}
}
