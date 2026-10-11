package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "voucher_usages")
public class VoucherUsage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="voucher_id",nullable=false) private GiftVoucher voucher;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="booking_id",nullable=false,unique=true) private Booking booking;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal amount;
    @Column(nullable=false) private boolean refunded;
    @Column(nullable=false,unique=true) private java.util.UUID requestKey;
    @Column(nullable=false) private Instant createdAt;
}
