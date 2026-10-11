package com.flightbooking.repository;

import com.flightbooking.entity.Airport;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface AirportRepository extends JpaRepository<Airport,Long> {
    List<Airport> findAllByOrderByCityAsc();
    Optional<Airport> findByCode(String code);
}
