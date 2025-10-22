package com.kirus.server_transformer.dtos;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AnnotationSaveRequest {
    private Long imageId;
    private FeedbackData feedback;
    
    @Data
    public static class FeedbackData {
        private List<AnnotationData> annotations;
        private List<AnnotationData> added;
        private List<AnnotationData> edited;
        private List<AnnotationData> deleted;
        private MetadataData metadata;
    }
    
    @Data
    public static class AnnotationData {
        private String id;
        private Integer x;
        private Integer y;
        private Integer width;
        private Integer height;
        private String label;
        private String status;
        private String createdAt;
        private String createdBy;
        private String updatedAt;
        private String updatedBy;
        private Double confidence;
        private Map<String, Object> metadata;
    }
    
    @Data
    public static class MetadataData {
        private String userId;
        private String timestamp;
        private String imageId;
        private String transformerId;
        private Integer totalAnnotations;
        private Integer userModifications;
    }
}
