package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="airports")
public class Airport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique=true, nullable=false, length=3) private String code;
    @Column(nullable=false) private String city;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String country;
}
