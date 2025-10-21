package com.kirus.server_transformer.service;

import com.kirus.server_transformer.dtos.*;
import com.kirus.server_transformer.entities.*;
import com.kirus.server_transformer.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Transactional
public class ThermalAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(ThermalAnalysisService.class);

    @Autowired
    private FastApiClientService fastApiClientService;

    @Autowired
    private ThermalAnalysisRepository thermalAnalysisRepository;

    @Autowired
    private AnomalyDetectionRepository anomalyDetectionRepository;

    @Autowired
    private InspectionImageRepository inspectionImageRepository;

    @Autowired
    private TransformerImageRepository transformerImageRepository;

    @Autowired
    private TransformerRepository transformerRepository;

    @Autowired
    private S3Service s3Service;

    /**
     * Perform thermal analysis on an image
     */
    public ThermalAnalysisResponse analyzeThermalImage(ThermalAnalysisRequest request) {
        logger.info("Starting thermal analysis for maintenance image: {}", request.getMaintenanceImagePath());

        try {
            // Validate images exist before starting analysis
            validateImageExists(request.getMaintenanceImagePath(), "Maintenance image");
            
            // Validate baseline image exists in transformer_images table, but handle gracefully if not found
            boolean hasValidBaseline = false;
            TransformImage baselineImage = null;
            if (request.getBaselineImagePath() != null && !request.getBaselineImagePath().trim().isEmpty()) {
                try {
                    validateTransformerImageExists(request.getBaselineImagePath(), "Baseline image");
                    hasValidBaseline = true;
                } catch (RuntimeException e) {
                    logger.warn("Baseline image validation failed, proceeding with standard analysis: {}", e.getMessage());
                    // Continue without baseline - this will trigger fallback analysis
                }
            }

            // Validate and get image URLs
            String maintenanceImageUrl = resolveImageUrl(request.getMaintenanceImagePath());
            String baselineImageUrl = hasValidBaseline ? resolveTransformerImageUrl(request.getBaselineImagePath()) : null;

            // Get image entities
            InspectionImage maintenanceImage = getInspectionImageById(request.getMaintenanceImagePath());
            if (hasValidBaseline) {
                baselineImage = getTransformerImageById(request.getBaselineImagePath());
            }

            // Prepare FastAPI request
            FastApiThermalRequest fastApiRequest = new FastApiThermalRequest();
            fastApiRequest.setMaintenanceImagePath(maintenanceImageUrl);
            fastApiRequest.setBaselineImagePath(baselineImageUrl);
            fastApiRequest.setProcessingDevice(request.getProcessingDevice());
            fastApiRequest.setInputImageSize(request.getInputImageSize());
            fastApiRequest.setUseHalfPrecision(request.getUseHalfPrecision());
            fastApiRequest.setWebResponseFormat(true);
            fastApiRequest.setSensitivityPercentage(request.getSensitivityPercentage());
            fastApiRequest.setConfigOverrides(request.getConfigOverrides());

            // Call FastAPI service
            FastApiThermalResponse fastApiResponse = fastApiClientService.analyzeThermalImage(fastApiRequest);

            logger.info("FastAPI response received: detections count = {}",
                fastApiResponse.getDetections() != null ? fastApiResponse.getDetections().size() : 0);

            // Create and save thermal analysis entity (now include baselineImage)
            ThermalAnalysis analysis = createThermalAnalysis(request, maintenanceImage, baselineImage, fastApiResponse);
            final ThermalAnalysis savedAnalysis = thermalAnalysisRepository.save(analysis);

            logger.info("Thermal analysis saved with ID: {}", savedAnalysis.getId());

            // Save anomaly detections with detailed logging
            if (fastApiResponse.getDetections() != null && !fastApiResponse.getDetections().isEmpty()) {
                logger.info("Processing {} detections for analysis ID: {}",
                    fastApiResponse.getDetections().size(), savedAnalysis.getId());

                List<AnomalyDetection> detections = new ArrayList<>();
                for (FastApiThermalResponse.FastApiDetection detection : fastApiResponse.getDetections()) {
                    try {
                        AnomalyDetection anomaly = createAnomalyDetection(savedAnalysis, detection);
                        detections.add(anomaly);
                        logger.debug("Created anomaly detection: label={}, confidence={}, critical={}",
                            anomaly.getLabel(), anomaly.getConfidence(), anomaly.getIsCritical());
                    } catch (Exception e) {
                        logger.error("Error creating anomaly detection from: {}", detection, e);
                    }
                }

                if (!detections.isEmpty()) {
                    List<AnomalyDetection> savedDetections = anomalyDetectionRepository.saveAll(detections);
                    logger.info("Successfully saved {} anomaly detections to database", savedDetections.size());
                    savedAnalysis.setDetections(savedDetections);
                } else {
                    logger.warn("No valid anomaly detections created from FastAPI response");
                }
            } else {
                logger.warn("No detections found in FastAPI response or detections list is null/empty");
            }

            // Save configuration overrides if any
            if (request.getConfigOverrides() != null && !request.getConfigOverrides().isEmpty()) {
                List<ThermalAnalysisConfig> configs = request.getConfigOverrides().entrySet().stream()
                        .map(entry -> createThermalConfig(savedAnalysis, entry.getKey(), entry.getValue().toString()))
                        .collect(Collectors.toList());
                savedAnalysis.setConfigs(configs);
            }

            logger.info("Thermal analysis completed successfully. Analysis ID: {}", savedAnalysis.getId());
            return mapToResponse(savedAnalysis, fastApiResponse.getAnnotatedImageUrl());

        } catch (Exception e) {
            logger.error("Error during thermal analysis", e);
            throw new RuntimeException("Thermal analysis failed: " + e.getMessage(), e);
        }
    }

    /**
     * Perform asynchronous thermal analysis
     */
    public CompletableFuture<ThermalAnalysisResponse> analyzeThermalImageAsync(ThermalAnalysisRequest request) {
        return CompletableFuture.supplyAsync(() -> analyzeThermalImage(request));
    }

    /**
     * Get thermal analysis by ID
     */
    @Transactional(readOnly = true)
    public Optional<ThermalAnalysisResponse> getThermalAnalysisById(Long id) {
        return thermalAnalysisRepository.findById(id)
                .map(analysis -> mapToResponse(analysis, null));
    }

    /**
     * Get thermal analysis history for equipment
     */
    @Transactional(readOnly = true)
    public List<ThermalAnalysisResponse> getAnalysisHistoryByEquipment(Long equipmentId) {
        return thermalAnalysisRepository.findByEquipmentIdOrderByAnalysisTimestampDesc(equipmentId)
                .stream()
                .map(analysis -> mapToResponse(analysis, null))
                .collect(Collectors.toList());
    }

    /**
     * Get thermal analysis history for equipment with pagination
     */
    @Transactional(readOnly = true)
    public Page<ThermalAnalysisResponse> getAnalysisHistoryByEquipment(Long equipmentId, Pageable pageable) {
        Page<ThermalAnalysis> analyses = thermalAnalysisRepository.findByEquipmentIdOrderByAnalysisTimestampDesc(equipmentId, pageable);
        return analyses.map(analysis -> mapToResponse(analysis, null));
    }

    /**
     * Get thermal analysis history for inspection
     */
    @Transactional(readOnly = true)
    public List<ThermalAnalysisResponse> getAnalysisHistoryByInspection(Long inspectionId) {
        return thermalAnalysisRepository.findByInspectionIdOrderByAnalysisTimestampDesc(inspectionId)
                .stream()
                .map(analysis -> mapToResponse(analysis, null))
                .collect(Collectors.toList());
    }

    /**
     * Get latest analysis for inspection
     */
    @Transactional(readOnly = true)
    public Optional<ThermalAnalysisResponse> getLatestAnalysisForInspection(Long inspectionId) {
        List<ThermalAnalysis> analyses = thermalAnalysisRepository.findByInspectionIdOrderByAnalysisTimestampDesc(inspectionId);
        return analyses.isEmpty() ? Optional.empty() :
            Optional.of(mapToResponse(analyses.get(0), null));
    }

    /**
     * Get latest analysis for equipment
     */
    @Transactional(readOnly = true)
    public Optional<ThermalAnalysisResponse> getLatestAnalysisForEquipment(Long equipmentId) {
        List<ThermalAnalysis> analyses = thermalAnalysisRepository.findByEquipmentIdOrderByAnalysisTimestampDesc(equipmentId);
        return analyses.isEmpty() ? Optional.empty() :
            Optional.of(mapToResponse(analyses.get(0), null));
    }

    /**
     * Get thermal analysis history for maintenance image
     */
    @Transactional(readOnly = true)
    public List<ThermalAnalysisResponse> getAnalysisHistoryByImage(Long imageId) {
        return thermalAnalysisRepository.findByMaintenanceImageIdOrderByAnalysisTimestampDesc(imageId)
                .stream()
                .map(analysis -> mapToResponse(analysis, null))
                .collect(Collectors.toList());
    }

    /**
     * Get analyses by assessment type
     */
    @Transactional(readOnly = true)
    public List<ThermalAnalysisResponse> getAnalysesByAssessment(ThermalAnalysis.AssessmentType assessmentType) {
        return thermalAnalysisRepository.findByOverallAssessmentOrderByAnalysisTimestampDesc(assessmentType)
                .stream()
                .map(analysis -> mapToResponse(analysis, null))
                .collect(Collectors.toList());
    }

    /**
     * Get analyses with critical detections
     */
    @Transactional(readOnly = true)
    public List<ThermalAnalysisResponse> getAnalysesWithCriticalDetections() {
        return thermalAnalysisRepository.findAnalysesWithCriticalDetections()
                .stream()
                .map(analysis -> mapToResponse(analysis, null))
                .collect(Collectors.toList());
    }

    /**
     * Delete thermal analysis
     */
    public void deleteThermalAnalysis(Long id) {
        thermalAnalysisRepository.deleteById(id);
        logger.info("Deleted thermal analysis with ID: {}", id);
    }

    // Private helper methods

    private String resolveImageUrl(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            throw new IllegalArgumentException("Image path cannot be null or empty");
        }

        if (imagePath.startsWith("http")) {
            return imagePath; // Already a URL
        }

        // Try to parse as image ID
        try {
            Long imageId = Long.parseLong(imagePath.trim());

            // Check if image exists first
            if (!inspectionImageRepository.existsById(imageId)) {
                throw new RuntimeException("Image not found with ID: " + imageId);
            }

            InspectionImage image = inspectionImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Image not found with ID: " + imageId));

            if (image.getImageUrl() == null || image.getImageUrl().trim().isEmpty()) {
                throw new RuntimeException("Image URL is null or empty for image ID: " + imageId);
            }

            // Use buildPublicUrl which returns the URL if already a URL or constructs it from key
            return s3Service.buildPublicUrl(image.getImageUrl());
        } catch (NumberFormatException e) {
            // Assume it's an S3 key
            logger.info("Treating '{}' as S3 key rather than image ID", imagePath);
            return s3Service.buildPublicUrl(imagePath);
        }
    }

    private void validateTransformerImageExists(String imagePath, String imageType) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            throw new IllegalArgumentException(imageType + " path cannot be null or empty");
        }

        if (imagePath.startsWith("http")) {
            logger.info("{} is an HTTP URL, skipping validation", imageType);
            return;
        }

        try {
            Long imageId = Long.parseLong(imagePath.trim());
            boolean exists = transformerImageRepository.existsById(imageId);
            if (!exists) {
                throw new RuntimeException(imageType + " not found with ID: " + imageId);
            }
            logger.info("Validated {} exists with ID: {}", imageType, imageId);
        } catch (NumberFormatException e) {
            logger.info("{} '{}' treated as S3 key, will validate during URL generation", imageType, imagePath);
        }
    }

    private String resolveTransformerImageUrl(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            throw new IllegalArgumentException("Image path cannot be null or empty");
        }

        if (imagePath.startsWith("http")) {
            return imagePath; // Already a URL
        }

        try {
            Long imageId = Long.parseLong(imagePath.trim());
            if (!transformerImageRepository.existsById(imageId)) {
                throw new RuntimeException("Transformer image not found with ID: " + imageId);
            }

            TransformImage image = transformerImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Transformer image not found with ID: " + imageId));

            if (image.getImageUrl() == null || image.getImageUrl().trim().isEmpty()) {
                throw new RuntimeException("Transformer image URL is null or empty for image ID: " + imageId);
            }

            return s3Service.buildPublicUrl(image.getImageUrl());
        } catch (NumberFormatException e) {
            logger.info("Treating '{}' as S3 key rather than image ID", imagePath);
            return s3Service.buildPublicUrl(imagePath);
        }
    }

    private TransformImage getTransformerImageById(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }

        try {
            Long imageId = Long.parseLong(imagePath.trim());
            return transformerImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Transformer image not found with ID: " + imageId));
        } catch (NumberFormatException e) {
            logger.warn("Cannot get TransformImage entity for non-numeric path: {}", imagePath);
            return null;
        }
    }

    private InspectionImage getInspectionImageById(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }

        try {
            Long imageId = Long.parseLong(imagePath.trim());
            return inspectionImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Image not found with ID: " + imageId));
        } catch (NumberFormatException e) {
            logger.warn("Cannot get InspectionImage entity for non-numeric path: {}", imagePath);
            return null;
        }
    }

    private ThermalAnalysis createThermalAnalysis(ThermalAnalysisRequest request,
                                                 InspectionImage maintenanceImage,
                                                 TransformImage baselineImage,
                                                 FastApiThermalResponse fastApiResponse) {
        ThermalAnalysis analysis = new ThermalAnalysis();
        analysis.setMaintenanceImage(maintenanceImage);
        analysis.setBaselineImage(baselineImage);
        // Note: baseline image is stored in transformer_images table, not inspection_images
        analysis.setAnalysisTimestamp(LocalDateTime.now());
        analysis.setOverallAssessment(parseAssessmentType(fastApiResponse.getOverallAssessment()));
        analysis.setAnomalyScore(BigDecimal.valueOf(fastApiResponse.getAnomalyScore() != null ?
                fastApiResponse.getAnomalyScore() : 0.0));
        analysis.setSensitivityPercentage(request.getSensitivityPercentage());
        analysis.setProcessingTimeMs(fastApiResponse.getProcessingTimeMs());
        analysis.setProcessingDevice(request.getProcessingDevice());
        analysis.setInputImageSize(request.getInputImageSize());
        analysis.setUseHalfPrecision(request.getUseHalfPrecision());
        analysis.setApiVersion(fastApiResponse.getApiVersion());
        analysis.setCreatedBy(request.getCreatedBy());

        // Set equipment if provided, or derive from inspection image
        if (request.getEquipmentId() != null) {
            Transformer equipment = transformerRepository.findById(request.getEquipmentId())
                    .orElseThrow(() -> new RuntimeException("Equipment not found with ID: " + request.getEquipmentId()));
            analysis.setEquipment(equipment);
        } else if (maintenanceImage != null && maintenanceImage.getInspection() != null) {
            // Derive equipment ID from the inspection image's associated inspection
            Transformer equipment = maintenanceImage.getInspection().getTransformer();
            if (equipment != null) {
                analysis.setEquipment(equipment);
                logger.info("Derived equipment ID {} from inspection image {}",
                    equipment.getId(), maintenanceImage.getId());
            } else {
                logger.warn("No equipment found for inspection image {}. Equipment ID will be null.",
                    maintenanceImage.getId());
            }
        } else {
            logger.warn("No equipment ID provided and cannot derive from inspection image. Equipment ID will be null.");
        }

        // Note: Inspection is not set from request as it's not part of ThermalAnalysisRequest
        // If needed, inspection can be derived from the maintenance image relationship

        return analysis;
    }

    private AnomalyDetection createAnomalyDetection(ThermalAnalysis analysis,
                                                   FastApiThermalResponse.FastApiDetection detection) {
        logger.debug("Creating anomaly detection from: x={}, y={}, width={}, height={}, label={}, confidence={}, area={}",
            detection.getX(), detection.getY(), detection.getWidth(), detection.getHeight(),
            detection.getLabel(), detection.getConfidence(), detection.getArea());

        AnomalyDetection anomaly = new AnomalyDetection();
        anomaly.setAnalysis(analysis);

        // Validate and set required fields with null checks
        anomaly.setX(detection.getX() != null ? detection.getX() : 0);
        anomaly.setY(detection.getY() != null ? detection.getY() : 0);
        anomaly.setWidth(detection.getWidth() != null ? detection.getWidth() : 0);
        anomaly.setHeight(detection.getHeight() != null ? detection.getHeight() : 0);
        anomaly.setLabel(detection.getLabel() != null ? detection.getLabel() : "Unknown");
        anomaly.setConfidence(detection.getConfidence() != null ?
            BigDecimal.valueOf(detection.getConfidence()) : BigDecimal.ZERO);
        anomaly.setArea(detection.getArea() != null ? detection.getArea() : 0);

        // Determine criticality based on label since FastAPI doesn't provide isCritical field
        boolean isCritical = determineCriticality(detection.getLabel());
        anomaly.setIsCritical(isCritical);

        // Set severity level based on criticality and confidence
        AnomalyDetection.SeverityLevel severityLevel = determineSeverityLevel(detection.getLabel(), detection.getConfidence());
        anomaly.setSeverityLevel(severityLevel);

        if (detection.getTemperatureCelsius() != null) {
            anomaly.setTemperatureCelsius(BigDecimal.valueOf(detection.getTemperatureCelsius()));
        }

        logger.debug("Created anomaly detection: ID will be assigned, analysis_id={}, label={}, confidence={}",
            analysis.getId(), anomaly.getLabel(), anomaly.getConfidence());

        return anomaly;
    }

    private boolean determineCriticality(String label) {
        if (label == null) return false;
        String labelLower = label.toLowerCase();
        // Based on your FastAPI response, determine criticality from label
        return labelLower.contains("critical") ||
                labelLower.contains("overload") ||
                labelLower.contains("loose joint") ||
                labelLower.contains("severe");
    }

    private AnomalyDetection.SeverityLevel determineSeverityLevel(String label, Double confidence) {
        if (label == null || confidence == null) return AnomalyDetection.SeverityLevel.LOW;

        boolean isCritical = determineCriticality(label);

        if (isCritical) {
            return confidence > 0.8 ? AnomalyDetection.SeverityLevel.CRITICAL : AnomalyDetection.SeverityLevel.HIGH;
        } else {
            return confidence > 0.7 ? AnomalyDetection.SeverityLevel.MEDIUM : AnomalyDetection.SeverityLevel.LOW;
        }
    }

    private ThermalAnalysisConfig createThermalConfig(ThermalAnalysis analysis, String key, String value) {
        ThermalAnalysisConfig config = new ThermalAnalysisConfig();
        config.setAnalysis(analysis);
        config.setConfigKey(key);
        config.setConfigValue(value);
        return config;
    }

    private ThermalAnalysis.AssessmentType parseAssessmentType(String assessment) {
        if (assessment == null) return ThermalAnalysis.AssessmentType.NORMAL;

        try {
            return ThermalAnalysis.AssessmentType.valueOf(assessment.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Unknown assessment type: {}. Defaulting to NORMAL", assessment);
            return ThermalAnalysis.AssessmentType.NORMAL;
        }
    }

    private ThermalAnalysisResponse mapToResponse(ThermalAnalysis analysis, String annotatedImageUrl) {
        ThermalAnalysisResponse response = new ThermalAnalysisResponse();
        response.setId(analysis.getId());
        response.setMaintenanceImageId(analysis.getMaintenanceImage().getId());
        response.setMaintenanceImageUrl(s3Service.buildPublicUrl(analysis.getMaintenanceImage().getImageUrl()));

        if (analysis.getBaselineImage() != null) {
            response.setBaselineImageId(analysis.getBaselineImage().getId());
            response.setBaselineImageUrl(s3Service.buildPublicUrl(analysis.getBaselineImage().getImageUrl()));
        }

        response.setAnalysisTimestamp(analysis.getAnalysisTimestamp());
        response.setOverallAssessment(analysis.getOverallAssessment());
        response.setAnomalyScore(analysis.getAnomalyScore());
        response.setSensitivityPercentage(analysis.getSensitivityPercentage());
        response.setProcessingTimeMs(analysis.getProcessingTimeMs());
        response.setApiVersion(analysis.getApiVersion());
        response.setCreatedBy(analysis.getCreatedBy());
        response.setAnnotatedImageUrl(annotatedImageUrl);

        if (analysis.getEquipment() != null) {
            response.setEquipmentId(analysis.getEquipment().getId());
        }

        // Map detections
        if (analysis.getDetections() != null && !analysis.getDetections().isEmpty()) {
            List<AnomalyDetectionDto> detectionDtos = analysis.getDetections().stream()
                    .map(this::mapDetectionToDto)
                    .collect(Collectors.toList());
            response.setDetections(detectionDtos);
            response.setTotalDetections(detectionDtos.size());
            response.setCriticalDetections((int) detectionDtos.stream().filter(AnomalyDetectionDto::getIsCritical).count());
            response.setWarningDetections(detectionDtos.size() - response.getCriticalDetections());
        }

        return response;
    }

    private AnomalyDetectionDto mapDetectionToDto(AnomalyDetection detection) {
        AnomalyDetectionDto dto = new AnomalyDetectionDto();
        dto.setId(detection.getId());
        dto.setX(detection.getX());
        dto.setY(detection.getY());
        dto.setWidth(detection.getWidth());
        dto.setHeight(detection.getHeight());
        dto.setLabel(detection.getLabel());
        dto.setConfidence(detection.getConfidence());
        dto.setArea(detection.getArea());
        dto.setIsCritical(detection.getIsCritical());
        dto.setSeverityLevel(detection.getSeverityLevel());
        dto.setTemperatureCelsius(detection.getTemperatureCelsius());
        return dto;
    }

    private void validateImageExists(String imagePath, String imageType) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            throw new IllegalArgumentException(imageType + " path cannot be null or empty");
        }

        if (imagePath.startsWith("http")) {
            // For HTTP URLs, we can't easily validate existence, so just return
            logger.info("{} is an HTTP URL, skipping validation", imageType);
            return;
        }

        try {
            Long imageId = Long.parseLong(imagePath.trim());
            boolean exists = inspectionImageRepository.existsById(imageId);
            if (!exists) {
                throw new RuntimeException(imageType + " not found with ID: " + imageId);
            }
            logger.info("Validated {} exists with ID: {}", imageType, imageId);
        } catch (NumberFormatException e) {
            // Assume it's an S3 key - we'll validate during URL generation
            logger.info("{} '{}' treated as S3 key, will validate during URL generation", imageType, imagePath);
        }
    }
}
