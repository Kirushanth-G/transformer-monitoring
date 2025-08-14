package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "images")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transformer_id")
    private Transformer transformer;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_type", length = 20)
    private String imageType; // 'Baseline' or 'Maintenance'

    @Column(name = "environmental_condition", length = 20)
    private String environmentalCondition; // 'Sunny', 'Cloudy', 'Rainy'

    @Column(name = "uploader_name", length = 100)
    private String uploaderName;

    @Column(name = "upload_time")
    private LocalDateTime uploadTime;
}

