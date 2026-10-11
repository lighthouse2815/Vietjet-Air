package com.flightbooking.repository;

import com.flightbooking.entity.FlightFare;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface FlightFareRepository extends JpaRepository<FlightFare, Long> {
    @EntityGraph(attributePaths = {"fareClass"})
    List<FlightFare> findByFlightIdOrderByPriceAsc(Long flightId);
    @EntityGraph(attributePaths = {"fareClass"})
    List<FlightFare> findByFlightIdInOrderByFlightIdAscPriceAsc(List<Long> flightIds);
    @EntityGraph(attributePaths = {"fareClass"})
    Optional<FlightFare> findByFlightIdAndFareClassCode(Long flightId, String code);
}
