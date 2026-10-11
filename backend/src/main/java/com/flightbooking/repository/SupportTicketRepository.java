package com.flightbooking.repository;
import com.flightbooking.entity.SupportTicket;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByUserIdOrderByIdDesc(Long userId, Pageable pageable);
    Optional<SupportTicket> findByUserIdAndRequestKey(Long userId, String requestKey);
}
