package com.kirus.server_transformer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kirus.server_transformer.dtos.AnomalyDetectionDto;
import com.kirus.server_transformer.dtos.AnomalyDetectionRequest;
import com.kirus.server_transformer.entities.AnomalyDetection;
import com.kirus.server_transformer.entities.ThermalAnalysis;
import com.kirus.server_transformer.repositories.AnomalyDetectionRepository;
import com.kirus.server_transformer.repositories.ThermalAnalysisRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing human edits to anomaly detections (FR3.3 Feedback Integration)
 */
@Service
@Transactional
public class AnomalyDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyDetectionService.class);

    @Autowired
    private AnomalyDetectionRepository anomalyDetectionRepository;

    @Autowired
    private ThermalAnalysisRepository thermalAnalysisRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Add a new human-detected anomaly (AI missed it)
     */
    public AnomalyDetectionDto addHumanDetection(AnomalyDetectionRequest request) {
        logger.info("Adding human-detected anomaly for analysis ID: {}", request.getAnalysisId());

        // Verify analysis exists
        ThermalAnalysis analysis = thermalAnalysisRepository.findById(request.getAnalysisId())
                .orElseThrow(() -> new RuntimeException("Thermal analysis not found with ID: " + request.getAnalysisId()));

        AnomalyDetection detection = new AnomalyDetection();
        detection.setAnalysis(analysis);
        detection.setX(request.getX());
        detection.setY(request.getY());
        detection.setWidth(request.getWidth());
        detection.setHeight(request.getHeight());
        detection.setLabel(request.getLabel());

        // For human-added, confidence can be 1.0 or null
        detection.setConfidence(request.getConfidence() != null ? request.getConfidence() : BigDecimal.ONE);

        // Calculate area
        detection.setArea(request.getArea() != null ? request.getArea() : request.getWidth() * request.getHeight());

        detection.setIsCritical(request.getIsCritical() != null ? request.getIsCritical() : false);
        detection.setSeverityLevel(request.getSeverityLevel());
        detection.setTemperatureCelsius(request.getTemperatureCelsius());

        // FR3.3: Mark as human-added
        detection.setDetectionSource(AnomalyDetection.DetectionSource.HUMAN);
        detection.setAnnotationStatus(AnomalyDetection.AnnotationStatus.ADDED);
        detection.setUserComments(request.getUserComments());
        detection.setModifiedBy(request.getModifiedBy());
        detection.setModifiedAt(LocalDateTime.now());

        // No original_ai_prediction for human-added (AI didn't detect it)
        detection.setOriginalAiPrediction(null);

        AnomalyDetection saved = anomalyDetectionRepository.save(detection);
        logger.info("Human detection added with ID: {}", saved.getId());

        return mapToDto(saved);
    }

    /**
     * Edit an existing anomaly detection (resize/move/relabel)
     * FR3.3: Snapshots AI's original prediction before overwriting
     */
    public AnomalyDetectionDto editDetection(Long id, AnomalyDetectionRequest request) {
        logger.info("Editing anomaly detection ID: {}", id);

        AnomalyDetection detection = anomalyDetectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anomaly detection not found with ID: " + id));

        // FR3.3: Snapshot AI's original prediction BEFORE overwriting (only once)
        if (detection.getDetectionSource() == AnomalyDetection.DetectionSource.AI
            && detection.getOriginalAiPrediction() == null) {

            String snapshot = createAiPredictionSnapshot(detection);
            detection.setOriginalAiPrediction(snapshot);
            logger.info("Snapshotted AI original prediction for detection ID: {}", id);
        }

        // Apply user's changes
        detection.setX(request.getX());
        detection.setY(request.getY());
        detection.setWidth(request.getWidth());
        detection.setHeight(request.getHeight());
        detection.setLabel(request.getLabel());

        if (request.getConfidence() != null) {
            detection.setConfidence(request.getConfidence());
        }

        // Recalculate area
        detection.setArea(request.getWidth() * request.getHeight());

        if (request.getIsCritical() != null) {
            detection.setIsCritical(request.getIsCritical());
        }
        if (request.getSeverityLevel() != null) {
            detection.setSeverityLevel(request.getSeverityLevel());
        }
        if (request.getTemperatureCelsius() != null) {
            detection.setTemperatureCelsius(request.getTemperatureCelsius());
        }

        // FR3.1: Update annotation status and tracking
        detection.setAnnotationStatus(AnomalyDetection.AnnotationStatus.EDITED);
        detection.setUserComments(request.getUserComments());
        detection.setModifiedBy(request.getModifiedBy());
        detection.setModifiedAt(LocalDateTime.now());

        AnomalyDetection saved = anomalyDetectionRepository.save(detection);
        logger.info("Detection ID {} edited by {}", id, request.getModifiedBy());

        return mapToDto(saved);
    }

    /**
     * Delete an anomaly detection (mark as false positive)
     * FR3.3: Soft delete - preserves data for model retraining
     */
    public void deleteDetection(Long id, String deletedBy) {
        logger.info("Soft deleting anomaly detection ID: {} by {}", id, deletedBy);

        AnomalyDetection detection = anomalyDetectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anomaly detection not found with ID: " + id));

        // FR3.3: Soft delete - do NOT use SQL DELETE
        detection.setAnnotationStatus(AnomalyDetection.AnnotationStatus.DELETED);
        detection.setModifiedBy(deletedBy);
        detection.setModifiedAt(LocalDateTime.now());

        anomalyDetectionRepository.save(detection);
        logger.info("Detection ID {} marked as DELETED (false positive)", id);
    }

    /**
     * Confirm an AI detection is correct
     */
    public AnomalyDetectionDto confirmDetection(Long id, String confirmedBy, String comments) {
        logger.info("Confirming anomaly detection ID: {} by {}", id, confirmedBy);

        AnomalyDetection detection = anomalyDetectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anomaly detection not found with ID: " + id));

        detection.setAnnotationStatus(AnomalyDetection.AnnotationStatus.CONFIRMED);
        detection.setUserComments(comments);
        detection.setModifiedBy(confirmedBy);
        detection.setModifiedAt(LocalDateTime.now());

        AnomalyDetection saved = anomalyDetectionRepository.save(detection);
        logger.info("Detection ID {} confirmed as correct by {}", id, confirmedBy);

        return mapToDto(saved);
    }

    /**
     * Get all detections for an analysis (excluding deleted ones by default)
     */
    @Transactional(readOnly = true)
    public List<AnomalyDetectionDto> getDetectionsForAnalysis(Long analysisId, boolean includeDeleted) {
        List<AnomalyDetection> detections = anomalyDetectionRepository.findByAnalysisIdOrderByConfidenceDesc(analysisId);

        if (!includeDeleted) {
            detections = detections.stream()
                    .filter(d -> d.getAnnotationStatus() != AnomalyDetection.AnnotationStatus.DELETED)
                    .collect(Collectors.toList());
        }

        return detections.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get detection by ID
     */
    @Transactional(readOnly = true)
    public AnomalyDetectionDto getDetectionById(Long id) {
        AnomalyDetection detection = anomalyDetectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anomaly detection not found with ID: " + id));
        return mapToDto(detection);
    }

    // Private helper methods

    /**
     * FR3.3: Create JSON snapshot of AI's original prediction
     */
    private String createAiPredictionSnapshot(AnomalyDetection detection) {
        Map<String, Integer> snapshot = new HashMap<>();
        snapshot.put("x", detection.getX());
        snapshot.put("y", detection.getY());
        snapshot.put("width", detection.getWidth());
        snapshot.put("height", detection.getHeight());

        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (Exception e) {
            logger.error("Error creating AI prediction snapshot", e);
            // Fallback to manual JSON construction
            return String.format("{\"x\": %d, \"y\": %d, \"width\": %d, \"height\": %d}",
                    detection.getX(), detection.getY(), detection.getWidth(), detection.getHeight());
        }
    }

    private AnomalyDetectionDto mapToDto(AnomalyDetection detection) {
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

        // Human-in-the-loop tracking fields
        dto.setDetectionSource(detection.getDetectionSource());
        dto.setOriginalAiPrediction(detection.getOriginalAiPrediction());
        dto.setAnnotationStatus(detection.getAnnotationStatus());
        dto.setUserComments(detection.getUserComments());
        dto.setModifiedBy(detection.getModifiedBy());
        dto.setModifiedAt(detection.getModifiedAt());

        return dto;
    }
}

