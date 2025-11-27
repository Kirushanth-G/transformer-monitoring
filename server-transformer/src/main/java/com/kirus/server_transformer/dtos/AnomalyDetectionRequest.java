package com.kirus.server_transformer.dtos;

import com.kirus.server_transformer.entities.AnomalyDetection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO for creating or updating anomaly detections (human edits)
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AnomalyDetectionRequest {

    // Required for ADD operations
    @NotNull(message = "Analysis ID is required")
    private Long analysisId;

    @NotNull(message = "X coordinate is required")
    private Integer x;

    @NotNull(message = "Y coordinate is required")
    private Integer y;

    @NotNull(message = "Width is required")
    private Integer width;

    @NotNull(message = "Height is required")
    private Integer height;

    @NotBlank(message = "Label is required")
    private String label;

    // Optional fields
    private BigDecimal confidence; // For human-added, can be null or 1.0
    private Integer area;
    private Boolean isCritical;
    private AnomalyDetection.SeverityLevel severityLevel;
    private BigDecimal temperatureCelsius;

    // FR3.1: User comments
    private String userComments;

    // Audit fields
    @NotBlank(message = "Modified by is required")
    private String modifiedBy;
}

