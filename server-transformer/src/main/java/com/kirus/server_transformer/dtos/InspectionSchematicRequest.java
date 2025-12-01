package com.kirus.server_transformer.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class InspectionSchematicRequest {

    private Long inspectionId;

    // JSONB diagram state
    // Example: {"lightning_arresters": {"status": "OK", "is_checked": true}, ...}
    private String diagramState;
}

