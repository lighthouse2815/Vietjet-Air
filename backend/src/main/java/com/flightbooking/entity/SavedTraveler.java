package com.flightbooking.entity;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor @Entity @Table(name = "saved_travelers")
public class SavedTraveler {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private UserAccount user;
    @Column(nullable = false) private String type;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private String lastName;
    @Column(nullable = false) private String firstName;
    @Column(nullable = false) private LocalDate dateOfBirth;
    @Column(nullable = false) private String nationality;
}
