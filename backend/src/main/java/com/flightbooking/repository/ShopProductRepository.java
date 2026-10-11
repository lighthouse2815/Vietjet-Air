package com.flightbooking.repository;
import com.flightbooking.entity.ShopProduct;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface ShopProductRepository extends JpaRepository<ShopProduct, Long> {
    List<ShopProduct> findByActiveTrueOrderByIdAsc();
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ShopProduct p where p.id=:id") Optional<ShopProduct> findLocked(Long id);
}
