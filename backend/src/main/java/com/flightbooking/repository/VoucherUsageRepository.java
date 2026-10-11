package com.flightbooking.repository;
import com.flightbooking.entity.VoucherUsage;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    Optional<VoucherUsage> findByBookingId(Long bookingId);
    Optional<VoucherUsage> findByRequestKey(java.util.UUID key);
}
