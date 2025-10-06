package com.kirus.server_transformer.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO for receiving responses from the FastAPI thermal analysis service
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FastApiThermalResponse {
    @JsonProperty("image_path")
    private String imagePath;

    @JsonProperty("overall_assessment")
    private String overallAssessment;

    @JsonProperty("anomaly_score")
    private Double anomalyScore;

    @JsonProperty("detections")
    private List<FastApiDetection> detections;

    @JsonProperty("detection_count")
    private Integer detectionCount;

    @JsonProperty("image_dimensions")
    private ImageDimensions imageDimensions;

    // Additional fields for compatibility
    private Integer processingTimeMs;
    private String apiVersion;
    private String annotatedImageUrl;
    private String status;
    private String message;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class FastApiDetection {
        private Integer x;
        private Integer y;
        private Integer width;
        private Integer height;
        private String label;
        private Double confidence;
        private Integer area;

        // Additional fields that might be available
        private Boolean isCritical;
        private String severityLevel;
        private Double temperatureCelsius;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class ImageDimensions {
        private Integer height;
        private Integer width;
    }
}
