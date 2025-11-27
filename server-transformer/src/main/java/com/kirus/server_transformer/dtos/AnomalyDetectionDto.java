package com.kirus.server_transformer.dtos;

import com.kirus.server_transformer.entities.AnomalyDetection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AnomalyDetectionDto {
    private Long id;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
    private String label;
    private BigDecimal confidence;
    private Integer area;
    private Boolean isCritical;
    private AnomalyDetection.SeverityLevel severityLevel;
    private BigDecimal temperatureCelsius;

    // Human-in-the-loop tracking
    private AnomalyDetection.DetectionSource detectionSource;

    // FR3.3: Original AI prediction before human edits
    private String originalAiPrediction; // JSON: {"x": 10, "y": 10, "width": 50, "height": 50}

    // FR3.1: Rich annotation status (replaces isFalsePositive)
    private AnomalyDetection.AnnotationStatus annotationStatus;

    // FR3.1: User comments/feedback
    private String userComments;

    private String modifiedBy;
    private LocalDateTime modifiedAt;
}
