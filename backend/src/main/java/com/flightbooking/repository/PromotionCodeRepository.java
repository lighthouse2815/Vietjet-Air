package com.flightbooking.repository;

import com.flightbooking.entity.PromotionCode;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface PromotionCodeRepository extends JpaRepository<PromotionCode, Long> {
    Optional<PromotionCode> findByCodeIgnoreCase(String code);
}
