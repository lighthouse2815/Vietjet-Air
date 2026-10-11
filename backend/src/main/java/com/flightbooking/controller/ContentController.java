package com.flightbooking.controller;

import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.service.ContentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {
    private final ContentService service;
    private final com.flightbooking.service.BookingChangeService changes;
    private final com.flightbooking.service.BookingService bookings;
    @GetMapping("/booking-rules")
    public Object rules() { return java.util.Map.of("fares",changes.rules(),"quoteHoldMinutes",com.flightbooking.service.BookingChangeService.HOLD_SECONDS/60,"bookingHoldMinutes",bookings.holdMinutes()); }

    @GetMapping("/content/pages/{slug}")
    public ContentView page(@PathVariable String slug) { return service.page(slug); }
    @GetMapping("/site-statistics")
    public ContentService.Statistics statistics() { return service.statistics(); }
    @GetMapping("/home")
    public ContentService.HomeView home() {
        return service.home();
    }
    @GetMapping("/promotions")
    public List<ContentService.Promotion> promotions() {
        return service.promotions();
    }
    @GetMapping("/destinations")
    public List<ContentView> destinations() {
        return service.items("DESTINATION");
    }
    @GetMapping("/ancillary-services")
    public List<ServiceView> ancillaries() {
        return service.services();
    }
}
