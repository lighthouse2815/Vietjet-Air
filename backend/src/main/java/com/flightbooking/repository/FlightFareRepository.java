package com.flightbooking.repository;

import com.flightbooking.entity.FlightFare;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface FlightFareRepository extends JpaRepository<FlightFare, Long> {
    @EntityGraph(attributePaths = {"fareClass"})
    List<FlightFare> findByFlightIdOrderByPriceAsc(Long flightId);
    @EntityGraph(attributePaths = {"fareClass"})
    Optional<FlightFare> findByFlightIdAndFareClassCode(Long flightId, String code);
}
