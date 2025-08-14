package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransformerRepository extends JpaRepository<Transformer, Long> {
}
