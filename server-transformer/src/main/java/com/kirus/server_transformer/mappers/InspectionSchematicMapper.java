package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.InspectionSchematicRequest;
import com.kirus.server_transformer.dtos.InspectionSchematicResponse;
import com.kirus.server_transformer.entities.InspectionSchematic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface InspectionSchematicMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inspection", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    InspectionSchematic toEntity(InspectionSchematicRequest request);

    @Mapping(source = "inspection.id", target = "inspectionId")
    InspectionSchematicResponse toResponse(InspectionSchematic entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inspection", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(InspectionSchematicRequest request, @MappingTarget InspectionSchematic entity);
}

