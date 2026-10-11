package com.flightbooking.repository;
import com.flightbooking.entity.BookingChange;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface BookingChangeRepository extends JpaRepository<BookingChange, Long> {
    List<BookingChange> findByBookingIdOrderByIdDesc(Long bookingId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from BookingChange c where c.id=:id") Optional<BookingChange> findLocked(Long id);
    Optional<BookingChange> findByRequestKey(java.util.UUID requestKey);
}
