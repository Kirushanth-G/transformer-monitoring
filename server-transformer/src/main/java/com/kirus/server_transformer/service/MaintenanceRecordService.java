package com.kirus.server_transformer.service;

import com.kirus.server_transformer.dtos.*;
import com.kirus.server_transformer.entities.*;
import com.kirus.server_transformer.mappers.ElectricalReadingMapper;
import com.kirus.server_transformer.mappers.InspectionSchematicMapper;
import com.kirus.server_transformer.mappers.MaintenanceRecordMapper;
import com.kirus.server_transformer.repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceRecordService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final ElectricalReadingRepository electricalReadingRepository;
    private final InspectionSchematicRepository inspectionSchematicRepository;
    private final InspectionRepository inspectionRepository;
    private final MaintenanceRecordMapper maintenanceRecordMapper;
    private final ElectricalReadingMapper electricalReadingMapper;
    private final InspectionSchematicMapper inspectionSchematicMapper;

    // ========================================================================
    // MAINTENANCE RECORD CRUD OPERATIONS
    // ========================================================================

    @Transactional
    public MaintenanceRecordResponse createMaintenanceRecord(MaintenanceRecordRequest request) {
        // Validate inspection exists
        Inspection inspection = inspectionRepository.findById(request.getInspectionId())
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + request.getInspectionId()));

        // Check if maintenance record already exists for this inspection
        if (maintenanceRecordRepository.existsByInspectionId(request.getInspectionId())) {
            throw new RuntimeException("Maintenance record already exists for inspection: " + request.getInspectionId());
        }

        // Create maintenance record
        MaintenanceRecord maintenanceRecord = maintenanceRecordMapper.toEntity(request);
        maintenanceRecord.setInspection(inspection);
        maintenanceRecord.setIsFinalized(false);

        // Save maintenance record
        MaintenanceRecord savedRecord = maintenanceRecordRepository.save(maintenanceRecord);

        // Add electrical readings if provided
        if (request.getElectricalReadings() != null && !request.getElectricalReadings().isEmpty()) {
            List<ElectricalReading> readings = request.getElectricalReadings().stream()
                    .map(readingRequest -> {
                        ElectricalReading reading = electricalReadingMapper.toEntity(readingRequest);
                        reading.setMaintenanceRecord(savedRecord);
                        return reading;
                    })
                    .collect(Collectors.toList());
            electricalReadingRepository.saveAll(readings);
            savedRecord.setElectricalReadings(readings);
        }

        return maintenanceRecordMapper.toResponse(savedRecord);
    }

    @Transactional
    public MaintenanceRecordResponse updateMaintenanceRecord(Long id, MaintenanceRecordRequest request) {
        MaintenanceRecord maintenanceRecord = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));

        // Check if record is finalized
        if (Boolean.TRUE.equals(maintenanceRecord.getIsFinalized())) {
            throw new RuntimeException("Cannot update finalized maintenance record");
        }

        // Update fields
        maintenanceRecordMapper.updateEntityFromRequest(request, maintenanceRecord);

        // Update electrical readings if provided
        if (request.getElectricalReadings() != null) {
            // Remove existing readings
            electricalReadingRepository.deleteByMaintenanceRecordId(id);

            // Add new readings
            List<ElectricalReading> readings = request.getElectricalReadings().stream()
                    .map(readingRequest -> {
                        ElectricalReading reading = electricalReadingMapper.toEntity(readingRequest);
                        reading.setMaintenanceRecord(maintenanceRecord);
                        return reading;
                    })
                    .collect(Collectors.toList());
            electricalReadingRepository.saveAll(readings);
        }

        MaintenanceRecord updatedRecord = maintenanceRecordRepository.save(maintenanceRecord);
        return maintenanceRecordMapper.toResponse(updatedRecord);
    }

    public MaintenanceRecordResponse getMaintenanceRecordById(Long id) {
        MaintenanceRecord maintenanceRecord = maintenanceRecordRepository.findByIdWithReadings(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));
        return maintenanceRecordMapper.toResponse(maintenanceRecord);
    }

    public MaintenanceRecordResponse getMaintenanceRecordByInspectionId(Long inspectionId) {
        // Validate that inspection exists
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        // Return existing record if found, otherwise return empty default response
        return maintenanceRecordRepository.findByInspectionId(inspectionId)
                .map(maintenanceRecordMapper::toResponse)
                .orElseGet(() -> {
                    // Return a default empty response indicating no maintenance record exists yet
                    MaintenanceRecordResponse emptyResponse = new MaintenanceRecordResponse();
                    emptyResponse.setInspectionId(inspectionId);
                    emptyResponse.setIsFinalized(false);
                    emptyResponse.setElectricalReadings(List.of());
                    return emptyResponse;
                });
    }

    public Page<MaintenanceRecordSummaryDto> getAllMaintenanceRecords(Pageable pageable) {
        Page<MaintenanceRecord> records = maintenanceRecordRepository.findAll(pageable);
        return records.map(maintenanceRecordMapper::toSummaryDto);
    }

    public Page<MaintenanceRecordSummaryDto> getMaintenanceRecordsByStatus(Boolean isFinalized, Pageable pageable) {
        Page<MaintenanceRecord> records = maintenanceRecordRepository.findByIsFinalized(isFinalized, pageable);
        return records.map(maintenanceRecordMapper::toSummaryDto);
    }

    @Transactional
    public void deleteMaintenanceRecord(Long id) {
        MaintenanceRecord maintenanceRecord = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));

        // Check if record is finalized
        if (Boolean.TRUE.equals(maintenanceRecord.getIsFinalized())) {
            throw new RuntimeException("Cannot delete finalized maintenance record");
        }

        maintenanceRecordRepository.delete(maintenanceRecord);
    }

    @Transactional
    public MaintenanceRecordResponse finalizeMaintenanceRecord(Long id) {
        MaintenanceRecord maintenanceRecord = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));

        if (Boolean.TRUE.equals(maintenanceRecord.getIsFinalized())) {
            throw new RuntimeException("Maintenance record is already finalized");
        }

        // Allow finalization regardless of data completeness - soft validation
        maintenanceRecord.setIsFinalized(true);
        MaintenanceRecord finalizedRecord = maintenanceRecordRepository.save(maintenanceRecord);
        return maintenanceRecordMapper.toResponse(finalizedRecord);
    }

    // ========================================================================
    // ELECTRICAL READINGS OPERATIONS
    // ========================================================================

    @Transactional
    public List<ElectricalReadingResponse> addElectricalReadings(Long maintenanceRecordId, List<ElectricalReadingRequest> requests) {
        MaintenanceRecord maintenanceRecord = maintenanceRecordRepository.findById(maintenanceRecordId)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + maintenanceRecordId));

        // Check if record is finalized
        if (Boolean.TRUE.equals(maintenanceRecord.getIsFinalized())) {
            throw new RuntimeException("Cannot add readings to finalized maintenance record");
        }

        List<ElectricalReading> readings = requests.stream()
                .map(request -> {
                    // Check if reading stage already exists
                    if (electricalReadingRepository.existsByMaintenanceRecordIdAndReadingStage(
                            maintenanceRecordId, request.getReadingStage())) {
                        throw new RuntimeException("Reading already exists for stage: " + request.getReadingStage());
                    }

                    ElectricalReading reading = electricalReadingMapper.toEntity(request);
                    reading.setMaintenanceRecord(maintenanceRecord);
                    return reading;
                })
                .collect(Collectors.toList());

        List<ElectricalReading> savedReadings = electricalReadingRepository.saveAll(readings);
        return savedReadings.stream()
                .map(electricalReadingMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ElectricalReadingResponse> getElectricalReadings(Long maintenanceRecordId) {
        List<ElectricalReading> readings = electricalReadingRepository.findByMaintenanceRecordId(maintenanceRecordId);
        return readings.stream()
                .map(electricalReadingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ElectricalReadingResponse updateElectricalReading(Long readingId, ElectricalReadingRequest request) {
        ElectricalReading reading = electricalReadingRepository.findById(readingId)
                .orElseThrow(() -> new RuntimeException("Electrical reading not found with id: " + readingId));

        // Check if maintenance record is finalized
        if (Boolean.TRUE.equals(reading.getMaintenanceRecord().getIsFinalized())) {
            throw new RuntimeException("Cannot update reading for finalized maintenance record");
        }

        // Update fields
        reading.setReadingStage(request.getReadingStage());
        reading.setVoltsR(request.getVoltsR());
        reading.setVoltsY(request.getVoltsY());
        reading.setVoltsB(request.getVoltsB());
        reading.setVoltsNeutral(request.getVoltsNeutral());
        reading.setAmpsR(request.getAmpsR());
        reading.setAmpsY(request.getAmpsY());
        reading.setAmpsB(request.getAmpsB());
        reading.setAmpsNeutral(request.getAmpsNeutral());

        ElectricalReading updatedReading = electricalReadingRepository.save(reading);
        return electricalReadingMapper.toResponse(updatedReading);
    }

    // ========================================================================
    // INSPECTION SCHEMATIC OPERATIONS
    // ========================================================================

    @Transactional
    public InspectionSchematicResponse saveSchematic(Long inspectionId, InspectionSchematicRequest request) {
        // Validate inspection exists
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        // Check if schematic already exists
        InspectionSchematic schematic = inspectionSchematicRepository.findByInspectionId(inspectionId)
                .orElseGet(() -> {
                    InspectionSchematic newSchematic = new InspectionSchematic();
                    newSchematic.setInspection(inspection);
                    return newSchematic;
                });

        // Update diagram state
        schematic.setDiagramState(request.getDiagramState());

        InspectionSchematic savedSchematic = inspectionSchematicRepository.save(schematic);
        return inspectionSchematicMapper.toResponse(savedSchematic);
    }

    public InspectionSchematicResponse getSchematic(Long inspectionId) {
        // Validate inspection exists first
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        // Return empty schematic if none exists (instead of 404)
        InspectionSchematic schematic = inspectionSchematicRepository.findByInspectionId(inspectionId)
                .orElseGet(() -> {
                    InspectionSchematic emptySchematic = new InspectionSchematic();
                    emptySchematic.setInspection(inspection);
                    emptySchematic.setDiagramState("{}"); // Empty JSON object
                    return emptySchematic;
                });
        return inspectionSchematicMapper.toResponse(schematic);
    }

    @Transactional
    public void deleteSchematic(Long inspectionId) {
        if (!inspectionSchematicRepository.existsByInspectionId(inspectionId)) {
            throw new RuntimeException("Schematic not found for inspection: " + inspectionId);
        }
        inspectionSchematicRepository.deleteByInspectionId(inspectionId);
    }
}
