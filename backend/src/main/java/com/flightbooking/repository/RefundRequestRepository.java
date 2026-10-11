package com.flightbooking.repository;
import com.flightbooking.entity.RefundRequest;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    Optional<RefundRequest> findByBookingId(Long bookingId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from RefundRequest r where r.id=:id") Optional<RefundRequest> findLocked(Long id);
}
