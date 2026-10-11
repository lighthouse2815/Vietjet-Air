package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "point_entries")
public class PointEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) private UserAccount user;
    @Column(nullable=false) private long delta;
    @Column(nullable=false,unique=true) private String source;
    @Column(nullable=false) private String description;
    @Column(nullable=false,precision=14,scale=2) private java.math.BigDecimal spend;
    @Column(nullable=false) private Instant createdAt;
}
