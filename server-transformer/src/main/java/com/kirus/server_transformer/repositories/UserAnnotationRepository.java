package com.kirus.server_transformer.repositories;

import com.kirus.server_transformer.entities.UserAnnotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAnnotationRepository extends JpaRepository<UserAnnotation, Long> {
    
    List<UserAnnotation> findByImageId(Long imageId);
    
    List<UserAnnotation> findByImageIdAndUserId(Long imageId, String userId);
    
    @Modifying
    @Query("DELETE FROM UserAnnotation ua WHERE ua.image.id = :imageId")
    void deleteByImageId(@Param("imageId") Long imageId);
    
    @Modifying
    @Query("DELETE FROM UserAnnotation ua WHERE ua.image.id = :imageId AND ua.userId = :userId")
    void deleteByImageIdAndUserId(@Param("imageId") Long imageId, @Param("userId") String userId);
}
