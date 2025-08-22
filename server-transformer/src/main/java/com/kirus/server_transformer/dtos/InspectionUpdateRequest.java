package com.kirus.server_transformer.dtos;

import lombok.Data;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;

@Data
public class InspectionUpdateRequest {
    private String inspectionNo;
    private String transformerId;
    private String branch;
    private LocalDateTime inspectedAt;
    private LocalDateTime maintenanceAt;
    private String status;
}
