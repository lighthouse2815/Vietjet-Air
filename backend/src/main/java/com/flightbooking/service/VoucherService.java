package com.flightbooking.service;
import com.flightbooking.dto.request.CommerceRequests.*;
import com.flightbooking.dto.request.ChangeRequests.Pay;
import com.flightbooking.dto.request.BookingRequests.DemoPayment;
import com.flightbooking.entity.*;
import com.flightbooking.enums.BookingStatus;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class VoucherService {
    public static final int HOLD_SECONDS=900, VALIDITY_DAYS=365;
    private final GiftVoucherRepository vouchers;
    private final VoucherUsageRepository usages;
    private final CommercePaymentRepository receipts;
    private final UserAccountRepository users;
    private final BookingService bookings;
    private final PaymentService payments;
    private final LoyaltyService loyalty;
    public record VoucherView(Long id,UUID code,String recipientEmail,String status,BigDecimal value,BigDecimal balance,Instant expiresAt,boolean reward,boolean purchased) {}
    @Transactional(readOnly=true)
    public List<VoucherView> list(Long id) {UserAccount u=users.findById(id).orElseThrow();return vouchers.list(id,u.getEmail()).stream().map(v->view(v,id)).toList();}
    @Transactional
    public VoucherView buy(Long id,BuyVoucher input) {
        UserAccount buyer=users.findLocked(id).orElseThrow();var previous=vouchers.findByRequestKey(input.requestKey());
        if(previous.isPresent()) {GiftVoucher v=previous.get();if(!v.getBuyer().getId().equals(id)||v.getValue().compareTo(BigDecimal.valueOf(input.value()))!=0||!v.getRecipientEmail().equalsIgnoreCase(input.recipientEmail().trim()))throw BusinessException.conflict("Mã yêu cầu đã dùng");return view(v,id);}
        return view(issue(buyer,input.value(),input.recipientEmail().trim().toLowerCase(Locale.ROOT),input.requestKey(),false),id);
    }
    private GiftVoucher issue(UserAccount buyer,long value,String email,UUID key,boolean reward) {
        GiftVoucher v=new GiftVoucher();v.setCode(UUID.randomUUID());v.setBuyer(buyer);v.setRecipientEmail(email);v.setValue(BigDecimal.valueOf(value));
        v.setBalance(reward?v.getValue():BigDecimal.ZERO);v.setStatus(reward?"ACTIVE":"PENDING");v.setReward(reward);v.setRequestKey(key);v.setCreatedAt(Instant.now());v.setExpiresAt(Instant.now().plusSeconds(VALIDITY_DAYS*86400L));return vouchers.save(v);
    }
    @Transactional
    public VoucherView redeem(Long id,Redeem input) {
        UserAccount u=users.findLocked(id).orElseThrow();var previous=vouchers.findByRequestKey(input.requestKey());
        if(previous.isPresent()){GiftVoucher v=previous.get();if(!v.getBuyer().getId().equals(id)||!v.isReward()||v.getValue().compareTo(BigDecimal.valueOf(input.points()*LoyaltyService.VOUCHER_VALUE_PER_POINT))!=0)throw BusinessException.conflict("Mã yêu cầu đã dùng");return view(v,id);}
        loyalty.spend(u,input.points(),"REDEEM:"+input.requestKey());return view(issue(u,input.points()*LoyaltyService.VOUCHER_VALUE_PER_POINT,u.getEmail(),input.requestKey(),true),id);
    }
    @Transactional
    public VoucherView pay(Long userId,Long id,Pay input) {
        GiftVoucher v=ownedBuyer(userId,id);
        if(replayed("VOUCHER",id,input))return view(v,userId);
        if(v.getStatus().equals("ACTIVE")&&input.outcome().equals("SUCCESS"))return view(v,userId);
        if(!List.of("PENDING","FAILED").contains(v.getStatus()) || v.getCreatedAt().plusSeconds(HOLD_SECONDS).isBefore(Instant.now()))throw BusinessException.conflict("Đơn voucher đã hết hạn hoặc đã xử lý");
        if(input.outcome().equals("SUCCESS")){v.setStatus("ACTIVE");v.setBalance(v.getValue());v.setExpiresAt(Instant.now().plusSeconds(VALIDITY_DAYS*86400L));}
        else v.setStatus(input.outcome().equals("CANCELLED")?"CANCELLED":"FAILED");
        receipt("VOUCHER",id,input,v.getValue());return view(v,userId);
    }
    @Transactional
    public VoucherView cancel(Long userId,Long id) {
        GiftVoucher v=ownedBuyer(userId,id);if(v.getStatus().equals("CANCELLED"))return view(v,userId);
        if(v.isReward()||v.getStatus().equals("ACTIVE")&&v.getBalance().compareTo(v.getValue())!=0)throw BusinessException.conflict("Không hủy voucher thưởng hoặc voucher đã sử dụng");
        v.setStatus("CANCELLED");v.setBalance(BigDecimal.ZERO);return view(v,userId);
    }
    @Transactional
    public com.flightbooking.dto.response.Responses.PaymentView payBooking(Long userId,VoucherPay input,String token) {
        Booking b=bookings.locked(input.bookingId(),token);
        var prior=usages.findByRequestKey(input.requestKey());
        if(prior.isPresent()&&(!prior.get().getBooking().getId().equals(b.getId())||!prior.get().getVoucher().getId().equals(input.voucherId())))throw BusinessException.conflict("Mã giao dịch đã dùng");
        GiftVoucher v=vouchers.findLocked(input.voucherId()).orElseThrow(()->BusinessException.notFound("Không tìm thấy voucher"));
        UserAccount user=users.findById(userId).orElseThrow();
        if(!v.getRecipientEmail().equalsIgnoreCase(user.getEmail()))throw AccountService.forbidden();
        if(b.getStatus()==BookingStatus.CONFIRMED)return payments.pay(new DemoPayment(b.getId(),input.requestKey(),"SUCCESS"),token);
        if(b.getStatus()!=BookingStatus.PENDING||!b.getExpiresAt().isAfter(Instant.now()))throw BusinessException.conflict("Booking không còn chờ thanh toán");
        if(!v.getStatus().equals("ACTIVE")||!v.getExpiresAt().isAfter(Instant.now())||v.getBalance().signum()<=0)throw BusinessException.conflict("Voucher không còn hiệu lực hoặc hết số dư");
        BigDecimal amount=v.getBalance().min(b.getTotalAmount());v.setBalance(v.getBalance().subtract(amount));
        VoucherUsage usage=new VoucherUsage();usage.setVoucher(v);usage.setBooking(b);usage.setAmount(amount);usage.setRequestKey(input.requestKey());usage.setCreatedAt(Instant.now());usages.saveAndFlush(usage);
        return payments.pay(new DemoPayment(b.getId(),input.requestKey(),"SUCCESS"),token);
    }
    @Transactional
    public void refundBooking(Long bookingId,BigDecimal refund) {
        usages.findByBookingId(bookingId).ifPresent(usage->{
            GiftVoucher v=vouchers.findLocked(usage.getVoucher().getId()).orElseThrow();
            if(!usage.isRefunded()){v.setBalance(v.getBalance().add(usage.getAmount().min(refund)));usage.setRefunded(true);}
        });
    }
    public BigDecimal voucherAmount(Long bookingId) {return usages.findByBookingId(bookingId).map(VoucherUsage::getAmount).orElse(BigDecimal.ZERO);}
    private GiftVoucher ownedBuyer(Long userId,Long id) {GiftVoucher v=vouchers.findLocked(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy voucher"));if(!v.getBuyer().getId().equals(userId))throw AccountService.forbidden();return v;}
    public boolean replayed(String kind,Long id,Pay input) {
        var old=receipts.findByRequestKey(input.requestKey());if(old.isEmpty())return false;
        if(!old.get().getKind().equals(kind)||!old.get().getPurchaseId().equals(id)||!old.get().getOutcome().equals(input.outcome()))throw BusinessException.conflict("Mã giao dịch đã dùng cho yêu cầu khác");return true;
    }
    public void receipt(String kind,Long id,Pay input,BigDecimal amount) {CommercePayment p=new CommercePayment();p.setKind(kind);p.setPurchaseId(id);p.setRequestKey(input.requestKey());p.setOutcome(input.outcome());p.setAmount(amount);p.setCreatedAt(Instant.now());receipts.save(p);}
    private VoucherView view(GiftVoucher v,Long userId) {String status=v.getStatus();if(status.equals("ACTIVE")&&!v.getExpiresAt().isAfter(Instant.now())||List.of("PENDING","FAILED").contains(status)&&!v.getCreatedAt().plusSeconds(HOLD_SECONDS).isAfter(Instant.now()))status="EXPIRED";return new VoucherView(v.getId(),v.getCode(),v.getRecipientEmail(),status,v.getValue(),v.getBalance(),v.getExpiresAt(),v.isReward(),v.getBuyer().getId().equals(userId));}
}
