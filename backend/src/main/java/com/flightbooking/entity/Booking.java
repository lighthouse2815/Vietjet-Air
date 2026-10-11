package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import com.flightbooking.enums.BookingStatus;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="bookings")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String code;
    @Column(unique=true,nullable=false) private UUID accessToken;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private BookingStatus status;
    @Column(nullable=false) private String contactEmail;
    @Column(nullable=false) private String contactPhone;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private Instant expiresAt;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal baseAmount;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal taxAmount;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal extrasAmount;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal discountAmount;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal totalAmount;
    private String promotionCode;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") private UserAccount user;
    @OneToMany(mappedBy="booking",cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("segmentIndex ASC") private List<BookingSegment> segments = new ArrayList<>();
    @OneToMany(mappedBy="booking",cascade=CascadeType.ALL,orphanRemoval=true) @OrderBy("passengerIndex ASC") private List<Passenger> passengers = new ArrayList<>();
    @OneToMany(mappedBy="booking",cascade=CascadeType.ALL,orphanRemoval=true) private List<BookingAncillary> ancillaries = new ArrayList<>();
}
