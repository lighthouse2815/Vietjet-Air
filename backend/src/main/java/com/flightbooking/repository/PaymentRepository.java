package com.flightbooking.repository;

import com.flightbooking.entity.Payment;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
    Optional<Payment> findByRequestKey(UUID requestKey);
    Optional<Payment> findByBookingIdAndStatus(Long bookingId,String status);
    Optional<Payment> findFirstByBookingIdOrderByCreatedAtDescIdDesc(Long bookingId);
}
