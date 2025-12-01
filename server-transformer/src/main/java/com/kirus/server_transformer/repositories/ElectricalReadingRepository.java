package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.ElectricalReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ElectricalReadingRepository extends JpaRepository<ElectricalReading, Long> {

    // Find all electrical readings by maintenance record ID
    List<ElectricalReading> findByMaintenanceRecordId(Long maintenanceRecordId);

    // Find a specific reading by maintenance record and stage
    Optional<ElectricalReading> findByMaintenanceRecordIdAndReadingStage(
            Long maintenanceRecordId,
            String readingStage
    );

    // Find all readings by stage across all maintenance records
    List<ElectricalReading> findByReadingStage(String readingStage);

    // Check if a reading exists for a specific stage
    boolean existsByMaintenanceRecordIdAndReadingStage(Long maintenanceRecordId, String readingStage);

    // Delete all readings for a maintenance record
    void deleteByMaintenanceRecordId(Long maintenanceRecordId);
}

