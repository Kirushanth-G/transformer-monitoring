package com.kirus.server_transformer.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserAnnotationDto {
    private Long id;
    private Long imageId;
    private String bb; // JSON string: {"x": int, "y": int, "width": int, "height": int, "label": "string"}
    private LocalDateTime timestamp;
    private String userId;
    private LocalDateTime createdAt;
}
