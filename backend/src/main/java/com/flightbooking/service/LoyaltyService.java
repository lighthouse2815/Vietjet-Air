package com.flightbooking.service;
import com.flightbooking.entity.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.math.*;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class LoyaltyService {
    private final UserAccountRepository users;
    private final PointEntryRepository entries;
    public record EntryView(Long id,long delta,String description,Instant createdAt) {}
    public record WalletView(long points,String tier,BigDecimal spend,List<EntryView> entries) {}
    @Transactional(readOnly=true)
    public WalletView wallet(Long id) {
        UserAccount u=users.findById(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy tài khoản"));
        String tier=u.getQualifyingSpend().compareTo(BigDecimal.valueOf(50000000))>=0?"DIAMOND":u.getQualifyingSpend().compareTo(BigDecimal.valueOf(10000000))>=0?"GOLD":u.getQualifyingSpend().compareTo(BigDecimal.valueOf(3000000))>=0?"SILVER":"RED";
        return new WalletView(u.getPoints(),tier,u.getQualifyingSpend(),entries.findByUserIdOrderByIdDesc(id,PageRequest.of(0,100)).stream().map(e->new EntryView(e.getId(),e.getDelta(),e.getDescription(),e.getCreatedAt())).toList());
    }
    @Transactional
    public void award(Long id,String source,BigDecimal amount,String description) {
        if(id==null)return;
        UserAccount u=users.findLocked(id).orElseThrow();
        if(entries.findBySource(source).isPresent())return;
        record(u,source,amount.divideToIntegralValue(BigDecimal.valueOf(10000)).longValueExact(),amount,description);
    }
    @Transactional
    public void reverse(String source) {
        var entry=entries.findBySource(source);if(entry.isEmpty())return;
        UserAccount u=users.findLocked(entry.get().getUser().getId()).orElseThrow();
        if(entries.findBySource("REVERSE:"+source).isPresent())return;
        record(u,"REVERSE:"+source,-entry.get().getDelta(),entry.get().getSpend().negate(),"Đảo điểm giao dịch "+source);
    }
    public void spend(UserAccount u,long points,String source) {
        if(points<100 || points%100!=0 || points>2000 || u.getPoints()<points)
            throw BusinessException.badRequest("Đổi từ 100 đến 2.000 điểm, bội số 100 và không vượt số dư");
        record(u,source,-points,BigDecimal.ZERO,"Đổi điểm lấy voucher nội bộ");
    }
    private void record(UserAccount u,String source,long delta,BigDecimal spend,String description) {
        u.setPoints(Math.addExact(u.getPoints(),delta));u.setQualifyingSpend(u.getQualifyingSpend().add(spend).max(BigDecimal.ZERO));
        PointEntry e=new PointEntry();e.setUser(u);e.setSource(source);e.setDelta(delta);e.setSpend(spend);e.setDescription(description);e.setCreatedAt(Instant.now());entries.save(e);
    }
}
