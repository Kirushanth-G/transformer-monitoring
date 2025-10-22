package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.InspectionDto;
import com.kirus.server_transformer.dtos.TransformerDto;
import com.kirus.server_transformer.dtos.TransformerWithInspectionsDto;
import com.kirus.server_transformer.entities.Transformer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {InspectionMapper.class})
public interface TransformerMapper {
    // Entity to DTO conversion
    TransformerDto toDto(Transformer transformer);
    
    // DTO to Entity conversion
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "transformerImages", ignore = true)
    @Mapping(target = "inspections", ignore = true)
    Transformer toEntity(TransformerDto transformerDto);

    // Transformer with inspections DTO conversion - single parameter method
    @Mapping(source = "inspections", target = "inspections")
    TransformerWithInspectionsDto toDtoWithInspections(Transformer transformer);
}
