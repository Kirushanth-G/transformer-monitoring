package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.Transformer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface TransformerRepository extends JpaRepository<Transformer, Long> {
    Optional<Transformer> findByTransformerId(String transformerId);

    @Query("SELECT t FROM Transformer t ORDER BY CAST(SUBSTRING(t.transformerId, 2) AS integer) ASC")
    Page<Transformer> findAllOrderByTransformerIdAsNumber(Pageable pageable);

    @Query("SELECT t FROM Transformer t ORDER BY CAST(SUBSTRING(t.transformerId, 2) AS integer) DESC")
    Page<Transformer> findAllOrderByTransformerIdDesc(Pageable pageable);
}
