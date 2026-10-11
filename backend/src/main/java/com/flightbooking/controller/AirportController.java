package com.flightbooking.controller;

import com.flightbooking.service.AirportService;
import com.flightbooking.dto.response.Responses.AirportView;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/airports")
@RequiredArgsConstructor
public class AirportController {
    private final AirportService service;
    @GetMapping public List<AirportView> list(@RequestParam(defaultValue="") String q) { return service.search(q); }
}
