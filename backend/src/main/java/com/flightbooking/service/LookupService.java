package com.flightbooking.service;

import com.flightbooking.dto.request.BookingRequests.Lookup;
import com.flightbooking.dto.response.Responses.BookingView;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LookupService {
    private final RateLimitService limits;
    private final BookingService bookings;
    public BookingView lookup(Lookup input,String ip){limits.check("lookup",ip);return bookings.lookup(input);}
}
