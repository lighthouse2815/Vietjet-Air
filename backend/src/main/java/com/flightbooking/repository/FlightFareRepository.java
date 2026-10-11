package com.flightbooking.repository;

import com.flightbooking.entity.FlightFare;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface FlightFareRepository extends JpaRepository<FlightFare,Long> {
    @EntityGraph(attributePaths={"fareClass"}) List<FlightFare> findByFlightIdOrderByPriceAsc(Long flightId);
    @EntityGraph(attributePaths={"fareClass"}) Optional<FlightFare> findByFlightIdAndFareClassCode(Long flightId,String code);
}
