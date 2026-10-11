package com.flightbooking.controller;

import com.flightbooking.service.ContentService;
import com.flightbooking.dto.response.Responses.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContentController {
    private final ContentService service;
    @GetMapping("/home") public ContentService.HomeView home() { return service.home(); }
    @GetMapping("/promotions") public List<ContentService.Promotion> promotions() { return service.promotions(); }
    @GetMapping("/destinations") public List<ContentView> destinations() { return service.items("DESTINATION"); }
    @GetMapping("/ancillary-services") public List<ServiceView> ancillaries() { return service.services(); }
}
