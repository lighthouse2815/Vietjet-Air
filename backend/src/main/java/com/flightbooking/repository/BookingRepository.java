package com.flightbooking.repository;

import com.flightbooking.entity.Booking;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByCode(String code);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.id=:id")
    Optional<Booking> findLocked(Long id);
    @Query("select b.id from Booking b where b.status=com.flightbooking.enums.BookingStatus.PENDING and "
           + "b.expiresAt<:now")
    List<Long>
    findExpiredIds(Instant now);
    List<Booking> findByUserId(Long userId, Pageable pageable);
    long countByStatus(com.flightbooking.enums.BookingStatus status);
}
