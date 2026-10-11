package com.flightbooking.repository;

import com.flightbooking.entity.BookingSegment;
import java.time.Instant;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface BookingSegmentRepository extends JpaRepository<BookingSegment, Long> {
    interface ReservedFlight {
        Long getFlightId();
        Long getReservedSeats();
    }

    @Query("select s.flight.id as flightId, sum(s.seatedPassengers) as reservedSeats "
        + "from BookingSegment s where s.flight.id in :flightIds and "
        + "(s.booking.status=com.flightbooking.enums.BookingStatus.CONFIRMED or "
        + "(s.booking.status=com.flightbooking.enums.BookingStatus.PENDING and s.booking.expiresAt>:now)) "
        + "group by s.flight.id")
    List<ReservedFlight>
    reservedCounts(List<Long> flightIds, Instant now);

    @Query("select coalesce(sum(s.seatedPassengers),0) from BookingSegment s where s.flight.id=:flightId and "
        + "(s.booking.status=com.flightbooking.enums.BookingStatus.CONFIRMED or "
        + "(s.booking.status=com.flightbooking.enums.BookingStatus.PENDING and s.booking.expiresAt>:now))")
    long
    reservedCount(Long flightId, Instant now);
}
