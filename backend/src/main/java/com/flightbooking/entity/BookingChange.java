package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "booking_changes")
public class BookingChange {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="booking_id",nullable=false) private Booking booking;
    @Column(nullable=false,length=20000) private String payload;
    @Column(nullable=false) private int revision;
    @Column(nullable=false) private String status;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal amount;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal fee;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal targetAmount;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private Instant expiresAt;
    @Column(unique=true) private java.util.UUID requestKey;
}
