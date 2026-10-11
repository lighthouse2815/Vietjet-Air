package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name="content_items")
public class ContentItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String category;
    @Column(nullable=false) private String title;
    @Column(nullable=false,length=2000) private String description;
    @Column(nullable=false) private String image;
    @Column(nullable=false) private String target;
    @Column(nullable=false) private int sortOrder;
}
