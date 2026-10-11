package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "support_messages")
public class SupportMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ticket_id", nullable = false) private SupportTicket ticket;
    @Column(nullable = false, length = 4000) private String body;
    @Column(nullable = false) private boolean staff;
    @Column(nullable = false) private Instant createdAt;
}
