package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dto.InspectionImageDTO;
import com.kirus.server_transformer.entities.InspectionImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InspectionImageMapper {

    @Mapping(source = "inspection.id", target = "inspectionId")
    InspectionImageDTO toDTO(InspectionImage inspectionImage);
}
