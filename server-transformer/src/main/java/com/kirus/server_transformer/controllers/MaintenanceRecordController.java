package com.kirus.server_transformer.controllers;

import com.kirus.server_transformer.dtos.*;
import com.kirus.server_transformer.service.MaintenanceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://react-powergrid.s3-website-ap-southeast-1.amazonaws.com"})
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/maintenance-records")
public class MaintenanceRecordController {

    private final MaintenanceRecordService maintenanceRecordService;

    // ========================================================================
    // MAINTENANCE RECORD ENDPOINTS
    // ========================================================================

    /**
     * Create a new maintenance record
     * POST /api/maintenance-records
     */
    @PostMapping
    public ResponseEntity<?> createMaintenanceRecord(
            @RequestBody MaintenanceRecordRequest request) {
        try {
            MaintenanceRecordResponse response = maintenanceRecordService.createMaintenanceRecord(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * Get maintenance record by ID
     * GET /api/maintenance-records/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMaintenanceRecordById(@PathVariable Long id) {
        try {
            MaintenanceRecordResponse response = maintenanceRecordService.getMaintenanceRecordById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }

    /**
     * Get maintenance record by inspection ID
     * GET /api/maintenance-records/inspection/{inspectionId}
     */
    @GetMapping("/inspection/{inspectionId}")
    public ResponseEntity<MaintenanceRecordResponse> getMaintenanceRecordByInspectionId(
            @PathVariable Long inspectionId) {
        try {
            MaintenanceRecordResponse response = maintenanceRecordService.getMaintenanceRecordByInspectionId(inspectionId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all maintenance records with pagination
     * GET /api/maintenance-records?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<PagedResponse<MaintenanceRecordSummaryDto>> getAllMaintenanceRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MaintenanceRecordSummaryDto> recordsPage = maintenanceRecordService.getAllMaintenanceRecords(pageable);
        PagedResponse<MaintenanceRecordSummaryDto> response = PagedResponse.of(recordsPage);
        return ResponseEntity.ok(response);
    }

    /**
     * Get maintenance records by finalization status
     * GET /api/maintenance-records/status?finalized=true&page=0&size=10
     */
    @GetMapping("/status")
    public ResponseEntity<PagedResponse<MaintenanceRecordSummaryDto>> getMaintenanceRecordsByStatus(
            @RequestParam Boolean finalized,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MaintenanceRecordSummaryDto> recordsPage = maintenanceRecordService.getMaintenanceRecordsByStatus(finalized, pageable);
        PagedResponse<MaintenanceRecordSummaryDto> response = PagedResponse.of(recordsPage);
        return ResponseEntity.ok(response);
    }

    /**
     * Update maintenance record
     * PUT /api/maintenance-records/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMaintenanceRecord(
            @PathVariable Long id,
            @RequestBody MaintenanceRecordRequest request) {
        try {
            MaintenanceRecordResponse response = maintenanceRecordService.updateMaintenanceRecord(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * Finalize maintenance record (locks editing)
     * POST /api/maintenance-records/{id}/finalize
     */
    @PostMapping("/{id}/finalize")
    public ResponseEntity<?> finalizeMaintenanceRecord(@PathVariable Long id) {
        try {
            MaintenanceRecordResponse response = maintenanceRecordService.finalizeMaintenanceRecord(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String message = e.getMessage();
            if (message.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(message, HttpStatus.NOT_FOUND.value()));
            }
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(message, HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * Delete maintenance record
     * DELETE /api/maintenance-records/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaintenanceRecord(@PathVariable Long id) {
        try {
            maintenanceRecordService.deleteMaintenanceRecord(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // ========================================================================
    // ELECTRICAL READINGS ENDPOINTS
    // ========================================================================

    /**
     * Add electrical readings to maintenance record
     * POST /api/maintenance-records/{id}/electrical-readings
     */
    @PostMapping("/{id}/electrical-readings")
    public ResponseEntity<?> addElectricalReadings(
            @PathVariable Long id,
            @RequestBody List<ElectricalReadingRequest> requests) {
        try {
            List<ElectricalReadingResponse> responses = maintenanceRecordService.addElectricalReadings(id, requests);
            return ResponseEntity.status(HttpStatus.CREATED).body(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * Get electrical readings for maintenance record
     * GET /api/maintenance-records/{id}/electrical-readings
     */
    @GetMapping("/{id}/electrical-readings")
    public ResponseEntity<?> getElectricalReadings(@PathVariable Long id) {
        try {
            List<ElectricalReadingResponse> responses = maintenanceRecordService.getElectricalReadings(id);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }

    /**
     * Update a specific electrical reading
     * PUT /api/maintenance-records/electrical-readings/{readingId}
     */
    @PutMapping("/electrical-readings/{readingId}")
    public ResponseEntity<?> updateElectricalReading(
            @PathVariable Long readingId,
            @RequestBody ElectricalReadingRequest request) {
        try {
            ElectricalReadingResponse response = maintenanceRecordService.updateElectricalReading(readingId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    // ========================================================================
    // INSPECTION SCHEMATIC ENDPOINTS
    // ========================================================================

    /**
     * Save or update inspection schematic diagram state
     * POST /api/maintenance-records/inspections/{inspectionId}/schematic
     */
    @PostMapping("/inspections/{inspectionId}/schematic")
    public ResponseEntity<?> saveSchematic(
            @PathVariable Long inspectionId,
            @RequestBody InspectionSchematicRequest request) {
        try {
            request.setInspectionId(inspectionId);
            InspectionSchematicResponse response = maintenanceRecordService.saveSchematic(inspectionId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * Get inspection schematic diagram state
     * GET /api/maintenance-records/inspections/{inspectionId}/schematic
     */
    @GetMapping("/inspections/{inspectionId}/schematic")
    public ResponseEntity<?> getSchematic(@PathVariable Long inspectionId) {
        try {
            InspectionSchematicResponse response = maintenanceRecordService.getSchematic(inspectionId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND.value()));
        }
    }

    /**
     * Delete inspection schematic
     * DELETE /api/maintenance-records/inspections/{inspectionId}/schematic
     */
    @DeleteMapping("/inspections/{inspectionId}/schematic")
    public ResponseEntity<?> deleteSchematic(@PathVariable Long inspectionId) {
        try {
            maintenanceRecordService.deleteSchematic(inspectionId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }
}

