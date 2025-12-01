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
public class InspectionSchematicResponse {

    private Long id;
    private Long inspectionId;
    private String diagramState;
    private LocalDateTime updatedAt;
}

