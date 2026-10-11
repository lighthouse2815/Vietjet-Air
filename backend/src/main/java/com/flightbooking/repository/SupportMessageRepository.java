package com.flightbooking.repository;
import com.flightbooking.entity.SupportMessage;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    List<SupportMessage> findByTicketIdOrderByIdAsc(Long ticketId);
}
