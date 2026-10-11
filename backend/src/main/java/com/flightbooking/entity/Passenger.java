package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import com.flightbooking.enums.PassengerType;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="passengers")
public class Passenger {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="booking_id",nullable=false) private Booking booking;
    @Column(nullable=false) private int passengerIndex;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private PassengerType type;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String lastName;
    @Column(nullable=false) private String firstName;
    @Column(nullable=false) private LocalDate dateOfBirth;
    @Column(nullable=false) private String nationality;
}
