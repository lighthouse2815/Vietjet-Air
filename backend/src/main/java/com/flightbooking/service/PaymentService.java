package com.flightbooking.service;

import com.flightbooking.dto.request.BookingRequests.DemoPayment;
import com.flightbooking.dto.response.Responses.PaymentView;
import com.flightbooking.entity.*;
import com.flightbooking.enums.BookingStatus;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.PaymentRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository payments;
    private final BookingService bookings;
    @Transactional
    public PaymentView pay(DemoPayment input, String token) {
        Booking b = bookings.locked(input.bookingId(), token);
        var previous = payments.findByRequestKey(input.requestKey());
        if (previous.isPresent()) {
            Payment old = previous.get();
            if (!old.getBooking().getId().equals(b.getId()) || !old.getStatus().equals(input.outcome()))
                throw BusinessException.conflict("Mã giao dịch đã dùng cho yêu cầu khác");
            return view(old);
        }
        if (b.getStatus() == BookingStatus.CONFIRMED && input.outcome().equals("SUCCESS"))
            return view(payments.findByBookingIdAndStatus(b.getId(), "SUCCESS").orElseThrow());
        if (b.getStatus() != BookingStatus.PENDING || b.getExpiresAt().isBefore(Instant.now()))
            throw BusinessException.conflict("Booking đã hết hạn hoặc không còn chờ thanh toán");
        bookings.lockFlights(b.getSegments().stream().map(s -> s.getFlight().getId()).toList());
        if (b.getSegments().stream().anyMatch(s -> !s.getFlight().getDepartureTime().isAfter(Instant.now())))
            throw BusinessException.conflict("Chuyến bay đã khởi hành");
        Payment payment = new Payment();
        payment.setBooking(b);
        payment.setRequestKey(input.requestKey());
        payment.setStatus(input.outcome());
        payment.setAmount(b.getTotalAmount());
        payment.setCreatedAt(Instant.now());
        payments.save(payment);
        if (input.outcome().equals("SUCCESS"))
            b.setStatus(BookingStatus.CONFIRMED);
        if (input.outcome().equals("CANCELLED")) {
            b.setStatus(BookingStatus.CANCELLED);
            bookings.releaseSeats(b);
        }
        return view(payment);
    }
    @Transactional(readOnly = true)
    public PaymentView get(Long id, String token) {
        Payment payment =
            payments.findById(id).orElseThrow(() -> BusinessException.notFound("Không tìm thấy thanh toán"));
        bookings.authorize(payment.getBooking(), token);
        return view(payment);
    }
    private PaymentView view(Payment p) {
        return new PaymentView(p.getId(), p.getBooking().getId(), p.getRequestKey(), p.getStatus(),
            p.getAmount(), p.getCreatedAt());
    }
}
