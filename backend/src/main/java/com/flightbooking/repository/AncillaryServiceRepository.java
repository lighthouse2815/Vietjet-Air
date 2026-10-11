package com.flightbooking.repository;

import com.flightbooking.entity.AncillaryService;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface AncillaryServiceRepository extends JpaRepository<AncillaryService, Long> {
    List<AncillaryService> findAllByOrderByIdAsc();
}
