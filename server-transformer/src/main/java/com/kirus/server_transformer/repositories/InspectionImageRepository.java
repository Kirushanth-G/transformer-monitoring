package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.InspectionImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionImageRepository extends JpaRepository<InspectionImage, Long> {
    List<InspectionImage> findByInspectionId(Long inspectionId);
}
