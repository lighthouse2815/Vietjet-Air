package com.flightbooking.service;
import com.flightbooking.entity.*;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import static com.flightbooking.dto.request.CommerceRequests.*;
import java.math.*;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class LoyaltyService {
    public static final long SPEND_PER_POINT=10000, VOUCHER_VALUE_PER_POINT=1000;
    public record Tier(String code,long minimumSpend) {}
    public record Rules(long spendPerPoint,int minimumPoints,int maximumPoints,int redemptionStep,long voucherValuePerPoint,List<Tier> tiers) {}
    private static final List<Tier> TIERS=List.of(new Tier("DIAMOND",50000000),new Tier("GOLD",10000000),new Tier("SILVER",3000000),new Tier("RED",0));
    public Rules rules() { return new Rules(SPEND_PER_POINT,MIN_REDEEM_POINTS,MAX_REDEEM_POINTS,REDEMPTION_STEP,VOUCHER_VALUE_PER_POINT,TIERS); }
    private final UserAccountRepository users;
    private final PointEntryRepository entries;
    public record EntryView(Long id,long delta,String description,Instant createdAt) {}
    public record WalletView(long points,String tier,BigDecimal spend,List<EntryView> entries) {}
    @Transactional(readOnly=true)
    public WalletView wallet(Long id) {
        UserAccount u=users.findById(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy tài khoản"));
        String tier=TIERS.stream().filter(t->u.getQualifyingSpend().compareTo(BigDecimal.valueOf(t.minimumSpend()))>=0).findFirst().orElseThrow().code();
        return new WalletView(u.getPoints(),tier,u.getQualifyingSpend(),entries.findByUserIdOrderByIdDesc(id,PageRequest.of(0,100)).stream().map(e->new EntryView(e.getId(),e.getDelta(),e.getDescription(),e.getCreatedAt())).toList());
    }
    @Transactional
    public void award(Long id,String source,BigDecimal amount,String description) {
        if(id==null)return;
        UserAccount u=users.findLocked(id).orElseThrow();
        if(entries.findBySource(source).isPresent())return;
        record(u,source,amount.divideToIntegralValue(BigDecimal.valueOf(SPEND_PER_POINT)).longValueExact(),amount,description);
    }
    @Transactional
    public void reverse(String source) {
        var entry=entries.findBySource(source);if(entry.isEmpty())return;
        UserAccount u=users.findLocked(entry.get().getUser().getId()).orElseThrow();
        if(entries.findBySource("REVERSE:"+source).isPresent())return;
        record(u,"REVERSE:"+source,-entry.get().getDelta(),entry.get().getSpend().negate(),"Đảo điểm giao dịch "+source);
    }
    public void spend(UserAccount u,long points,String source) {
        if(points<MIN_REDEEM_POINTS || points%REDEMPTION_STEP!=0 || points>MAX_REDEEM_POINTS || u.getPoints()<points)
            throw BusinessException.badRequest("Đổi từ 100 đến 2.000 điểm, bội số 100 và không vượt số dư");
        record(u,source,-points,BigDecimal.ZERO,"Đổi điểm lấy voucher nội bộ");
    }
    private void record(UserAccount u,String source,long delta,BigDecimal spend,String description) {
        u.setPoints(Math.addExact(u.getPoints(),delta));u.setQualifyingSpend(u.getQualifyingSpend().add(spend).max(BigDecimal.ZERO));
        PointEntry e=new PointEntry();e.setUser(u);e.setSource(source);e.setDelta(delta);e.setSpend(spend);e.setDescription(description);e.setCreatedAt(Instant.now());entries.save(e);
    }
}
