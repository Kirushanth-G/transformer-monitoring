package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.AnomalyDetectionDto;
import com.kirus.server_transformer.dtos.ThermalAnalysisResponse;
import com.kirus.server_transformer.entities.AnomalyDetection;
import com.kirus.server_transformer.entities.ThermalAnalysis;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ThermalAnalysisMapper {

    @Mapping(target = "maintenanceImageId", source = "maintenanceImage.id")
    @Mapping(target = "maintenanceImageUrl", source = "maintenanceImage.imageUrl", qualifiedByName = "generatePresignedUrl")
    @Mapping(target = "baselineImageId", source = "baselineImage.id")
    @Mapping(target = "baselineImageUrl", source = "baselineImage.imageUrl", qualifiedByName = "generatePresignedUrl")
    @Mapping(target = "equipmentId", source = "equipment.id")
    @Mapping(target = "detections", source = "detections")
    @Mapping(target = "totalDetections", expression = "java(analysis.getDetections() != null ? analysis.getDetections().size() : 0)")
    @Mapping(target = "criticalDetections", expression = "java(countCriticalDetections(analysis.getDetections()))")
    @Mapping(target = "warningDetections", expression = "java(countWarningDetections(analysis.getDetections()))")
    @Mapping(target = "annotatedImageUrl", ignore = true) // Set separately in service
    @Mapping(target = "hasUserAnnotations", ignore = true)
    @Mapping(target = "userAnnotations", ignore = true)
    ThermalAnalysisResponse toResponse(ThermalAnalysis analysis);

    List<ThermalAnalysisResponse> toResponseList(List<ThermalAnalysis> analyses);

    AnomalyDetectionDto toDto(AnomalyDetection detection);

    List<AnomalyDetectionDto> toDetectionDtoList(List<AnomalyDetection> detections);

    @Named("generatePresignedUrl")
    default String generatePresignedUrl(String imageUrl) {
        // This will be handled in the service layer
        return imageUrl;
    }

    default Integer countCriticalDetections(List<AnomalyDetection> detections) {
        if (detections == null) return 0;
        return (int) detections.stream().filter(AnomalyDetection::getIsCritical).count();
    }

    default Integer countWarningDetections(List<AnomalyDetection> detections) {
        if (detections == null) return 0;
        return detections.size() - countCriticalDetections(detections);
    }
}
