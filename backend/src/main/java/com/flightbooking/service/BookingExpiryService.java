package com.flightbooking.service;

import com.flightbooking.enums.BookingStatus;
import com.flightbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class BookingExpiryService {
    private final BookingRepository repository;
    private final BookingService bookings;
    private final TransactionTemplate transaction;
    @Scheduled(fixedDelay=60000)
    public void expire() {
        for(Long id:repository.findExpiredIds(Instant.now())) transaction.executeWithoutResult(status->{
            repository.findLocked(id).ifPresent(b->{
                if(b.getStatus()!=BookingStatus.PENDING || b.getExpiresAt().isAfter(Instant.now()))return;
                bookings.lockFlights(b.getSegments().stream().map(s->s.getFlight().getId()).toList());
                b.setStatus(BookingStatus.EXPIRED);bookings.releaseSeats(b);
            });
        });
    }
}
