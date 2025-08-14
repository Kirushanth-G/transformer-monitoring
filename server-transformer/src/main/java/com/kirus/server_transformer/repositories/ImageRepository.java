package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Long> {
}
