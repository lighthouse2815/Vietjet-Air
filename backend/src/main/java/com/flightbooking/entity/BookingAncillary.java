package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="booking_ancillaries")
public class BookingAncillary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="booking_id",nullable=false) private Booking booking;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="flight_id",nullable=false) private Flight flight;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="service_id",nullable=false) private AncillaryService service;
    @Column(nullable=false) private int passengerIndex;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal price;
}
