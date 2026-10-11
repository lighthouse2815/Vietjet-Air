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
@Table(name="flights")
public class Flight {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String flightNumber;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="origin_id",nullable=false) private Airport origin;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="destination_id",nullable=false) private Airport destination;
    @Column(nullable=false) private Instant departureTime;
    @Column(nullable=false) private Instant arrivalTime;
    @Column(nullable=false) private int capacity;
    @Column(nullable=false) private String aircraft;
}
