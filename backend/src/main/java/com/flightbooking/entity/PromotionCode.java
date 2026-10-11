package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="promotion_codes")
public class PromotionCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String code;
    @Column(nullable=false) private int percent;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal maxDiscount;
    @Column(nullable=false) private LocalDate expiresOn;
}
