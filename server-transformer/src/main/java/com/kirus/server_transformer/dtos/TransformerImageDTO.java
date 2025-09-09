package com.kirus.server_transformer.dtos;

import java.time.LocalDateTime;

public class TransformerImageDTO {
    private Long id;
    private Long transformerId;
    private String imageUrl;
    private String uploaderName;
    private LocalDateTime uploadTime;

    // Constructors
    public TransformerImageDTO() {}

    public TransformerImageDTO(Long id, Long transformerId, String imageUrl, String uploaderName, LocalDateTime uploadTime) {
        this.id = id;
        this.transformerId = transformerId;
        this.imageUrl = imageUrl;
        this.uploaderName = uploaderName;
        this.uploadTime = uploadTime;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTransformerId() { return transformerId; }
    public void setTransformerId(Long transformerId) { this.transformerId = transformerId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }

    public LocalDateTime getUploadTime() { return uploadTime; }
    public void setUploadTime(LocalDateTime uploadTime) { this.uploadTime = uploadTime; }
}

