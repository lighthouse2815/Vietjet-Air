package com.flightbooking.repository;
import com.flightbooking.entity.ChangePayment;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface ChangePaymentRepository extends JpaRepository<ChangePayment, Long> {
    Optional<ChangePayment> findByRequestKey(java.util.UUID requestKey);
}
