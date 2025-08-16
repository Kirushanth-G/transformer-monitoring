package com.kirus.server_transformer.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InspectionDto {
    private Long id;
    private String inspectionNo;
    private LocalDateTime inspectedAt;
    private LocalDateTime maintenanceAt;
    private String status;
    private String branch;
}
