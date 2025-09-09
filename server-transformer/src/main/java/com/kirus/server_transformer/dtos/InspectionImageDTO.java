package com.kirus.server_transformer.dtos;

import java.time.LocalDateTime;

public class InspectionImageDTO {
    private Long id;
    private Long inspectionId;
    private String imageUrl;
    private String environmentalCondition;
    private String uploaderName;
    private LocalDateTime uploadTime;

    // Constructors
    public InspectionImageDTO() {}

    public InspectionImageDTO(Long id, Long inspectionId, String imageUrl, String environmentalCondition, String uploaderName, LocalDateTime uploadTime) {
        this.id = id;
        this.inspectionId = inspectionId;
        this.imageUrl = imageUrl;
        this.environmentalCondition = environmentalCondition;
        this.uploaderName = uploaderName;
        this.uploadTime = uploadTime;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInspectionId() { return inspectionId; }
    public void setInspectionId(Long inspectionId) { this.inspectionId = inspectionId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getEnvironmentalCondition() { return environmentalCondition; }
    public void setEnvironmentalCondition(String environmentalCondition) { this.environmentalCondition = environmentalCondition; }

    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }

    public LocalDateTime getUploadTime() { return uploadTime; }
    public void setUploadTime(LocalDateTime uploadTime) { this.uploadTime = uploadTime; }
}

