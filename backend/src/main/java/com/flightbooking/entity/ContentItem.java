package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "content_items")
public class ContentItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String category;
    @Column(nullable = false) private String title;
    @Column(nullable = false, length = 2000) private String description;
    @Column(nullable = false) private String image;
    @Column(nullable = false) private String target;
    @Column(nullable = false) private int sortOrder;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String,Object> details = new LinkedHashMap<>();
}
