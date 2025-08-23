package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.TransformImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransformerImageRepository extends JpaRepository<TransformImage, Long> {
    List<TransformImage> findByTransformerId(Long transformerId);
}
