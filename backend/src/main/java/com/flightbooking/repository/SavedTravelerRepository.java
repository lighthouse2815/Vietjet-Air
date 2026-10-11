package com.flightbooking.repository;
import com.flightbooking.entity.SavedTraveler;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface SavedTravelerRepository extends JpaRepository<SavedTraveler, Long> {
    List<SavedTraveler> findByUserIdOrderByIdDesc(Long userId);
}
