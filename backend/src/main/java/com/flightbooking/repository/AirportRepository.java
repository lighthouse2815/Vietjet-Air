package com.flightbooking.repository;

import com.flightbooking.entity.Airport;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface AirportRepository extends JpaRepository<Airport, Long> {
    List<Airport> findAllByOrderByCityAsc();
    Optional<Airport> findByCode(String code);
}
