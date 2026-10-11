package com.flightbooking.repository;
import com.flightbooking.entity.GiftVoucher;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
public interface GiftVoucherRepository extends JpaRepository<GiftVoucher, Long> {
    @Query("select v from GiftVoucher v where v.buyer.id=:userId or lower(v.recipientEmail)=lower(:email) order by v.id desc")
    List<GiftVoucher> list(Long userId,String email);
    Optional<GiftVoucher> findByRequestKey(java.util.UUID key);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from GiftVoucher v where v.id=:id") Optional<GiftVoucher> findLocked(Long id);
}
