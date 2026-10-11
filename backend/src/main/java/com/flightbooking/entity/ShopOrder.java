package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "shop_orders")
public class ShopOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) private UserAccount user;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="booking_id") private Booking booking;
    @Column(nullable=false) private String status;
    @Column(nullable=false) private String delivery;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal total;
    @Column(nullable=false,unique=true) private java.util.UUID requestKey;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private Instant expiresAt;
    @OneToMany(mappedBy="order",cascade=CascadeType.ALL) @OrderBy("id ASC") private java.util.List<ShopOrderItem> items=new java.util.ArrayList<>();
}
