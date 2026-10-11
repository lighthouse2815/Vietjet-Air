package com.flightbooking.controller;

import com.flightbooking.service.CheckInService;
import com.flightbooking.dto.request.BookingRequests.*;
import com.flightbooking.dto.response.Responses.BookingView;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
public class CheckInController {
    private final CheckInService service;
    @PostMapping("/lookup") public CheckInService.CheckInLookup lookup(@Valid @RequestBody Lookup input,HttpServletRequest request){return service.lookup(input,request.getRemoteAddr());}
    @PostMapping("/complete") public BookingView complete(@Valid @RequestBody CheckInInput input,@RequestHeader(value="X-Booking-Token",required=false) String token){return service.complete(input,token);}
}
