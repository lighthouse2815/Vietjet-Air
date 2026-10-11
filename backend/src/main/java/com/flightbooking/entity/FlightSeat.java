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
@Table(name="flight_seats")
public class FlightSeat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="flight_id",nullable=false) private Flight flight;
    @Column(nullable=false) private String seatNumber;
    @Column(nullable=false) private boolean extraLegroom;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal price;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="booking_id") private Booking booking;
    private Integer passengerIndex;
    @Column(nullable=false) private boolean blocked;
}
