package com.flightbooking.controller;
import com.flightbooking.dto.request.CommerceRequests.*;
import com.flightbooking.dto.request.ChangeRequests.Pay;
import com.flightbooking.dto.response.Responses.PaymentView;
import com.flightbooking.service.*;
import jakarta.validation.Valid;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor @RequestMapping("/api/commerce")
public class CommerceController {
    private final ShopService shop;private final VoucherService vouchers;private final LoyaltyService loyalty;
    @GetMapping("/rules") public Object rules(){return Map.of("quantityLimit",com.flightbooking.dto.request.CommerceRequests.QUANTITY_LIMIT,"loyalty",loyalty.rules(),
        "voucherMinimum",com.flightbooking.dto.request.CommerceRequests.MIN_VOUCHER_VALUE,"voucherMaximum",com.flightbooking.dto.request.CommerceRequests.MAX_VOUCHER_VALUE,
        "orderHoldMinutes",ShopService.HOLD_SECONDS/60,"voucherHoldMinutes",VoucherService.HOLD_SECONDS/60,"voucherValidityDays",VoucherService.VALIDITY_DAYS);}
    @GetMapping("/products") public List<ShopService.ProductView> products(){return shop.products();}
    @GetMapping("/account/orders") public List<ShopService.OrderView> orders(@AuthenticationPrincipal Jwt jwt){return shop.list(id(jwt));}
    @PostMapping("/account/orders") public ShopService.OrderView order(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody CreateOrder input){return shop.create(id(jwt),input);}
    @PostMapping("/account/orders/{id}/pay") public ShopService.OrderView orderPay(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id,@Valid @RequestBody Pay input){return shop.pay(id(jwt),id,input);}
    @PostMapping("/account/orders/{id}/cancel") public ShopService.OrderView cancelOrder(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id){return shop.cancel(id(jwt),id);}
    @GetMapping("/account/vouchers") public List<VoucherService.VoucherView> vouchers(@AuthenticationPrincipal Jwt jwt){return vouchers.list(id(jwt));}
    @PostMapping("/account/vouchers") public VoucherService.VoucherView voucher(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody BuyVoucher input){return vouchers.buy(id(jwt),input);}
    @PostMapping("/account/vouchers/{id}/pay") public VoucherService.VoucherView voucherPay(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id,@Valid @RequestBody Pay input){return vouchers.pay(id(jwt),id,input);}
    @PostMapping("/account/vouchers/{id}/cancel") public VoucherService.VoucherView cancelVoucher(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id){return vouchers.cancel(id(jwt),id);}
    @PostMapping("/account/vouchers/pay-booking") public PaymentView payBooking(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody VoucherPay input,@RequestHeader(value="X-Booking-Token",required=false) String token){return vouchers.payBooking(id(jwt),input,token);}
    @GetMapping("/account/wallet") public LoyaltyService.WalletView wallet(@AuthenticationPrincipal Jwt jwt){return loyalty.wallet(id(jwt));}
    @PostMapping("/account/wallet/redeem") public VoucherService.VoucherView redeem(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody Redeem input){return vouchers.redeem(id(jwt),input);}
    private Long id(Jwt jwt){return Long.valueOf(jwt.getSubject());}
}
