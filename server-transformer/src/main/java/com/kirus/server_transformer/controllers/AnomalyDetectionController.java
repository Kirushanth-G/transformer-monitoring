package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.AnomalyDetectionDto;
import com.kirus.server_transformer.dtos.AnomalyDetectionRequest;
import com.kirus.server_transformer.service.AnomalyDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for human editing of anomaly detections (FR3.3 Feedback Integration)
 */
@RestController
@RequestMapping("/api/anomalies")
@Tag(name = "Anomaly Detection Management", description = "Human-in-the-loop editing of thermal anomaly detections")
@CrossOrigin(origins = "*")
public class AnomalyDetectionController {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyDetectionController.class);

    @Autowired
    private AnomalyDetectionService anomalyDetectionService;

    @Operation(summary = "Add human-detected anomaly",
               description = "User manually draws a bounding box for an anomaly the AI missed")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Anomaly added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "Analysis not found")
    })
    @PostMapping
    public ResponseEntity<AnomalyDetectionDto> addHumanDetection(
            @Valid @RequestBody AnomalyDetectionRequest request) {
        try {
            logger.info("Adding human detection for analysis ID: {}", request.getAnalysisId());
            AnomalyDetectionDto result = anomalyDetectionService.addHumanDetection(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            logger.error("Error adding human detection: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error adding human detection", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Edit anomaly detection",
               description = "User modifies AI's bounding box (resize/move/relabel). FR3.3: Preserves AI's original prediction.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Anomaly updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "Anomaly not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<AnomalyDetectionDto> editDetection(
            @Parameter(description = "Anomaly detection ID") @PathVariable Long id,
            @Valid @RequestBody AnomalyDetectionRequest request) {
        try {
            logger.info("Editing detection ID: {} by {}", id, request.getModifiedBy());
            AnomalyDetectionDto result = anomalyDetectionService.editDetection(id, request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Error editing detection: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error editing detection", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Delete anomaly detection (soft delete)",
               description = "User marks AI detection as false positive. FR3.3: Preserves data for model retraining.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Anomaly marked as deleted"),
            @ApiResponse(responseCode = "404", description = "Anomaly not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetection(
            @Parameter(description = "Anomaly detection ID") @PathVariable Long id,
            @Parameter(description = "User who is deleting") @RequestParam String deletedBy) {
        try {
            logger.info("Soft deleting detection ID: {} by {}", id, deletedBy);
            anomalyDetectionService.deleteDetection(id, deletedBy);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting detection: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error deleting detection", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Confirm AI detection is correct",
               description = "User verifies AI's bounding box is accurate")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Anomaly confirmed"),
            @ApiResponse(responseCode = "404", description = "Anomaly not found")
    })
    @PutMapping("/{id}/confirm")
    public ResponseEntity<AnomalyDetectionDto> confirmDetection(
            @Parameter(description = "Anomaly detection ID") @PathVariable Long id,
            @Parameter(description = "User confirming") @RequestParam String confirmedBy,
            @Parameter(description = "Optional comments") @RequestParam(required = false) String comments) {
        try {
            logger.info("Confirming detection ID: {} by {}", id, confirmedBy);
            AnomalyDetectionDto result = anomalyDetectionService.confirmDetection(id, confirmedBy, comments);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Error confirming detection: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error confirming detection", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get detection by ID", description = "Retrieve a specific anomaly detection")
    @GetMapping("/{id}")
    public ResponseEntity<AnomalyDetectionDto> getDetectionById(
            @Parameter(description = "Anomaly detection ID") @PathVariable Long id) {
        try {
            AnomalyDetectionDto result = anomalyDetectionService.getDetectionById(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Detection not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error retrieving detection", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get detections for analysis",
               description = "Retrieve all anomaly detections for a thermal analysis. Excludes deleted by default.")
    @GetMapping("/analysis/{analysisId}")
    public ResponseEntity<List<AnomalyDetectionDto>> getDetectionsForAnalysis(
            @Parameter(description = "Thermal analysis ID") @PathVariable Long analysisId,
            @Parameter(description = "Include deleted detections") @RequestParam(defaultValue = "false") boolean includeDeleted) {
        try {
            List<AnomalyDetectionDto> results = anomalyDetectionService.getDetectionsForAnalysis(analysisId, includeDeleted);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error retrieving detections for analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

