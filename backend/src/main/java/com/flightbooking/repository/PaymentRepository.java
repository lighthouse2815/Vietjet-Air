package com.flightbooking.repository;

import com.flightbooking.entity.Payment;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRequestKey(UUID requestKey);
    Optional<Payment> findByBookingIdAndStatus(Long bookingId, String status);
    Optional<Payment> findFirstByBookingIdOrderByCreatedAtDescIdDesc(Long bookingId);
}
