package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="fare_classes")
public class FareClass {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String code;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String benefits;
    @Column(nullable=false) private int baggageKg;
    @Column(nullable=false) private boolean seatIncluded;
}
