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
@Table(name="ancillary_services")
public class AncillaryService {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String code;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String category;
    @Column(nullable=false) private String description;
    @Column(nullable=false,precision=14,scale=2) private BigDecimal price;
}
