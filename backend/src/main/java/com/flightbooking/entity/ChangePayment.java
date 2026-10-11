package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "change_payments")
public class ChangePayment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="change_id",nullable=false) private BookingChange change;
    @Column(nullable=false,unique=true) private java.util.UUID requestKey;
    @Column(nullable=false) private String status;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal amount;
    @Column(nullable=false) private Instant createdAt;
}
