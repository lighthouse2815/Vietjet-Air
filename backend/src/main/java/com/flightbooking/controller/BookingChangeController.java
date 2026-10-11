package com.flightbooking.controller;
import com.flightbooking.dto.request.BookingRequests.CreateBooking;
import com.flightbooking.dto.request.ChangeRequests.*;
import com.flightbooking.service.BookingChangeService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor @RequestMapping("/api/bookings/{id}")
public class BookingChangeController {
    private final BookingChangeService service;
    @GetMapping("/history") public Map<String,Object> history(@PathVariable Long id,@RequestHeader(value="X-Booking-Token",required=false) String token){return service.history(id,token);}
    @PostMapping("/changes") public BookingChangeService.ChangeView create(@PathVariable Long id,@RequestHeader(value="X-Booking-Token",required=false) String token,@Valid @RequestBody CreateBooking input){return service.create(id,token,input);}
    @PostMapping("/changes/{changeId}/pay") public BookingChangeService.ChangeView pay(@PathVariable Long id,@PathVariable Long changeId,@RequestHeader(value="X-Booking-Token",required=false) String token,@Valid @RequestBody Pay input){return service.pay(id,changeId,token,input);}
    @PostMapping("/refund") public BookingChangeService.RefundView refund(@PathVariable Long id,@RequestHeader(value="X-Booking-Token",required=false) String token,@Valid @RequestBody Refund input){return service.requestRefund(id,token,input);}
}
