package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "commerce_payments")
public class CommercePayment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String kind;
    @Column(nullable=false) private Long purchaseId;
    @Column(nullable=false,unique=true) private java.util.UUID requestKey;
    @Column(nullable=false) private String outcome;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal amount;
    @Column(nullable=false) private Instant createdAt;
}
