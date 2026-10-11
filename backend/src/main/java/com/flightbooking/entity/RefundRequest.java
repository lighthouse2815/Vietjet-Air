package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "refund_requests")
public class RefundRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="booking_id",nullable=false,unique=true) private Booking booking;
    @Column(nullable=false) private String status;
    @Column(nullable=false,length=2000) private String reason;
    @Column(length=2000) private String staffNote;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal amount;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal fee;
    @Column(nullable=false) private Instant createdAt;
    private Instant completedAt;
}
