package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "inspection_images")
public class InspectionImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id")
    private Inspection inspection;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "environmental_condition", length = 20)
    private String environmentalCondition;

    @Column(name = "uploader_name", length = 100)
    private String uploaderName;

    @CreationTimestamp
    @Column(name = "upload_time")
    private LocalDateTime uploadTime;
}

