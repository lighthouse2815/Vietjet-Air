package com.flightbooking.repository;

import com.flightbooking.entity.BookingSegment;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface BookingSegmentRepository extends JpaRepository<BookingSegment, Long> {
    @Query("select coalesce(sum(s.seatedPassengers),0) from BookingSegment s where s.flight.id=:flightId and "
           + "(s.booking.status=com.flightbooking.enums.BookingStatus.CONFIRMED or "
           + "(s.booking.status=com.flightbooking.enums.BookingStatus.PENDING and s.booking.expiresAt>:now))")
    long
    reservedCount(Long flightId, Instant now);
}
