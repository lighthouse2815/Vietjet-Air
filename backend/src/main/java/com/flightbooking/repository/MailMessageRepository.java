package com.flightbooking.repository;
import com.flightbooking.entity.MailMessage;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface MailMessageRepository extends JpaRepository<MailMessage, Long> {

}
