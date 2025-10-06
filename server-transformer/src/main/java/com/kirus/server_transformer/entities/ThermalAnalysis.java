package com.kirus.server_transformer.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "thermal_analyses")
public class ThermalAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_image_id", nullable = false)
    private InspectionImage maintenanceImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "baseline_image_id")
    private InspectionImage baselineImage;

    @Column(name = "analysis_timestamp", nullable = false)
    private LocalDateTime analysisTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_assessment", nullable = false, length = 20)
    private AssessmentType overallAssessment;

    @Column(name = "anomaly_score", nullable = false, precision = 5, scale = 3)
    private BigDecimal anomalyScore = BigDecimal.ZERO;

    @Column(name = "sensitivity_percentage", nullable = false)
    private Integer sensitivityPercentage = 50;

    @Column(name = "processing_time_ms")
    private Integer processingTimeMs;

    @Column(name = "processing_device")
    private Integer processingDevice = -1;

    @Column(name = "input_image_size")
    private Integer inputImageSize = 640;

    @Column(name = "use_half_precision")
    private Boolean useHalfPrecision = false;

    @Column(name = "api_version", length = 50)
    private String apiVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Transformer equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id")
    private Inspection inspection;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnomalyDetection> detections = new ArrayList<>();

    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ThermalAnalysisConfig> configs = new ArrayList<>();

    public enum AssessmentType {
        NORMAL, WARNING, CRITICAL
    }
}
