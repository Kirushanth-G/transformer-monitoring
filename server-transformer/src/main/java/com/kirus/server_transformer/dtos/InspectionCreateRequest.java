package com.kirus.server_transformer.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InspectionCreateRequest {
    private String branch;
    private String transformerId;
    private LocalDateTime inspectedAt;
}
