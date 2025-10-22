package com.kirus.server_transformer.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kirus.server_transformer.dtos.AnnotationSaveRequest;
import com.kirus.server_transformer.dtos.UserAnnotationDto;
import com.kirus.server_transformer.entities.InspectionImage;
import com.kirus.server_transformer.entities.UserAnnotation;
import com.kirus.server_transformer.mappers.UserAnnotationMapper;
import com.kirus.server_transformer.repositories.InspectionImageRepository;
import com.kirus.server_transformer.repositories.UserAnnotationRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class UserAnnotationService {

    private final UserAnnotationRepository userAnnotationRepository;
    private final InspectionImageRepository inspectionImageRepository;
    private final UserAnnotationMapper userAnnotationMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public Map<String, Object> saveAnnotations(Long inspectionId, AnnotationSaveRequest request) {
        Long imageId = request.getImageId();
        AnnotationSaveRequest.FeedbackData feedback = request.getFeedback();
        
        // Validate image exists
        Optional<InspectionImage> imageOpt = inspectionImageRepository.findById(imageId);
        if (imageOpt.isEmpty()) {
            throw new IllegalArgumentException("Image not found with id: " + imageId);
        }
        
        InspectionImage image = imageOpt.get();
        
        // Clear existing annotations for this image
        userAnnotationRepository.deleteByImageId(imageId);
        
        int savedCount = 0;
        
        // Save all non-deleted annotations
        if (feedback.getAnnotations() != null) {
            for (AnnotationSaveRequest.AnnotationData annotationData : feedback.getAnnotations()) {
                if (!"deleted".equals(annotationData.getStatus())) {
                    UserAnnotation annotation = createUserAnnotationFromData(annotationData, image, feedback.getMetadata());
                    userAnnotationRepository.save(annotation);
                    savedCount++;
                }
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("saved", true);
        response.put("count", savedCount);
        response.put("imageId", imageId);
        response.put("inspectionId", inspectionId);
        response.put("userId", feedback.getMetadata() != null ? feedback.getMetadata().getUserId() : "unknown");
        
        return response;
    }

    public List<UserAnnotationDto> getAnnotationsByImageId(Long imageId) {
        List<UserAnnotation> annotations = userAnnotationRepository.findByImageId(imageId);
        return annotations.stream()
                .map(userAnnotationMapper::toDto)
                .toList();
    }

    @Transactional
    public void deleteAnnotationsByImageId(Long imageId) {
        userAnnotationRepository.deleteByImageId(imageId);
    }

    private UserAnnotation createUserAnnotationFromData(
            AnnotationSaveRequest.AnnotationData data, 
            InspectionImage image, 
            AnnotationSaveRequest.MetadataData metadata) {
        
        UserAnnotation annotation = new UserAnnotation();
        annotation.setImage(image);
        annotation.setInspection(image.getInspection());
        // Don't set type - removed from entity
        annotation.setUserId(metadata != null ? metadata.getUserId() : "unknown");
        annotation.setTimestamp(LocalDateTime.now());
        
        // Store label inside the bb JSON
        try {
            Map<String, Object> bb = new HashMap<>();
            bb.put("x", data.getX());
            bb.put("y", data.getY());
            bb.put("width", data.getWidth());
            bb.put("height", data.getHeight());
            bb.put("label", data.getLabel()); // Store label in JSON
            
            String bbJson = objectMapper.writeValueAsString(bb);
            annotation.setBb(bbJson);
        } catch (Exception e) {
            log.error("Failed to serialize bounding box to JSON", e);
            throw new RuntimeException("Failed to serialize bounding box", e);
        }
        
        return annotation;
    }
}
