package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_annotations")
public class UserAnnotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to inspection image (maintenance image)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = false)
    private InspectionImage image;

    // Bounding box JSON: {"x":..., "y":..., "width":..., "height":...}
    @Column(name = "bb", nullable = false, columnDefinition = "jsonb")
    private String bb;

    @Column(name = "type", length = 100)
    private String type;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "user_id", length = 100)
    private String userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
