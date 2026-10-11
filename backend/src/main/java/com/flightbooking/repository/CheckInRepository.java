package com.flightbooking.repository;

import com.flightbooking.entity.CheckIn;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    Optional<CheckIn> findByBookingIdAndFlightIdAndPassengerIndex(
        Long bookingId, Long flightId, int passengerIndex);
    List<CheckIn> findByBookingId(Long bookingId);
}
