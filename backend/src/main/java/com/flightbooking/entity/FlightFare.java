package com.flightbooking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "flight_fares")
public class FlightFare {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fare_class_id", nullable = false)
    private FareClass fareClass;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal price;
}
