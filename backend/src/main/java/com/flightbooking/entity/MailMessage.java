package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "mail_messages")
public class MailMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String recipient;
    @Column(nullable = false) private String subject;
    @Column(nullable = false, length = 4000) private String body;
    @Column(nullable = false) private Instant createdAt;
}
