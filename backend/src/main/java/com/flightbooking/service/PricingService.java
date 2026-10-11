package com.flightbooking.service;

import com.flightbooking.dto.response.Responses.PriceView;
import com.flightbooking.entity.Booking;
import com.flightbooking.entity.FareClass;
import com.flightbooking.entity.FlightSeat;
import com.flightbooking.enums.PassengerType;
import com.flightbooking.exception.BusinessException;
import com.flightbooking.repository.PromotionCodeRepository;
import java.math.*;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PricingService {
    private final PromotionCodeRepository promotions;
    public BigDecimal passengerMultiplier(PassengerType type) {
        return switch (type) {
            case ADULT -> BigDecimal.ONE;
            case CHILD -> new BigDecimal("0.75");
            case INFANT -> new BigDecimal("0.10");
        };
    }
    public BigDecimal seatPrice(FareClass fare, FlightSeat seat) {
        return fare.isSeatIncluded() && !seat.isExtraLegroom() ? BigDecimal.ZERO : seat.getPrice();
    }
    public void calculate(Booking booking, BigDecimal seatAmount, String code) {
        BigDecimal multiplier = booking.getPassengers()
                                    .stream()
                                    .map(p -> passengerMultiplier(p.getType()))
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal base = booking.getSegments()
                              .stream()
                              .map(s -> s.getUnitPrice().multiply(multiplier))
                              .reduce(BigDecimal.ZERO, BigDecimal::add);
        long seated =
            booking.getPassengers().stream().filter(p -> p.getType() != PassengerType.INFANT).count();
        BigDecimal tax = BigDecimal.valueOf(120000L * seated * booking.getSegments().size());
        BigDecimal extras =
            booking.getAncillaries().stream().map(a -> a.getPrice()).reduce(seatAmount, BigDecimal::add).add(booking.getAdjustmentAmount());
        BigDecimal discount = BigDecimal.ZERO;
        if (code != null && !code.isBlank()) {
            var promotion =
                promotions.findByCodeIgnoreCase(code.trim())
                    .orElseThrow(() -> BusinessException.badRequest("Mã khuyến mại không tồn tại"));
            if (promotion.getExpiresOn().isBefore(LocalDate.now(FlightService.ZONE)))
                throw BusinessException.badRequest("Mã khuyến mại đã hết hạn");
            discount = base.multiply(BigDecimal.valueOf(promotion.getPercent()))
                           .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                           .min(promotion.getMaxDiscount());
            booking.setPromotionCode(promotion.getCode());
        }
        booking.setBaseAmount(base.setScale(2, RoundingMode.HALF_UP));
        booking.setTaxAmount(tax);
        booking.setExtrasAmount(extras);
        booking.setDiscountAmount(discount);
        booking.setTotalAmount(
            base.add(tax).add(extras).subtract(discount).setScale(2, RoundingMode.HALF_UP));
    }
    public static PriceView view(Booking b) {
        return new PriceView(b.getBaseAmount(), b.getTaxAmount(), b.getExtrasAmount(), b.getDiscountAmount(),
            b.getTotalAmount(), "VND");
    }
}
