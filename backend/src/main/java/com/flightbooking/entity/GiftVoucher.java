package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "gift_vouchers")
public class GiftVoucher {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,unique=true) private java.util.UUID code;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="buyer_id",nullable=false) private UserAccount buyer;
    @Column(nullable=false) private String recipientEmail;
    @Column(nullable=false) private String status;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal value;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal balance;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private Instant expiresAt;
    @Column(nullable=false,unique=true) private java.util.UUID requestKey;
    @Column(nullable=false) private boolean reward;
}
