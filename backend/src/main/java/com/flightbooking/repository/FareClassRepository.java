package com.flightbooking.repository;

import com.flightbooking.entity.FareClass;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface FareClassRepository extends JpaRepository<FareClass, Long> {
    List<FareClass> findAllByOrderByIdAsc();
}
