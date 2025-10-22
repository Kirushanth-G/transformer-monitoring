package com.kirus.server_transformer.dtos;

import com.kirus.server_transformer.entities.ThermalAnalysis;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ThermalAnalysisResponse {
    private Long id;
    private Long maintenanceImageId;
    private String maintenanceImageUrl;
    private Long baselineImageId;
    private String baselineImageUrl;
    private LocalDateTime analysisTimestamp;
    private ThermalAnalysis.AssessmentType overallAssessment;
    private BigDecimal anomalyScore;
    private Integer sensitivityPercentage;
    private Integer processingTimeMs;
    private String apiVersion;
    private Long equipmentId;
    private String createdBy;
    private List<AnomalyDetectionDto> detections;
    private Integer totalDetections;
    private Integer criticalDetections;
    private Integer warningDetections;
    private String annotatedImageUrl; // URL to the annotated result image
    private Boolean hasUserAnnotations; // Flag indicating if user annotations exist
    private List<AnomalyDetectionDto> userAnnotations; // User-created annotations (optional)
}
