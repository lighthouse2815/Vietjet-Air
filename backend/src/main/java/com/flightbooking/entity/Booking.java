package com.flightbooking.entity;

import com.flightbooking.enums.BookingStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String code;
    @Column(unique = true, nullable = false) private UUID accessToken;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private BookingStatus status;
    @Column(nullable = false) private String contactEmail;
    @Column(nullable = false) private String contactPhone;
    @Column(nullable = false) private Instant createdAt;
    @Column(nullable = false) private Instant expiresAt;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal baseAmount;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal taxAmount;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal extrasAmount;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal discountAmount;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal totalAmount;
    private String promotionCode;
    @Column(nullable=false) private int revision;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal adjustmentAmount = BigDecimal.ZERO;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private UserAccount user;
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("segmentIndex ASC")
    private List<BookingSegment> segments = new ArrayList<>();
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("passengerIndex ASC")
    private List<Passenger> passengers = new ArrayList<>();
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingAncillary> ancillaries = new ArrayList<>();
}
