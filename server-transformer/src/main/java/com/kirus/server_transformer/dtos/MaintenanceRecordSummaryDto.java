package com.kirus.server_transformer.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MaintenanceRecordSummaryDto {

    private Long id;
    private Long inspectionId;
    private String inspectionNo;
    private String inspectorName;
    private String supervisedBy;
    private LocalDateTime jobStartedAt;
    private LocalDateTime jobCompletedAt;
    private Boolean isFinalized;
    private LocalDateTime createdAt;
}

