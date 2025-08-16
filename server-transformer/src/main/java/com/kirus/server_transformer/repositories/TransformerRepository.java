package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransformerRepository extends JpaRepository<Transformer, Long> {
    Optional<Transformer> findByTransformerId(String transformerId);
}
