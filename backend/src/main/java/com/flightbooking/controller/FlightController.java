package com.flightbooking.controller;

import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.service.FlightService;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@Validated
public class FlightController {
    private final FlightService service;
    @GetMapping("/search")
    public List<FlightView> search(@RequestParam @Pattern(regexp = "[A-Z]{3}") String origin,
        @RequestParam @Pattern(regexp = "[A-Z]{3}") String destination,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(defaultValue = "1") @Min(1) @Max(9) int passengers) {
        return service.search(origin, destination, date, passengers);
    }
    @GetMapping("/calendar")
    public List<CalendarPrice> calendar(@RequestParam String origin, @RequestParam String destination,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        return service.calendar(origin, destination, month);
    }
    @GetMapping("/{id}")
    public FlightView get(@PathVariable Long id) {
        return service.get(id);
    }
    @GetMapping("/{id}/fares")
    public List<FareView> fares(@PathVariable Long id) {
        return service.fareViews(id);
    }
    @GetMapping("/{id}/seats")
    public List<SeatView> seats(@PathVariable Long id) {
        return service.seatViews(id);
    }
}
