package com.flightbooking.repository;

import com.flightbooking.entity.AncillaryService;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface AncillaryServiceRepository extends JpaRepository<AncillaryService,Long> {
    List<AncillaryService> findAllByOrderByIdAsc();
}
