package com.flightbooking.repository;
import com.flightbooking.entity.PointEntry;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface PointEntryRepository extends JpaRepository<PointEntry, Long> {
    Optional<PointEntry> findBySource(String source);
    List<PointEntry> findByUserIdOrderByIdDesc(Long userId, org.springframework.data.domain.Pageable pageable);
}
