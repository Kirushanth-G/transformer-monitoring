package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    int countByTransformerId(Long id);
}
