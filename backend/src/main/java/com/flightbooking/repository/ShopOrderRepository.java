package com.flightbooking.repository;
import com.flightbooking.entity.ShopOrder;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {
    List<ShopOrder> findByUserIdOrderByIdDesc(Long userId, org.springframework.data.domain.Pageable pageable);
    Optional<ShopOrder> findByRequestKey(java.util.UUID key);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from ShopOrder o where o.id=:id") Optional<ShopOrder> findLocked(Long id);
    @Query("select o.id from ShopOrder o where o.status in ('PENDING','FAILED') and o.expiresAt<:now") List<Long> expired(java.time.Instant now);
}
