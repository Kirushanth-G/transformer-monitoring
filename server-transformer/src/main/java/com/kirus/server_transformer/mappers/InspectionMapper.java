package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.InspectionCreateRequest;
import com.kirus.server_transformer.dtos.InspectionDto;
import com.kirus.server_transformer.dtos.InspectionUpdateRequest;
import com.kirus.server_transformer.entities.Inspection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InspectionMapper {
    @Mapping(source = "transformerId", target = "transformer.transformerId")
    Inspection toEntity(InspectionCreateRequest request);

    @Mapping(source = "transformer.transformerId", target = "transformerId")
    InspectionDto toDto(Inspection entity);

    @Mapping(source = "transformerId", target = "transformer.transformerId")
    Inspection toEntity(InspectionUpdateRequest request);
}
