package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "shop_order_items")
public class ShopOrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="order_id",nullable=false) private ShopOrder order;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="product_id",nullable=false) private ShopProduct product;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private int quantity;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal price;
}
