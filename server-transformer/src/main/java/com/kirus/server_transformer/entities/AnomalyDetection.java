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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum SeverityLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
