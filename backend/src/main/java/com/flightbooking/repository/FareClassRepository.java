package com.flightbooking.repository;

import com.flightbooking.entity.FareClass;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface FareClassRepository extends JpaRepository<FareClass,Long> {
    List<FareClass> findAllByOrderByIdAsc();
}
