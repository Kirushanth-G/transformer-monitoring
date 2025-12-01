package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.MaintenanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {

    // Find maintenance record by inspection ID
    Optional<MaintenanceRecord> findByInspectionId(Long inspectionId);

    // Find all maintenance records by finalization status
    List<MaintenanceRecord> findByIsFinalized(Boolean isFinalized);

    // Find all maintenance records with pagination and finalization filter
    Page<MaintenanceRecord> findByIsFinalized(Boolean isFinalized, Pageable pageable);

    // Find maintenance records by inspector name
    List<MaintenanceRecord> findByInspectorNameContainingIgnoreCase(String inspectorName);

    // Find maintenance records by supervisor
    List<MaintenanceRecord> findBySupervisedByContainingIgnoreCase(String supervisedBy);

    // Check if a maintenance record exists for an inspection
    boolean existsByInspectionId(Long inspectionId);

    // Get all maintenance records for a specific transformer
    @Query("SELECT mr FROM MaintenanceRecord mr WHERE mr.inspection.transformer.id = :transformerId")
    List<MaintenanceRecord> findByTransformerId(@Param("transformerId") Long transformerId);

    // Get all maintenance records with their electrical readings eagerly loaded
    @Query("SELECT DISTINCT mr FROM MaintenanceRecord mr LEFT JOIN FETCH mr.electricalReadings WHERE mr.id = :id")
    Optional<MaintenanceRecord> findByIdWithReadings(@Param("id") Long id);
}

