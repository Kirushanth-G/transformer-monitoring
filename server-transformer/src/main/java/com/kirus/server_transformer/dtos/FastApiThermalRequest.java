package com.kirus.server_transformer.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

/**
 * DTO for sending requests to the FastAPI thermal analysis service
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FastApiThermalRequest {
    @JsonProperty("maintenance_image_path")
    private String maintenanceImagePath;

    @JsonProperty("baseline_image_path")
    private String baselineImagePath;

    @JsonProperty("save_annotation_path")
    private String saveAnnotationPath;

    @JsonProperty("processing_device")
    private Integer processingDevice = -1;

    @JsonProperty("input_image_size")
    private Integer inputImageSize = 640;

    @JsonProperty("use_half_precision")
    private Boolean useHalfPrecision = false;

    @JsonProperty("web_response_format")
    private Boolean webResponseFormat = true;

    @JsonProperty("sensitivity_percentage")
    private Integer sensitivityPercentage = 50;

    @JsonProperty("config_overrides")
    private Map<String, Object> configOverrides;
}
