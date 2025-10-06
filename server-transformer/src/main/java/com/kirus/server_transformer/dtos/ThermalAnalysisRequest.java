package com.kirus.server_transformer.dtos;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ThermalAnalysisRequest {
    @NotBlank(message = "Maintenance image path is required")
    private String maintenanceImagePath;  // S3 URL or image ID

    private String baselineImagePath;     // Optional S3 URL or image ID
    private String saveAnnotationPath;    // Optional local path for saving annotations

    @Min(value = -1, message = "Processing device must be -1 (CPU) or 0+ (GPU)")
    private Integer processingDevice = -1; // -1=CPU, 0+=GPU

    @Min(value = 224, message = "Input image size must be at least 224")
    @Max(value = 1024, message = "Input image size must not exceed 1024")
    private Integer inputImageSize = 640;

    private Boolean useHalfPrecision = false;
    private Boolean webResponseFormat = true;

    @Min(value = 0, message = "Sensitivity percentage must be between 0 and 100")
    @Max(value = 100, message = "Sensitivity percentage must be between 0 and 100")
    private Integer sensitivityPercentage = 50; // 0-100

    private Map<String, Object> configOverrides;

    @Positive(message = "Equipment ID must be positive")
    private Long equipmentId; // Transformer ID

    @Size(max = 100, message = "Created by field cannot exceed 100 characters")
    private String createdBy; // User who initiated the analysis
}
