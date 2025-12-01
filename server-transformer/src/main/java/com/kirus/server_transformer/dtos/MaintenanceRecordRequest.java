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
public class MaintenanceRecordRequest {

    private Long inspectionId;

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

    // Optional: Include electrical readings in the same request
    private List<ElectricalReadingRequest> electricalReadings;
}

