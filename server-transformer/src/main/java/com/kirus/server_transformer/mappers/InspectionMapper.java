package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.InspectionCreateRequest;
import com.kirus.server_transformer.entities.Inspection;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InspectionMapper {
    Inspection toEntity(InspectionCreateRequest request);
}
