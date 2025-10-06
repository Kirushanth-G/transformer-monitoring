package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.ThermalAnalysis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ThermalAnalysisRepository extends JpaRepository<ThermalAnalysis, Long> {

    // Find analyses by equipment (transformer)
    List<ThermalAnalysis> findByEquipmentIdOrderByAnalysisTimestampDesc(Long equipmentId);

    // Find analyses by inspection ID
    List<ThermalAnalysis> findByInspectionIdOrderByAnalysisTimestampDesc(Long inspectionId);

    // Find analyses by maintenance image
    List<ThermalAnalysis> findByMaintenanceImageIdOrderByAnalysisTimestampDesc(Long maintenanceImageId);

    // Find analyses by overall assessment
    List<ThermalAnalysis> findByOverallAssessmentOrderByAnalysisTimestampDesc(ThermalAnalysis.AssessmentType assessment);

    // Find analyses within date range
    List<ThermalAnalysis> findByAnalysisTimestampBetweenOrderByAnalysisTimestampDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    // Find analyses by equipment and date range
    @Query("SELECT ta FROM ThermalAnalysis ta WHERE ta.equipment.id = :equipmentId " +
           "AND ta.analysisTimestamp BETWEEN :startDate AND :endDate " +
           "ORDER BY ta.analysisTimestamp DESC")
    List<ThermalAnalysis> findByEquipmentAndDateRange(
            @Param("equipmentId") Long equipmentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find latest analysis for equipment
    Optional<ThermalAnalysis> findFirstByEquipmentIdOrderByAnalysisTimestampDesc(Long equipmentId);

    // Find analyses with critical detections
    @Query("SELECT DISTINCT ta FROM ThermalAnalysis ta " +
           "JOIN ta.detections ad WHERE ad.isCritical = true " +
           "ORDER BY ta.analysisTimestamp DESC")
    List<ThermalAnalysis> findAnalysesWithCriticalDetections();

    // Count analyses by assessment type
    Long countByOverallAssessment(ThermalAnalysis.AssessmentType assessment);

    // Page-based queries for large datasets
    Page<ThermalAnalysis> findByEquipmentIdOrderByAnalysisTimestampDesc(Long equipmentId, Pageable pageable);

    Page<ThermalAnalysis> findByOverallAssessmentOrderByAnalysisTimestampDesc(
            ThermalAnalysis.AssessmentType assessment, Pageable pageable);
}
