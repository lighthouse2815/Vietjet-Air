package com.flightbooking.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class UserAccount {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String email;
    @Column(nullable = false) private String passwordHash;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String role;
    @Column(nullable = false) private int tokenVersion;
    private String phone;
    private String resetHash;
    private Instant resetExpiresAt;
    @Column(nullable=false) private long points;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal qualifyingSpend = java.math.BigDecimal.ZERO;
}
