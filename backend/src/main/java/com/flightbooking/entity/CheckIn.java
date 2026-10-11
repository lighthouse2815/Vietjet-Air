package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="check_ins")
public class CheckIn {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="booking_id",nullable=false) private Booking booking;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="flight_id",nullable=false) private Flight flight;
    @Column(nullable=false) private int passengerIndex;
    @Column(nullable=false) private String seatNumber;
    @Column(unique=true,nullable=false) private String boardingCode;
    @Column(nullable=false) private Instant checkedInAt;
}
