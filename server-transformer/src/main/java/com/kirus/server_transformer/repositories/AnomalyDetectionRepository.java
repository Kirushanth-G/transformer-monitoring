package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.AnomalyDetection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnomalyDetectionRepository extends JpaRepository<AnomalyDetection, Long> {

    // Find detections by analysis ID
    List<AnomalyDetection> findByAnalysisIdOrderByConfidenceDesc(Long analysisId);

    // Find critical detections
    List<AnomalyDetection> findByIsCriticalTrueOrderByConfidenceDesc();

    // Find detections by label
    List<AnomalyDetection> findByLabelContainingIgnoreCaseOrderByConfidenceDesc(String label);

    // Find detections by severity level
    List<AnomalyDetection> findBySeverityLevelOrderByConfidenceDesc(AnomalyDetection.SeverityLevel severityLevel);

    // Count detections by analysis
    Long countByAnalysisId(Long analysisId);

    // Count critical detections by analysis
    Long countByAnalysisIdAndIsCriticalTrue(Long analysisId);

    // Get detection statistics
    @Query("SELECT ad.label, COUNT(ad), AVG(ad.confidence) FROM AnomalyDetection ad " +
           "WHERE ad.analysis.id = :analysisId GROUP BY ad.label")
    List<Object[]> getDetectionStatsByAnalysis(@Param("analysisId") Long analysisId);

    // Find high confidence detections
    @Query("SELECT ad FROM AnomalyDetection ad WHERE ad.confidence >= :minConfidence " +
           "ORDER BY ad.confidence DESC")
    List<AnomalyDetection> findHighConfidenceDetections(@Param("minConfidence") Double minConfidence);
}
