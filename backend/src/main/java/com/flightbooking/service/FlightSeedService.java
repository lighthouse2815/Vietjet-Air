package com.flightbooking.service;

import com.flightbooking.entity.*;
import com.flightbooking.repository.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class FlightSeedService implements ApplicationRunner {
    private final AirportRepository airports;
    private final FlightRepository flights;
    private final FareClassRepository classes;
    private final FlightFareRepository fares;
    private final FlightSeatRepository seats;
    private final TransactionTemplate transaction;
    @Value("${app.seed-days}") private int days;

    @Override
    public void run(ApplicationArguments args) {
        extend();
    }
    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Ho_Chi_Minh")
    public void extend() {
        List<String[]> routes = new ArrayList<>();
        for (String code : List.of("HAN", "DAD", "PQC", "CXR", "DLI", "VII", "VDH", "PXU")) {
            routes.add(new String[] {"SGN", code});
            routes.add(new String[] {code, "SGN"});
        }
        for (String code : List.of("DAD", "PQC", "CXR")) {
            routes.add(new String[] {"HAN", code});
            routes.add(new String[] {code, "HAN"});
        }
        for (int day = 0; day < days; day++) {
            LocalDate date = LocalDate.now(FlightService.ZONE).plusDays(day);
            transaction.executeWithoutResult(status -> seedDay(date, routes));
        }
    }
    private void seedDay(LocalDate date, List<String[]> routes) {
        List<FareClass> fareClasses = classes.findAllByOrderByIdAsc();
        for (int routeIndex = 0; routeIndex < routes.size(); routeIndex++) {
            String[] route = routes.get(routeIndex);
            int slots = routeIndex < 2 ? 3 : 1;
            for (int slot = 0; slot < slots; slot++) {
                String number = "VJ" + (101 + routeIndex * 10 + slot);
                Instant departure =
                    date.atTime(7 + slot * 5 + (routeIndex % 3), 15).atZone(FlightService.ZONE).toInstant();
                if (flights.existsByFlightNumberAndDepartureTime(number, departure))
                    continue;
                Flight f = new Flight();
                f.setFlightNumber(number);
                f.setOrigin(airports.findByCode(route[0]).orElseThrow());
                f.setDestination(airports.findByCode(route[1]).orElseThrow());
                f.setDepartureTime(departure);
                f.setArrivalTime(departure.plusSeconds((routeIndex < 2 ? 130 : 90) * 60L));
                f.setCapacity(72);
                f.setAircraft("Airbus A320 · cấu hình demo 72 ghế");
                flights.save(f);
                int base = 490000 + (routeIndex % 5) * 100000
                    + (date.getDayOfWeek().getValue() >= 6 ? 150000 : 0) + slot * 70000;
                int[] supplements = {0, 400000, 1400000, 2900000};
                for (int i = 0; i < fareClasses.size(); i++) {
                    FlightFare fare = new FlightFare();
                    fare.setFlight(f);
                    fare.setFareClass(fareClasses.get(i));
                    fare.setPrice(BigDecimal.valueOf(base + supplements[i]));
                    fares.save(fare);
                }
                List<FlightSeat> seatRows = new ArrayList<>();
                for (int row = 1; row <= 12; row++)
                    for (char column = 'A'; column <= 'F'; column++) {
                        FlightSeat s = new FlightSeat();
                        s.setFlight(f);
                        s.setSeatNumber(row + "" + column);
                        s.setExtraLegroom(row <= 2 || row == 8);
                        s.setPrice(BigDecimal.valueOf(s.isExtraLegroom() ? 150000 : 60000));
                        s.setBlocked(row == 12 && column == 'F');
                        seatRows.add(s);
                    }
                f.setCapacity(71);
                seats.saveAll(seatRows);
            }
        }
    }
}
