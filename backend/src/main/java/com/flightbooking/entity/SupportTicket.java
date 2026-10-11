package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "support_tickets")
public class SupportTicket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private UserAccount user;
    @Column(nullable = false) private String subject;
    @Column(nullable = false) private String category;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private Instant createdAt;
}
