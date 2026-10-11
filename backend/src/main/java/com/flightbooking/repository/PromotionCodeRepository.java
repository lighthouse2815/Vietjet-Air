package com.flightbooking.repository;

import com.flightbooking.entity.PromotionCode;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface PromotionCodeRepository extends JpaRepository<PromotionCode,Long> {
    Optional<PromotionCode> findByCodeIgnoreCase(String code);
}
