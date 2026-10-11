package com.flightbooking.repository;

import com.flightbooking.entity.Flight;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface FlightRepository extends JpaRepository<Flight,Long> {
    @EntityGraph(attributePaths={"origin","destination"})
    @Query("select f from Flight f where f.origin.code=:origin and f.destination.code=:destination and f.departureTime>=:start and f.departureTime<:end order by f.departureTime")
    List<Flight> search(String origin, String destination, Instant start, Instant end);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Flight f where f.id=:id")
    Optional<Flight> findLocked(Long id);
    boolean existsByFlightNumberAndDepartureTime(String flightNumber, Instant departureTime);
}
