package com.flightbooking.controller;

import com.flightbooking.dto.response.Responses.AirportView;
import com.flightbooking.service.AirportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/airports")
@RequiredArgsConstructor
public class AirportController {
    private final AirportService service;
    @GetMapping
    public List<AirportView> list(@RequestParam(defaultValue = "") String q) {
        return service.search(q);
    }
}
