package com.kirus.server_transformer.mappers;

import com.kirus.server_transformer.dtos.ElectricalReadingRequest;
import com.kirus.server_transformer.dtos.ElectricalReadingResponse;
import com.kirus.server_transformer.entities.ElectricalReading;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ElectricalReadingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "maintenanceRecord", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ElectricalReading toEntity(ElectricalReadingRequest request);

    ElectricalReadingResponse toResponse(ElectricalReading entity);
}

