package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "shop_products")
public class ShopProduct {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false,length=2000) private String description;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal price;
    @Column(nullable=false) private int stock;
    @Column(nullable=false) private boolean active;
}
