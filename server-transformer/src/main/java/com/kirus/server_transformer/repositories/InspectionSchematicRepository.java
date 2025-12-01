package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.InspectionSchematic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InspectionSchematicRepository extends JpaRepository<InspectionSchematic, Long> {

    // Find schematic by inspection ID (one-to-one relationship)
    Optional<InspectionSchematic> findByInspectionId(Long inspectionId);

    // Check if a schematic exists for an inspection
    boolean existsByInspectionId(Long inspectionId);

    // Delete schematic by inspection ID
    void deleteByInspectionId(Long inspectionId);
}

