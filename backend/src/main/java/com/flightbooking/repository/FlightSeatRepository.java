package com.flightbooking.repository;

import com.flightbooking.entity.FlightSeat;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface FlightSeatRepository extends JpaRepository<FlightSeat, Long> {
    List<FlightSeat> findByFlightIdOrderByIdAsc(Long flightId);
    Optional<FlightSeat> findByFlightIdAndSeatNumber(Long flightId, String seatNumber);
    List<FlightSeat> findByBookingId(Long bookingId);
    Optional<FlightSeat> findByFlightIdAndBookingIdAndPassengerIndex(
        Long flightId, Long bookingId, int passengerIndex);
}
