package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.ThermalAnalysisRequest;
import com.kirus.server_transformer.dtos.ThermalAnalysisResponse;
import com.kirus.server_transformer.entities.AnomalyDetection;
import com.kirus.server_transformer.entities.ThermalAnalysis;
import com.kirus.server_transformer.repositories.AnomalyDetectionRepository;
import com.kirus.server_transformer.repositories.InspectionImageRepository;
import com.kirus.server_transformer.repositories.ThermalAnalysisRepository;
import com.kirus.server_transformer.service.FastApiClientService;
import com.kirus.server_transformer.service.ThermalAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/thermal")
@Tag(name = "Thermal Analysis", description = "API for thermal image analysis operations")
@CrossOrigin(origins = "*")
public class ThermalAnalysisController {

    private static final Logger logger = LoggerFactory.getLogger(ThermalAnalysisController.class);

    @Autowired
    private ThermalAnalysisService thermalAnalysisService;

    @Autowired
    private FastApiClientService fastApiClientService;

    @Autowired
    private InspectionImageRepository inspectionImageRepository;

    @Autowired
    private AnomalyDetectionRepository anomalyDetectionRepository;

    @Autowired
    private ThermalAnalysisRepository thermalAnalysisRepository;

    @Operation(summary = "Analyze thermal image", description = "Perform thermal analysis on an inspection image")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Analysis completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
            @ApiResponse(responseCode = "500", description = "Analysis failed")
    })
    @PostMapping("/analyze")
    public ResponseEntity<ThermalAnalysisResponse> analyzeImage(
            @Valid @RequestBody ThermalAnalysisRequest request) {
        try {
            logger.info("Received thermal analysis request for maintenance image: {}", request.getMaintenanceImagePath());

            ThermalAnalysisResponse response = thermalAnalysisService.analyzeThermalImage(request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error during thermal analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Analyze thermal image asynchronously", description = "Start thermal analysis in background")
    @PostMapping("/analyze/async")
    public ResponseEntity<String> analyzeImageAsync(@RequestBody ThermalAnalysisRequest request) {
        try {
            CompletableFuture<ThermalAnalysisResponse> future = thermalAnalysisService.analyzeThermalImageAsync(request);
            return ResponseEntity.ok("Analysis started. Use the analysis ID to check status.");
        } catch (Exception e) {
            logger.error("Error starting async thermal analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get thermal analysis by ID", description = "Retrieve a specific thermal analysis result")
    @GetMapping("/{id}")
    public ResponseEntity<ThermalAnalysisResponse> getThermalAnalysis(
            @Parameter(description = "Analysis ID") @PathVariable Long id) {
        try {
            return thermalAnalysisService.getThermalAnalysisById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error retrieving thermal analysis with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get analysis history for equipment", description = "Retrieve thermal analysis history for a specific transformer")
    @GetMapping("/history/equipment/{equipmentId}")
    public ResponseEntity<List<ThermalAnalysisResponse>> getAnalysisHistory(
            @Parameter(description = "Equipment/Transformer ID") @PathVariable Long equipmentId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        try {
            if (size <= 0) {
                // Return all results if pagination not requested
                List<ThermalAnalysisResponse> analyses = thermalAnalysisService.getAnalysisHistoryByEquipment(equipmentId);
                return ResponseEntity.ok(analyses);
            } else {
                // Return paginated results
                Pageable pageable = PageRequest.of(page, size);
                Page<ThermalAnalysisResponse> analyses = thermalAnalysisService.getAnalysisHistoryByEquipment(equipmentId, pageable);
                return ResponseEntity.ok(analyses.getContent());
            }
        } catch (Exception e) {
            logger.error("Error retrieving analysis history for equipment: {}", equipmentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get latest analysis for equipment", description = "Get the most recent thermal analysis for a transformer")
    @GetMapping("/latest/equipment/{equipmentId}")
    public ResponseEntity<ThermalAnalysisResponse> getLatestAnalysis(
            @Parameter(description = "Equipment/Transformer ID") @PathVariable Long equipmentId) {
        try {
            return thermalAnalysisService.getLatestAnalysisForEquipment(equipmentId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error retrieving latest analysis for equipment: {}", equipmentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get analysis history for image", description = "Retrieve thermal analysis history for a specific image (restore functionality)")
    @GetMapping("/history/image/{imageId}")
    public ResponseEntity<List<ThermalAnalysisResponse>> getAnalysisHistoryByImage(
            @Parameter(description = "Image ID") @PathVariable Long imageId) {
        try {
            List<ThermalAnalysisResponse> analyses = thermalAnalysisService.getAnalysisHistoryByImage(imageId);
            return ResponseEntity.ok(analyses);
        } catch (Exception e) {
            logger.error("Error retrieving analysis history for image: {}", imageId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get latest analysis for image", description = "Get the most recent thermal analysis for a specific image")
    @GetMapping("/latest/image/{imageId}")
    public ResponseEntity<ThermalAnalysisResponse> getLatestAnalysisForImage(
            @Parameter(description = "Image ID") @PathVariable Long imageId) {
        try {
            List<ThermalAnalysisResponse> analyses = thermalAnalysisService.getAnalysisHistoryByImage(imageId);
            if (analyses.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            // Return the most recent analysis (first in the list since they're ordered by timestamp DESC)
            return ResponseEntity.ok(analyses.get(0));
        } catch (Exception e) {
            logger.error("Error retrieving latest analysis for image: {}", imageId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get analyses by assessment type", description = "Retrieve analyses filtered by overall assessment (NORMAL, WARNING, CRITICAL)")
    @GetMapping("/assessment/{assessment}")
    public ResponseEntity<List<ThermalAnalysisResponse>> getAnalysesByAssessment(
            @Parameter(description = "Assessment type: NORMAL, WARNING, or CRITICAL")
            @PathVariable String assessment) {
        try {
            ThermalAnalysis.AssessmentType assessmentType = ThermalAnalysis.AssessmentType.valueOf(assessment.toUpperCase());
            List<ThermalAnalysisResponse> analyses = thermalAnalysisService.getAnalysesByAssessment(assessmentType);
            return ResponseEntity.ok(analyses);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid assessment type: {}", assessment);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error retrieving analyses by assessment: {}", assessment, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get critical analyses", description = "Retrieve all analyses with critical detections")
    @GetMapping("/critical")
    public ResponseEntity<List<ThermalAnalysisResponse>> getCriticalAnalyses() {
        try {
            List<ThermalAnalysisResponse> analyses = thermalAnalysisService.getAnalysesWithCriticalDetections();
            return ResponseEntity.ok(analyses);
        } catch (Exception e) {
            logger.error("Error retrieving critical analyses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Delete thermal analysis", description = "Delete a thermal analysis and all its detections")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThermalAnalysis(
            @Parameter(description = "Analysis ID") @PathVariable Long id) {
        try {
            thermalAnalysisService.deleteThermalAnalysis(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting thermal analysis with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Check FastAPI service health", description = "Check if the thermal analysis service is available")
    @GetMapping("/service/health")
    public ResponseEntity<String> checkServiceHealth() {
        try {
            boolean isHealthy = fastApiClientService.isServiceHealthy();
            if (isHealthy) {
                return ResponseEntity.ok("Thermal analysis service is healthy");
            } else {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Thermal analysis service is unavailable");
            }
        } catch (Exception e) {
            logger.error("Error checking service health", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error checking service health");
        }
    }

    @Operation(summary = "Get service information", description = "Get information about the thermal analysis service")
    @GetMapping("/service/info")
    public ResponseEntity<String> getServiceInfo() {
        try {
            String info = fastApiClientService.getServiceInfo();
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            logger.error("Error getting service info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error getting service info");
        }
    }

    @Operation(summary = "Debug - Get database counts", description = "Get counts of thermal analyses and anomaly detections for debugging")
    @GetMapping("/debug/counts")
    public ResponseEntity<Map<String, Object>> getDebugCounts() {
        try {
            Map<String, Object> counts = new HashMap<>();

            // Count thermal analyses
            long analysisCount = thermalAnalysisRepository.count();
            counts.put("totalThermalAnalyses", analysisCount);

            // Count anomaly detections
            long anomalyCount = anomalyDetectionRepository.count();
            counts.put("totalAnomalyDetections", anomalyCount);

            // Get recent analyses with detection counts
            List<ThermalAnalysis> recentAnalyses = thermalAnalysisRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getAnalysisTimestamp().compareTo(a.getAnalysisTimestamp()))
                .limit(5)
                .collect(Collectors.toList());

            List<Map<String, Object>> recentAnalysisInfo = recentAnalyses.stream()
                .map(analysis -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("analysisId", analysis.getId());
                    info.put("timestamp", analysis.getAnalysisTimestamp());
                    info.put("assessment", analysis.getOverallAssessment());
                    info.put("anomalyScore", analysis.getAnomalyScore());
                    info.put("detectionsInMemory", analysis.getDetections() != null ? analysis.getDetections().size() : 0);

                    // Count detections in database for this analysis
                    long dbDetectionCount = anomalyDetectionRepository.countByAnalysisId(analysis.getId());
                    info.put("detectionsInDatabase", dbDetectionCount);

                    return info;
                })
                .collect(Collectors.toList());

            counts.put("recentAnalyses", recentAnalysisInfo);

            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            logger.error("Error getting debug counts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Debug - Get all anomaly detections", description = "Get all anomaly detections for debugging")
    @GetMapping("/debug/detections")
    public ResponseEntity<List<Map<String, Object>>> getAllDetections() {
        try {
            List<AnomalyDetection> allDetections = anomalyDetectionRepository.findAll();

            List<Map<String, Object>> detectionInfo = allDetections.stream()
                .map(detection -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("id", detection.getId());
                    info.put("analysisId", detection.getAnalysis() != null ? detection.getAnalysis().getId() : "null");
                    info.put("label", detection.getLabel());
                    info.put("confidence", detection.getConfidence());
                    info.put("x", detection.getX());
                    info.put("y", detection.getY());
                    info.put("isCritical", detection.getIsCritical());
                    info.put("createdAt", detection.getCreatedAt());
                    return info;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(detectionInfo);
        } catch (Exception e) {
            logger.error("Error getting all detections", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
