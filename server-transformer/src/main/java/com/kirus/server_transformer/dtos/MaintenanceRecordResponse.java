package com.kirus.server_transformer.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MaintenanceRecordResponse {

    private Long id;
    private Long inspectionId;
    private String inspectionNo;

    // Inspector Information
    private String inspectorName;
    private String supervisedBy;
    private LocalDateTime jobStartedAt;
    private LocalDateTime jobCompletedAt;

    // Baseline Imaging Info
    private String baselineIrNo;
    private String baselineCondition;

    // Engineer Notes
    private String findingsSummary;
    private String recommendations;

    // Status
    private Boolean isFinalized;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Embedded Electrical Readings
    private List<ElectricalReadingResponse> electricalReadings;
}

