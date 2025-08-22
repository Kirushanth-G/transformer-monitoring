package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    int countByTransformerId(Long id);

    @Query("SELECT MAX(CAST(SUBSTRING(i.inspectionNo, 6) AS int)) FROM Inspection i WHERE i.transformer.id = :transformerId")
    Integer findMaxInspectionNoByTransformerId(@Param("transformerId") Long transformerId);
}