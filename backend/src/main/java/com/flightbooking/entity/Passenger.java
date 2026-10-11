package com.flightbooking.entity;

import com.flightbooking.enums.PassengerType;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "passengers")
public class Passenger {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    @Column(nullable = false) private int passengerIndex;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PassengerType type;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private String lastName;
    @Column(nullable = false) private String firstName;
    @Column(nullable = false) private LocalDate dateOfBirth;
    @Column(nullable = false) private String nationality;
}
