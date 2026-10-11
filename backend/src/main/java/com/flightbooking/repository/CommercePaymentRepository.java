package com.flightbooking.repository;
import com.flightbooking.entity.CommercePayment;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface CommercePaymentRepository extends JpaRepository<CommercePayment, Long> {
    Optional<CommercePayment> findByRequestKey(java.util.UUID key);
}
