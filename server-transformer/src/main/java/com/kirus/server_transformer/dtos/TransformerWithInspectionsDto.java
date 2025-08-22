package com.kirus.server_transformer.dtos;

import lombok.Data;

import java.util.List;

@Data
public class TransformerWithInspectionsDto {
    private Long id;
    private String transformerId;
    private String location;
    private String type;
    private String poleNo;
    private List<InspectionDto> inspections;
}
