package com.flightbooking.service;

import com.flightbooking.dto.response.Responses.*;
import com.flightbooking.entity.AncillaryService;
import com.flightbooking.repository.*;
import java.time.LocalDate;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentItemRepository content;
    private final AncillaryServiceRepository services;
    private final FlightService flights;
    public record Promotion(String origin, String destination, String originCity, String destinationCity,
        LocalDate date, java.math.BigDecimal price) {}
    public record HomeView(List<ContentView> items, List<Promotion> promotions) {}
    @Transactional(readOnly = true)
    public HomeView home() {
        return new HomeView(items(null), promotions());
    }
    @Transactional(readOnly = true)
    public List<ContentView> items(String category) {
        return (category == null ? content.findAllByOrderBySortOrderAscIdAsc()
                                 : content.findByCategoryOrderBySortOrderAsc(category))
            .stream()
            .map(c
                -> new ContentView(c.getId(), c.getCategory(), c.getTitle(), c.getDescription(), c.getImage(),
                    c.getTarget()))
            .toList();
    }
    @Transactional(readOnly = true)
    public List<Promotion> promotions() {
        List<Promotion> result = new ArrayList<>();
        LocalDate date = LocalDate.now(FlightService.ZONE).plusDays(1);
        for (String destination : List.of("HAN", "DAD", "PQC", "CXR", "DLI")) {
            flights.search("SGN", destination, date, 1)
                .stream()
                .findFirst()
                .ifPresent(f
                    -> result.add(new Promotion("SGN", destination, f.origin().city(), f.destination().city(),
                        date, f.fares().getFirst().price())));
        }
        return result;
    }
    @Transactional(readOnly = true)
    public List<ServiceView> services() {
        return services.findAllByOrderByIdAsc().stream().map(ContentService::view).toList();
    }
    public static ServiceView view(AncillaryService s) {
        return new ServiceView(
            s.getId(), s.getCode(), s.getName(), s.getCategory(), s.getDescription(), s.getPrice());
    }
}
