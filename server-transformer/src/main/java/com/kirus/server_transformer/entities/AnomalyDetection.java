package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "anomaly_detections")
public class AnomalyDetection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private ThermalAnalysis analysis;

    @Column(name = "x", nullable = false)
    private Integer x;

    @Column(name = "y", nullable = false)
    private Integer y;

    @Column(name = "width", nullable = false)
    private Integer width;

    @Column(name = "height", nullable = false)
    private Integer height;

    @Column(name = "label", nullable = false, length = 100)
    private String label;

    @Column(name = "confidence", nullable = false, precision = 5, scale = 3)
    private BigDecimal confidence;

    @Column(name = "area", nullable = false)
    private Integer area;

    @Column(name = "is_critical", nullable = false)
    private Boolean isCritical = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity_level", length = 20)
    private SeverityLevel severityLevel;

    @Column(name = "temperature_celsius", precision = 6, scale = 2)
    private BigDecimal temperatureCelsius;

    // Human-in-the-loop tracking
    @Enumerated(EnumType.STRING)
    @Column(name = "detection_source", length = 20)
    private DetectionSource detectionSource = DetectionSource.AI;

    // FR3.3: Preserve original AI prediction before human edits
    @Column(name = "original_ai_prediction", columnDefinition = "JSONB")
    private String originalAiPrediction; // Stores: {"x": 10, "y": 10, "width": 50, "height": 50}

    // FR3.1: Rich annotation status tracking (replaces is_false_positive)
    @Enumerated(EnumType.STRING)
    @Column(name = "annotation_status", length = 20)
    private AnnotationStatus annotationStatus = AnnotationStatus.UNVERIFIED;

    // FR3.1: User feedback/comments
    @Column(name = "user_comments", columnDefinition = "TEXT")
    private String userComments;

    @Column(name = "modified_by", length = 100)
    private String modifiedBy;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum SeverityLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum DetectionSource {
        AI, HUMAN
    }

    public enum AnnotationStatus {
        UNVERIFIED,  // AI detection, not yet reviewed by human
        CONFIRMED,   // Human verified AI was correct
        ADDED,       // Human manually added this box (AI missed it)
        EDITED,      // Human modified AI's box (resize/move/relabel)
        DELETED      // Human marked as false positive
    }
}
