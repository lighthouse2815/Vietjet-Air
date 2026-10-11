package com.flightbooking.service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flightbooking.dto.request.BookingRequests.*;
import com.flightbooking.dto.request.ChangeRequests.*;
import com.flightbooking.entity.*;
import com.flightbooking.enums.BookingStatus;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.*;
import java.math.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class BookingChangeService {
    private final BookingService bookings;
    private final BookingChangeRepository changes;
    private final ChangePaymentRepository payments;
    private final RefundRequestRepository refunds;
    private final CheckInRepository checkIns;
    private final ObjectMapper json;
    private final PricingService pricing;
    public record ChangeView(Long id,String status,BigDecimal amount,BigDecimal fee,BigDecimal targetAmount,
        Instant createdAt,Instant expiresAt,CreateBooking requested) {}
    public record RefundView(Long id,Long bookingId,String status,String reason,String staffNote,
        BigDecimal amount,BigDecimal fee,Instant createdAt,Instant completedAt) {}
    @Transactional
    public ChangeView create(Long id,String token,CreateBooking input) {
        Booking b=bookings.locked(id,token);
        bookings.lockFlights(java.util.stream.Stream.concat(b.getSegments().stream().map(s->s.getFlight().getId()),input.segments().stream().map(SegmentInput::flightId)).toList());
        var price=bookings.quoteChange(b,input);
        BigDecimal fee=BigDecimal.ZERO;
        for(int i=0;i<input.segments().size();i++) {
            var old=b.getSegments().get(i);var target=input.segments().get(i);
            if(!old.getFlight().getId().equals(target.flightId()) || !old.getFareClass().getCode().equals(target.fareCode()))
                fee=fee.add(BigDecimal.valueOf((old.getFareClass().getCode().equals("ECO")?100000:old.getFareClass().getCode().equals("DELUXE")?50000:0)*old.getSeatedPassengers()));
        }
        BookingChange c=new BookingChange();c.setBooking(b);c.setPayload(encode(input));c.setRevision(b.getRevision());
        c.setAmount(price.totalAmount().subtract(b.getTotalAmount()).max(BigDecimal.ZERO).add(fee));c.setFee(fee);c.setTargetAmount(price.totalAmount());
        c.setStatus("PENDING");c.setCreatedAt(Instant.now());c.setExpiresAt(Instant.now().plusSeconds(900));return view(changes.save(c));
    }
    @Transactional
    public Map<String,Object> history(Long id,String token) {
        Booking b=bookings.locked(id,token);
        return Map.of("changes",changes.findByBookingIdOrderByIdDesc(id).stream().map(this::view).toList(),
            "refunds",refunds.findByBookingId(b.getId()).stream().map(this::view).toList());
    }
    @Transactional
    public ChangeView pay(Long id,Long changeId,String token,Pay input) {
        Booking b=bookings.locked(id,token);
        BookingChange c=changes.findLocked(changeId).orElseThrow(()->BusinessException.notFound("Không tìm thấy báo giá thay đổi"));
        if(!c.getBooking().getId().equals(b.getId())) throw AccountService.forbidden();
        var previous=payments.findByRequestKey(input.requestKey());
        if(previous.isPresent()) {
            if(!previous.get().getChange().getId().equals(changeId)||!previous.get().getStatus().equals(input.outcome())) throw BusinessException.conflict("Mã giao dịch đã dùng cho yêu cầu khác");
            return view(c);
        }
        if(c.getStatus().equals("SUCCESS") && input.outcome().equals("SUCCESS")) return view(c);
        if(!List.of("PENDING","FAILED").contains(c.getStatus()) || !c.getExpiresAt().isAfter(Instant.now()) || c.getRevision()!=b.getRevision())
            throw BusinessException.conflict("Báo giá hết hạn hoặc booking đã thay đổi. Vui lòng báo giá lại.");
        bookings.mutable(b);
        if(input.outcome().equals("SUCCESS")) {
            CreateBooking requested=decode(c.getPayload());
            bookings.lockFlights(java.util.stream.Stream.concat(b.getSegments().stream().map(s->s.getFlight().getId()),requested.segments().stream().map(SegmentInput::flightId)).toList());
            if(bookings.quoteChange(b,requested).totalAmount().compareTo(c.getTargetAmount())!=0)
                throw BusinessException.conflict("Giá dịch vụ đã thay đổi. Vui lòng báo giá lại.");
            bookings.applyChange(b,requested,c.getFee());c.setRequestKey(input.requestKey());
        }
        ChangePayment payment=new ChangePayment();payment.setChange(c);payment.setRequestKey(input.requestKey());
        payment.setStatus(input.outcome());payment.setAmount(c.getAmount());payment.setCreatedAt(Instant.now());payments.save(payment);
        c.setStatus(input.outcome());return view(c);
    }
    @Transactional
    public RefundView requestRefund(Long id,String token,Refund input) {
        Booking b=bookings.locked(id,token);
        if(!List.of(BookingStatus.CONFIRMED,BookingStatus.CANCELLED).contains(b.getStatus()) ||
            !checkIns.findByBookingId(id).isEmpty() || b.getSegments().stream().anyMatch(s->!s.getFlight().getDepartureTime().isAfter(Instant.now().plusSeconds(3600))))
            throw BusinessException.conflict("Chỉ hoàn vé đã thanh toán, chưa check-in và trước khởi hành ít nhất một giờ");
        RefundRequest r=refunds.findByBookingId(id).orElseGet(RefundRequest::new);
        if(r.getId()!=null && !r.getStatus().equals("REJECTED")) return view(r);
        BigDecimal multiplier=b.getPassengers().stream().map(p->pricing.passengerMultiplier(p.getType())).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal fee=b.getSegments().stream().map(s->s.getUnitPrice().multiply(multiplier).multiply(
            new BigDecimal(s.getFareClass().getCode().equals("ECO")?"0.20":s.getFareClass().getCode().equals("DELUXE")?"0.10":"0"))).reduce(b.getAdjustmentAmount(),BigDecimal::add).setScale(2,RoundingMode.HALF_UP).min(b.getTotalAmount());
        r.setBooking(b);r.setStatus("REQUESTED");r.setReason(input.reason().trim());r.setStaffNote(null);r.setCompletedAt(null);
        r.setFee(fee);r.setAmount(b.getTotalAmount().subtract(fee));r.setCreatedAt(Instant.now());return view(refunds.save(r));
    }
    @Transactional
    public RefundView decide(Long id,RefundDecision input) {
        RefundRequest snapshot=refunds.findById(id).orElseThrow(()->BusinessException.notFound("Không tìm thấy yêu cầu hoàn"));
        Booking b=bookings.locked(snapshot.getBooking().getId(),snapshot.getBooking().getAccessToken().toString());
        RefundRequest r=refunds.findLocked(id).orElseThrow();
        if(input.action().equals("COMPLETE") && r.getStatus().equals("COMPLETED")) return view(r);
        if(input.action().equals("COMPLETE")) {
            if(!r.getStatus().equals("APPROVED")) throw BusinessException.conflict("Chỉ hoàn tiền yêu cầu đã được duyệt");
            r.setStatus("COMPLETED");r.setCompletedAt(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS));
        } else {
            if(!r.getStatus().equals("REQUESTED")) throw BusinessException.conflict("Yêu cầu đã được xử lý");
            if(input.action().equals("APPROVE")) {
                if(!checkIns.findByBookingId(b.getId()).isEmpty()) throw BusinessException.conflict("Booking đã check-in");
                bookings.lockFlights(b.getSegments().stream().map(s->s.getFlight().getId()).toList());
                b.setStatus(BookingStatus.CANCELLED);b.setRevision(b.getRevision()+1);bookings.releaseSeats(b);r.setStatus("APPROVED");
            } else r.setStatus("REJECTED");
        }
        r.setStaffNote(input.note().trim());return view(r);
    }
    public RefundView view(RefundRequest r) {return new RefundView(r.getId(),r.getBooking().getId(),r.getStatus(),r.getReason(),r.getStaffNote(),r.getAmount(),r.getFee(),r.getCreatedAt(),r.getCompletedAt());}
    private ChangeView view(BookingChange c) {return new ChangeView(c.getId(),List.of("PENDING","FAILED").contains(c.getStatus())&&!c.getExpiresAt().isAfter(Instant.now())?"EXPIRED":c.getStatus(),c.getAmount(),c.getFee(),c.getTargetAmount(),c.getCreatedAt(),c.getExpiresAt(),decode(c.getPayload()));}
    private String encode(CreateBooking input) {try{return json.writeValueAsString(input);}catch(JsonProcessingException e){throw new IllegalStateException(e);}}
    private CreateBooking decode(String payload) {try{return json.readValue(payload,CreateBooking.class);}catch(JsonProcessingException e){throw new IllegalStateException(e);}}
}
